const pgPromise = require('pg-promise')();
const fakeUserData = require('../src/data/fakeUsers.json');
const config = require('config');
const Pino = require("pino");
const { SSM } = require("aws-sdk");
const ssm = new SSM({region: config.get("ssm.region")});
const logger = Pino({level: "info"});


const seedDB = (db) => {
  return Promise.all(fakeUserData.map(user => {
    return db.tx('insert_user_tx', tx => 
      tx.one(
        'insert into a_schema.users (username) values ($1) returning id',
        [user.login.username])
      .then(({id}) => 
        tx.none(
          'insert into a_schema.locations (user_id, country) values ($1, $2)',
          [id, user.location.country]
        )
      )
    )
  }));
}

if(process.env.FLYWAY_ENV !== "local") {
  Promise.all([
    ssm.getParameter({Name: `/demo/${process.env.FLYWAY_ENV}/rds/demo-db-endpoint`, WithDecryption: false}).promise().then(resp => resp.Parameter.Value),
    ssm.getParameter({Name: `/demo/${process.env.FLYWAY_ENV}/rds/demo-db-username`, WithDecryption: true}).promise().then(resp => resp.Parameter.Value),
    ssm.getParameter({Name: `/demo/${process.env.FLYWAY_ENV}/rds/demo-db-password`, WithDecryption: true}).promise().then(resp => resp.Parameter.Value),
    ssm.getParameter({Name: `/demo/${process.env.FLYWAY_ENV}/rds/demo-db-name`, WithDecryption: false}).promise().then(resp => resp.Parameter.Value)
  ]).then(([ host, user, password, database ]) => ({
    host: host.split(':')[0],
    user,
    password,
    port: config.get("rds.dbPort"),
    database
  }))
  .catch(err => {
    logger.error("Failed to generate db config")
    logger.error(err)
  })
  .then((dbConfig) => {
    const db = pgPromise(dbConfig);
    seedDB(db)
      .then(() => logger.info("db seeded"))
      .catch((err) => logger.error(err))
  })
} else {
  const dbConfig = {
    host: "localhost",
    user: "notadmin",
    password: "notpassword",
    port: 5432,
    database: "test"
  }
  const db = pgPromise(dbConfig);
  seedDB(db)
    .then(() => logger.info("db seeded"))
    .catch((err) => logger.error(err))
}

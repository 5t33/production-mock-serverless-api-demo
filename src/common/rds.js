if(!process.env.FLYWAY_ENV ) {
  const capturePostgres = require('aws-xray-sdk-postgres');
  capturePostgres(require('pg'));
}
const pgPromise = require('pg-promise')();

module.exports.dbConfig = ({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 6000
})

module.exports.db = pgPromise(module.exports.dbConfig);

const AWSXRay = require('../../common/AWSXRay');
const config = require('config');
const { ApiError } = require('../../common/utils');

module.exports.functionThatRejectsWith400 = () => 
  AWSXRay.captureAsyncFunc("functionThatRejectsWith400", async subseg => {
    subseg.close();
    return Promise.reject(new ApiError(400, [
      "wow you messed up, huh?", 
      "Looks like somebody didn't read the documentation."
    ]))
  });

module.exports.functionThatRejects = () => 
  AWSXRay.captureAsyncFunc("functionThatRejects", async subseg => {
    try {
      throw new Error("Oh No");
    } catch(err) {
      subseg.addError(err);
      subseg.close()
      return Promise.reject(err)
    } finally {
      subseg.close();
    }
  });

module.exports.functionThatResolves = () => 
  AWSXRay.captureAsyncFunc("functionThatResolves", async subseg => {
    subseg.close();
    return Promise.resolve({so: "much", data: "wow"})
  });


module.exports.getUsersRDS = async (db) => 
  AWSXRay.captureAsyncFunc("getUsers", async subseg => {
    try{
      const res = await db.any('select a_schema.users.id, username, country from a_schema.users join a_schema.locations on a_schema.users.id = a_schema.locations.user_id;');
      // Formatting this to whay dynamo was returning to re-use the send data function
      const dynamoFormat = {
        Items: res.map(res => ({
          login: {
            M:{
              username: {
                S: res.username
              }
            }
          },
          location:{
            M:{
              country: {
                S: res.country
              }
            }
          }
        }))
      }
      subseg.close();
      return Promise.resolve(dynamoFormat)
    } catch(err) {
      subseg.addError(err);   
      subseg.close();
      return Promise.reject(err);
    }
  });

module.exports.getUsers = async (dynamodb) => 
  AWSXRay.captureAsyncFunc("getUsers", async subseg => {
    try{
      const results = await dynamodb.scan({
        TableName: config.get("dynamodb.tableName")
      }).promise();
      subseg.close();
      return Promise.resolve(results)
    } catch(err) {
      subseg.addError(err);   
      subseg.close();
      return Promise.reject(err);
    }
  });

module.exports.sendUsers = (logger, users, sns) => {
  return AWSXRay.captureAsyncFunc("SendUsers", async subseg => {
    try {
      logger.info(users);
      await Promise.all(users.Items.map(user => sns.publish({
        Message: JSON.stringify(user),
        TopicArn: process.env.TopicArn
      }).promise()));
    } catch(err) {
      subseg.addError(err);   
      subseg.close();
      return Promise.reject(err);
    }
    subseg.close();
    return Promise.resolve({ message: "All done" })
  });
} 
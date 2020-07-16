const AWSXRay = require('aws-xray-sdk-core')
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

module.exports.getUsers = async (dynamodb) => 
  AWSXRay.captureAsyncFunc("functionThatResolves", async subseg => {
    try{
      console.log(process.env.TopicArn)
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

module.exports.sendUsers = (users, sns) => {
  return AWSXRay.captureAsyncFunc("functionThatResolves", async subseg => {
    try {
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
const AWSXRay = require('aws-xray-sdk-core')
const { ApiError } = require('./utils');

module.exports.functionThatRejectsWith400 = () => 
  AWSXRay.captureFunc.captureAsyncFunc("functionThatRejectsWith400", async subseg => {
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
  AWSXRay.captureFunc.captureAsyncFunc("functionThatRejects", async subseg => {
    subseg.close();
    Promise.resolve({so: "much", data: "wow"})
  });
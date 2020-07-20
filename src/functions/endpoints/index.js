const AWSXRay = require('aws-xray-sdk-core')
const { dynamodb } = require('../../common/dynamodb')
const { sns } = require('../../common/sns');
const Logger = require('../../common/logger');
const { handleError, handleResp, ApiError } = require('../../common/utils');
const { functionThatRejects, functionThatResolves, getUsers, getUsersRDS, sendUsers, functionThatRejectsWith400 } = require('./anotherFile');
const logger = Logger("trace");
const { db } = require('../../common/rds');


module.exports.handler = async ( event, context) => {
  const segment = AWSXRay.getSegment();
  return AWSXRay.captureAsyncFunc('handler', async subSegment => {
    const log = logger.child({
      requestId: context.awsRequestId,
    });
    subSegment.addMetadata("a", "b");
    
    if(event.path === "/health_check" && event.httpMethod === "GET") {
      return functionThatResolves()
        .then(handleResp(segment))
        .catch(error => handleError(log, error))
    } else if(event.path === "/send_data" && event.httpMethod === "GET") {
      return getUsers(dynamodb)
        .then(results => sendUsers(results, sns))
        .then(handleResp(subSegment))
        .catch(handleError(subSegment, log))
    } else if(event.path === "/send_data_rds" && event.httpMethod === "GET") {
      return getUsersRDS(db)
        .then(results => sendUsers(results, sns))
        .then(handleResp(subSegment))
        .catch(handleError(subSegment, log))
    } else if (event.path === "/respond_400" && event.httpMethod === "POST") {
      return functionThatRejectsWith400()
        .then(handleResp(subSegment))
        .catch(handleError(subSegment, log))
    } else if(event.path === "/throw_error" && event.httpMethod === "GET") {
      return functionThatRejects()
        .then(handleResp(subSegment))
        .catch(handleError(subSegment, log))
    } else {
      return handleError(subSegment, log)(new ApiError(404, "404 Not Found"));
    }
  }, segment);
}
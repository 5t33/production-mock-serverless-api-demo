const AWSXRay = require('aws-xray-sdk-core')
const Logger = require('./logger');
const { handleError, handleResp, ApiError } = require('./utils');
const { functionThatRejects, functionThatResolves, functionThatRejectsWith400 } = require('./anotherFile');
const logger = Logger("trace");

module.exports.handler = async ( event, context) => {
  const segment = AWSXRay.getSegment();
  return AWSXRay.captureAsyncFunc('handler', async subSegment => {
    logger.child({
      requestId: context.awsRequestId,
    });
    subSegment.addMetadata("a", "b");
    if(event.path === "/health_check" && event.httpMethod === "GET") {
      return functionThatResolves()
        .then(handleResp(subSegment))
        .catch(handleError(subSegment, logger))
    } else if (event.path === "/respond_400" && event.httpMethod === "POST") {
      return functionThatRejectsWith400()
        .then(handleResp(subSegment))
        .catch(handleError(subSegment, logger))
    } else if(event.path === "/throw_error" && event.httpMethod === "GET") {
      return functionThatRejects()
        .then(handleResp(subSegment))
        .catch(handleError(subSegment, logger))
    } else {
      return handleError(subSegment, logger)(new ApiError(404, "404 Not Found"));
    }
  }, segment);
}
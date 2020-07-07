const Logger = require('./logger');
const { handleError, handleResp, ApiError } = require('./utils');
const { functionThatRejects, functionThatResolves, functionThatRejectsWith400 } = require('./anotherFile');
const logger = Logger("trace");

module.exports.handler = async ( event, context) => {
   logger.child({
     requestId: context.awsRequestId,
   });

  if(event.requestPath === "/health_check" && event.method === "GET") {
    return functionThatResolves()
      .then(handleResp)
      .catch(error => handleError(logger, error))
  } else if (event.requestPath === "/respond_400" && event.method === "POST") {
    return functionThatRejectsWith400()
      .then(handleResp)
      .catch(error => handleError(logger, error))
  } else if(event.requestPath === "/throw_error" && event.method === "GET") {
    return functionThatRejects()
    .then(handleResp)
    .catch(error => handleError(logger, error))
  } else {
    return handleError(logger, new ApiError(404, "404 Not Found"));
  }
}
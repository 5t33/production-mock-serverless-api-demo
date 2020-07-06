const Logger = require('./logger');
const { handleError, handleResp, ApiError } = require('./utils');
const { functionThatRejects, functionThatResolves, functionThatRejectsWith400 } = require('./anotherFile');
const logger = Logger("trace");

module.exports.handler = async ( event, context) => {
   logger.child({
     requestId: context.awsRequestId,
   });

  if(event.path === "/health_check" && event.httpMethod === "GET") {
    return functionThatResolves()
      .then(handleResp)
      .catch(error => handleError(logger, error))
  } else if (event.path === "/respond_400" && event.httpMethod === "POST") {
    return functionThatRejectsWith400()
      .then(handleResp)
      .catch(error => handleError(logger, error))
  } else if(event.path === "/throw_error" && event.httpMethod === "GET") {
    return functionThatRejects()
    .then(handleResp)
    .catch(error => handleError(logger, error))
  } else {
    return handleError(logger, new ApiError(404, "404 Not Found"));
  }

}
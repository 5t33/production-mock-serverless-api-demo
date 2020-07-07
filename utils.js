class ApiError extends Error {
  statusCode;
  body;
  constructor(statusCode, body) {
    super();
    if(Array.isArray(body)) {
      this.body = {
        Errors: body
      }
    } else {
      this.body = body;
    }
    this.statusCode = statusCode;
  }
}

module.exports.ApiError = ApiError

const formatApiError = (error) => JSON.stringify({
  isBase64Encoded: false,
  statusCode: error.statusCode,
  headers: {
    "Content-Type": typeof error.body === "string" ? "text/html" : "application/json",
  },
  body: error.body
});
 
module.exports.handleError = (logger, error ) => { 
  const oldStack = error.stack;
  if (error instanceof ApiError) {
    error.message = formatApiError(error);
    error.stack = oldStack
    return Promise.reject(response)
  } else {
    logger.error("Internal Server Error: ", error);
    error.message = formatApiError(new ApiError(500, "Internal Server Error"));
    error.stack = oldStack
    return Promise.reject(error);
  }
};

module.exports.handleResp = (
  body
) => ({
  isBase64Encoded: false,
  statusCode: 200,
  headers: {
    "Content-Type": typeof body === "string" ? "text/html" : "application/json",
  },
  body
});

 
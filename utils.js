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
  if (error instanceof ApiError) {
    const response = formatApiError(error);
    return Promise.reject(response)
  } else {
  
    logger.error("Internal Server Error: ", error);
    const response = formatApiError(new ApiError(500, "Internal Server Error"));
    return Promise.reject(response);
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

 
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

const formatApiError = (error) => ({
  isBase64Encoded: false,
  statusCode: error.statusCode,
  headers: {
    "Content-Type": typeof error.body === "string" ? "text/html" : "application/json",
  },
  body: typeof error.body === "string" ? error.body : JSON.stringify(error.body)
});
 
module.exports.handleError = (segment, logger) => error => { 
  if (error instanceof ApiError) {
    const response = formatApiError(error);
    segment.close();
    return Promise.resolve(response)
  } else {
    logger.error("Internal Server Error: ", error);
    segment.close();
    return Promise.reject(error);
  }
};

module.exports.handleResp = (segment) => (
  body
) => {
  segment.close();
  return Promise.resolve({
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      "Content-Type": typeof body === "string" ? "text/html" : "application/json",
    },
    body: JSON.stringify(body)
  });
};

 
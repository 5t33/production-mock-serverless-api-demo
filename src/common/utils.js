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

const formatApiError = (error) => 
  typeof error.body === "string" ? error.body : JSON.stringify(error.body)
 
module.exports.handleError = (segment, req, res) => (error) => { 
  if (error instanceof ApiError) {
    const response = formatApiError(error);
    segment.close();
    return res.set({
      "Content-Type": typeof error.body === "string" ? "text/html" : "application/json", 
      isBase64Encoded: false
    }).status(error.statusCode).send(response)
  } else {
    req.logger.error(error);
    segment.close();
    return Promise.reject(error);
  }
};

module.exports.handleResp = (segment, res) => (
  body
) => {
  segment.close();
  return res.set({
    isBase64Encoded: false,
    "Content-Type": typeof body === "string" ? "text/html" : "application/json"
  }).status(200).send(JSON.stringify(body));
};

 
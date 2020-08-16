const AWSXRay = require('aws-xray-sdk-core');
const xrayExpress = require('aws-xray-sdk-express');
const express = require("express");
const awsServerlessExpress = require('aws-serverless-express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const app = express();
const { dynamodb } = require('../../common/dynamodb')
const { sns } = require('../../common/sns');
const Logger = require('../../common/logger');
const { handleError, handleResp, ApiError } = require('../../common/utils');
const { functionThatRejects, getUsers, getUsersRDS, sendUsers, functionThatRejectsWith400 } = require('./anotherFile');
const logger = Logger("trace");
const { db } = require('../../common/rds');

app.use(xrayExpress.openSegment('handler'));

app.use(awsServerlessExpressMiddleware.eventContext())

app.use((req, res, next) => {
  console.log(req.apiGateway.context)
  req.logger =  logger.child({
    requestId: req.apiGateway.context.awsRequestId,
    traceId: process.env._X_AMZN_TRACE_ID
  });
  next();
});

app.get("/health_check", (req, res) => 
  AWSXRay.captureAsyncFunc('/health_check', async subSegment => {
    subSegment.close();
    return res.status(200).send("Status OK");
  }));

app.get("/send_data_rds", (req, res) => 
  AWSXRay.captureAsyncFunc('/send_data_rds', async subSegment => {
    return getUsersRDS(db)
      .then(results => sendUsers(req.logger,results, sns))
      .then(handleResp(subSegment, res))
      .catch(handleError(subSegment, req, res))
  }));

app.get("/send_data", (req, res) => 
  AWSXRay.captureAsyncFunc('/send_data', async subSegment => {
    return getUsers(dynamodb)
      .then(results => sendUsers(req.logger,results, sns))
      .then(handleResp(subSegment, res))
      .catch(handleError(subSegment, req, res))
  }));

app.post("/respond_400", (req, res) =>
  AWSXRay.captureAsyncFunc('/respond_400', async subSegment => {
    return functionThatRejectsWith400()
    .then(handleResp(subSegment, res))
    .catch(handleError(subSegment, req, res))
  }));

app.get("/throw_error", (req, res) =>
  AWSXRay.captureAsyncFunc('/throw_error', async subSegment => {
    return functionThatRejects()
    .then(handleResp(subSegment, res))
    .catch(handleError(subSegment, req, res))
  }));

app.use(xrayExpress.closeSegment());

const server = awsServerlessExpress.createServer(app)

module.exports.handler = async ( event, context) => {
  try {
    return await awsServerlessExpress.proxy(server, event, context, "PROMISE").promise 
  } catch(err) {
    return Promise.reject(err);
  }
}
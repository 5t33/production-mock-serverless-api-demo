const AWSXRay = require('aws-xray-sdk-core');
const Logger = require('./logger');

if(process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
  AWSXRay.setLogger(Logger('silent'));
}

module.exports = AWSXRay
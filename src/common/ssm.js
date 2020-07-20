const AWSXRay = require('aws-xray-sdk-core')
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
const config = require('config');

module.exports.SSM = new AWS.SSM({region: config.get("ssm.region")});

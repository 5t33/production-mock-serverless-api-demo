const AWSXRay = require('aws-xray-sdk-core')
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
const config = require('config');


const sns = new AWS.SNS({
  region: config.get("sns.region")
});

module.exports.sns = sns;
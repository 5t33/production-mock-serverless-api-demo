const AWSXRay = require('aws-xray-sdk-core');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
const config = require('config');

const isLocal = process.env.NODE_ENV === "local";
const dynamoConfig = isLocal ? ({
  region: config.get("dynamodb.region"),
  endpoint: "http://localhost:8000",
  accessKeyId: 'MOCK_ACCESS_KEY_ID',
  secretAccessKey: 'MOCK_SECRET_ACCESS_KEY',
}) :
({
  region: config.get("dynamodb.region"),
})

module.exports.dynamodb = new AWS.DynamoDB(dynamoConfig)
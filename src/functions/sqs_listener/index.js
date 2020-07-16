const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));
const axios = require('axios')
const Logger = require('../../common/logger');

const logger = Logger("trace");
const url = process.env.SlackEndpoint
module.exports.handler = async ( event, context ) => {

  const log = logger.child({
    requestId: context.awsRequestId,
  });
  if(event.Records) {
    log.info(event.records);
    await Promise.all(event.Records.map(async (record, indx )=> {
      const body = JSON.parse(record.body)
      return await axios.post(url, {
        "username": "SQS_Handler_Lambda",
        "text": `Hi I'm ${body.login.M.username.S} from ${body.location.M.country.S}`
      })
    }))
  } 
  return Promise.resolve("Done"); 
  
}
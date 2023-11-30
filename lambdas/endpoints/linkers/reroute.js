const AWS = require('aws-sdk');
const dynamoDb  = new AWS.DynamoDB.DocumentClient();
const Responses = require('../../common/API_Responses');
exports.handler = async (event) => {

    const shortCode = event.pathParameters.shortCode;
    
    try {

        const params = {
            TableName: 'links',
            Key: {
              'shortCode': shortCode,
          },
          };
    const data = await dynamoDb.get(params).promise();
    
      if (!data||!data.Item) {
        return Responses._404({ message: "Invalid short URL" });
        
      };    
      return Responses._200({ data });
     
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: error.message }),
      };
    };
    
};
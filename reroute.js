const AWS = require('aws-sdk');
const dynamoDb  = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    const shortCode = event.pathParameters.shortCode;
    
    try {

        const params = {
            TableName: 'links',
            Item: {
              shortCode,
             },
          };
    const data = await dynamoDb.get(params).promise();
    
      if (!data||!data.Item) {
        return  {
            statusCode: 404,
            body: JSON.stringify({message: "Invalid short URL"}),
          };
      };
    
      return {
        statusCode: 200,
            body: JSON.stringify(data),
        // statusCode: 302,
        // headers: {
        //   Location: data.Item.link,
        // },
        // body: '',
      };
    
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal server error' }),
      };
    };
    
};
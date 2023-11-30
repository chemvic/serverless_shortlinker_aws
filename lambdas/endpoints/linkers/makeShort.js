const AWS = require('aws-sdk');
const dynamoDb  = new AWS.DynamoDB.DocumentClient();
const axios = require('axios');
const Hashids = require('hashids');
const Responses = require('../../common/API_Responses');

let longLink='';
let shortLink='';

exports.handler = async (event) => {

  const {longLink}= JSON.parse(event.body);
// const userId =event.requestContext.authorizer;  

if (longLink==='') {
    return Responses._400({ message: 'Enter a valid URL' });
};

try {
  const isAvailable = await checkUrl(longLink);

if (!isAvailable) {
     return Responses._400({ message: 'Your URL is not valid' });
};  
} catch (error) {
    throw error;
};
  let hashids = new Hashids(longLink, 6);
  const id = hashids.encode(7, 4, 9);  

  try {
const params = {
    TableName: 'links',
    Item: {
      link: longLink,
      shortCode: id,

     },
  };

   const newLink =  await dynamoDb.put(params).promise();
  
  } catch (error) {
    throw error;
  };  

  shortLink = `http://localhost:3000/${id}`;

  return Responses._201({
       success: 'OK',
       shortLink: shortLink, });
  // {
  //   statusCode: 201,
  //   body: JSON.stringify({
  //     success: 'OK',
  //     shortLink: shortLink,
  //     // user_id: userId.id,
  //   }),
  // };
  };

  async function checkUrl(url) {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        return false;
    };
};
// строка для реализации console.log()
// npx sls logs -f "название функции"
const AWS = require('aws-sdk');
const dynamoDb  = new AWS.DynamoDB.DocumentClient();
const axios = require('axios');
const Hashids = require('hashids');

let longLink='';
let shortLink='';

exports.handler = async (event) => {
  console.log('event', event);

  const {longLink}= JSON.parse(event.body);
// const userId =event.requestContext.authorizer;  

if (longLink==='') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Enter a valid URL' }),
    };
};

try {
  const isAvailable = await checkUrl(longLink);

if (!isAvailable) {
     return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Your URL is not valid' }),
    };
};  
} catch (error) {
    throw error;
};

const params = {
  TableName: 'links',
  Item: {
    link: longLink,
   },
};

try {
 const data = await dynamoDb.get(params).promise(); 

  if (data||data.Item) {
    shortLink = `http://localhost:3000/${data.Item.shortCode}`;
  return  {
      statusCode: 200,
      body: JSON.stringify({shortLink: shortLink}),
    };
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

  return {
    statusCode: 201,
    body: JSON.stringify({
      success: 'OK',
      shortLink: shortLink,
      // user_id: userId.id,
    }),
  };
  };


  async function checkUrl(url) {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        return false;
    };
};
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'KiroFocusUserState';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Lambda handler for loading user state from DynamoDB
 * GET /state?userId=xxx
 */
exports.handler = async (event) => {
  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  try {
    // Extract userId from query parameters
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          error: 'Missing userId parameter'
        })
      };
    }

    // Get state from DynamoDB
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId }
    });

    const response = await docClient.send(command);

    // Return state or null for new users
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        state: response.Item?.state || null
      })
    };
  } catch (error) {
    console.error('Error loading state:', error);

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: 'Failed to load state'
      })
    };
  }
};

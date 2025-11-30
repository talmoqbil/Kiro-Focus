const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

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
 * Lambda handler for saving user state to DynamoDB
 * PUT /state with body: { userId, state }
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
    // Parse request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { userId, state } = body || {};

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          error: 'Missing userId in request body'
        })
      };
    }

    if (!state) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          error: 'Missing state in request body'
        })
      };
    }

    // Save state to DynamoDB with updatedAt timestamp
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        userId,
        state,
        updatedAt: Date.now()
      }
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true
      })
    };
  } catch (error) {
    console.error('Error saving state:', error);

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: 'Failed to save state'
      })
    };
  }
};

# Nimbus Backend

AWS Lambda functions and DynamoDB table for persisting user state without authentication.

## Overview

The backend provides two Lambda functions:
- **loadState**: Retrieves user state from DynamoDB
- **saveState**: Saves user state to DynamoDB

Users are identified by an anonymous UUID generated client-side and stored in localStorage.

---

## Quick Setup

### Prerequisites
- AWS CLI configured with appropriate credentials
- AWS account with permissions for Lambda, DynamoDB, API Gateway, and IAM

### 1. Create DynamoDB Table

```bash
cd backend
aws dynamodb create-table --cli-input-json file://dynamodb-table.json
```

Or manually in AWS Console:
- Table name: `NimbusUserState`
- Partition key: `userId` (String)
- Billing mode: On-demand (PAY_PER_REQUEST)

### 2. Create IAM Role for Lambda

```bash
# Create the role
aws iam create-role \
  --role-name NimbusLambdaRole \
  --assume-role-policy-document file://lambda-trust-policy.json

# Attach DynamoDB permissions
aws iam put-role-policy \
  --role-name NimbusLambdaRole \
  --policy-name NimbusDynamoDBAccess \
  --policy-document file://lambda-dynamodb-policy.json
```

### 3. Deploy Lambda Functions

**loadState:**
```bash
cd loadState
zip -r loadState.zip index.js
aws lambda create-function \
  --function-name NimbusLoadState \
  --runtime nodejs20.x \
  --handler index.handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/NimbusLambdaRole \
  --zip-file fileb://loadState.zip \
  --environment Variables={TABLE_NAME=NimbusUserState}
```

**saveState:**
```bash
cd ../saveState
zip -r saveState.zip index.js
aws lambda create-function \
  --function-name NimbusSaveState \
  --runtime nodejs20.x \
  --handler index.handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/NimbusLambdaRole \
  --zip-file fileb://saveState.zip \
  --environment Variables={TABLE_NAME=NimbusUserState}
```

### 4. Create API Gateway

1. Go to API Gateway in AWS Console
2. Create HTTP API
3. Add routes:
   - `GET /state` → NimbusLoadState Lambda
   - `PUT /state` → NimbusSaveState Lambda
4. Enable CORS:
   - Allow origins: `*`
   - Allow methods: `GET, PUT, OPTIONS`
   - Allow headers: `Content-Type`
5. Deploy to a stage (e.g., `prod`)
6. Copy the invoke URL

### 5. Configure Frontend

Add the API URL to your frontend `.env`:
```bash
VITE_API_BASE_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
```

---

## Infrastructure Details

### DynamoDB Table Schema

| Attribute | Type | Description |
|-----------|------|-------------|
| `userId` | String (PK) | Anonymous UUID from client |
| `credits` | Number | Current credit balance |
| `currentStreak` | Number | Consecutive days with sessions |
| `lastSessionDate` | String | ISO date of last session |
| `ownedComponents` | List | Purchased components with tiers |
| `placedComponents` | List | Components on canvas with positions |
| `connections` | List | Canvas connections |
| `sessionHistory` | List | Last 100 sessions |
| `updatedAt` | String | ISO timestamp of last update |

### Lambda Functions

#### loadState

**Endpoint:** `GET /state?userId={uuid}`

**Response:**
```json
{
  "success": true,
  "state": {
    "credits": 150,
    "currentStreak": 3,
    "lastSessionDate": "2025-12-06",
    "ownedComponents": [...],
    "placedComponents": [...],
    "connections": [...],
    "sessionHistory": [...]
  }
}
```

**New User Response:**
```json
{
  "success": true,
  "state": null
}
```

#### saveState

**Endpoint:** `PUT /state`

**Request Body:**
```json
{
  "userId": "uuid-string",
  "state": {
    "credits": 150,
    "currentStreak": 3,
    "lastSessionDate": "2025-12-06",
    "ownedComponents": [...],
    "placedComponents": [...],
    "connections": [...],
    "sessionHistory": [...]
  }
}
```

**Response:**
```json
{
  "success": true
}
```

### CORS Configuration

Both functions include CORS headers:
```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
};
```

---

## Local Development

### Testing Lambda Functions Locally

Install AWS SDK:
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

Create a test event:
```javascript
// test-load.js
const { handler } = require('./loadState/index.js');

const event = {
  queryStringParameters: { userId: 'test-user-123' }
};

handler(event).then(console.log);
```

### Using LocalStack (Optional)

For fully local development:
```bash
# Start LocalStack
docker run -d -p 4566:4566 localstack/localstack

# Create local table
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --cli-input-json file://dynamodb-table.json

# Set environment variable
export TABLE_NAME=NimbusUserState
export AWS_ENDPOINT=http://localhost:4566
```

---

## Updating Functions

After code changes:
```bash
# loadState
cd loadState
zip -r loadState.zip index.js
aws lambda update-function-code \
  --function-name NimbusLoadState \
  --zip-file fileb://loadState.zip

# saveState
cd ../saveState
zip -r saveState.zip index.js
aws lambda update-function-code \
  --function-name NimbusSaveState \
  --zip-file fileb://saveState.zip
```

---

## Monitoring

### CloudWatch Logs

Lambda functions automatically log to CloudWatch:
- `/aws/lambda/NimbusLoadState`
- `/aws/lambda/NimbusSaveState`

### DynamoDB Metrics

Monitor in DynamoDB console:
- Read/Write capacity units consumed
- Throttled requests
- Item count

---

## Cost Estimation

With on-demand pricing and typical usage:

| Resource | Estimated Monthly Cost |
|----------|----------------------|
| DynamoDB (on-demand) | $0.25-1.00 |
| Lambda (1M requests) | $0.20 |
| API Gateway (1M requests) | $1.00 |
| **Total** | ~$1.50-2.50/month |

---

## Troubleshooting

### "Access Denied" Errors
- Verify IAM role has DynamoDB permissions
- Check TABLE_NAME environment variable is set

### CORS Errors
- Ensure API Gateway has CORS enabled
- Verify Lambda returns CORS headers
- Check browser console for specific CORS error

### "Function not found"
- Verify function name matches exactly
- Check AWS region is correct

### Empty State Returned
- Normal for new users (state will be null)
- Frontend handles this by using default state

# Kiro Focus Backend

AWS Lambda functions for persisting user state.

## Infrastructure

### DynamoDB Table

Create the table using the AWS CLI:

```bash
aws dynamodb create-table --cli-input-json file://dynamodb-table.json
```

Or use the AWS Console with these settings:
- Table name: `KiroFocusUserState`
- Partition key: `userId` (String)
- Billing mode: On-demand (PAY_PER_REQUEST)

### Lambda Functions

#### loadState
- Runtime: Node.js 18.x or 20.x
- Handler: `index.handler`
- Environment variables:
  - `TABLE_NAME`: `KiroFocusUserState`
- IAM permissions: `dynamodb:GetItem` on the table

#### saveState
- Runtime: Node.js 18.x or 20.x
- Handler: `index.handler`
- Environment variables:
  - `TABLE_NAME`: `KiroFocusUserState`
- IAM permissions: `dynamodb:PutItem` on the table

### API Gateway

Configure HTTP API with:
- `GET /state` → loadState Lambda
- `PUT /state` → saveState Lambda
- Enable CORS for all origins

## Local Testing

The Lambda functions use AWS SDK v3. Install dependencies:

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

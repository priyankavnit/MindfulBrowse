# Environment Configuration Setup

This guide explains how to configure the web dashboard environment variables after deploying the infrastructure.

## Quick Start

1. **Deploy Infrastructure**
   ```bash
   cd packages/infrastructure
   npm run deploy
   ```

2. **Get CDK Outputs**
   
   After deployment completes, the CDK will display output values. Copy these values to your `.env` file.

   Alternatively, retrieve outputs using:
   ```bash
   cd packages/infrastructure
   npm run cdk -- outputs --profile your-aws-profile
   ```

3. **Update .env File**
   
   Open `packages/web-dashboard/.env` and replace the placeholder values:

   | Environment Variable | CDK Output Name | Example Value |
   |---------------------|-----------------|---------------|
   | `VITE_AWS_REGION` | (hardcoded) | `us-east-1` |
   | `VITE_COGNITO_USER_POOL_ID` | `UserPoolId` | `us-east-1_AbCdEfGhI` |
   | `VITE_COGNITO_USER_POOL_CLIENT_ID` | `UserPoolClientId` | `1a2b3c4d5e6f7g8h9i0j1k2l3m` |
   | `VITE_COGNITO_DOMAIN` | `CognitoHostedUIUrl` | `https://mindful-browse-dev.auth.us-east-1.amazoncognito.com` |
   | `VITE_API_URL` | `ApiUrl` | `https://abc123def4.execute-api.us-east-1.amazonaws.com/dev/` |

4. **Start Development Server**
   ```bash
   cd packages/web-dashboard
   npm run dev
   ```

   The dashboard will be available at http://localhost:5173

## Environment Variables Reference

### VITE_AWS_REGION
The AWS region where your infrastructure is deployed. For MVP, this is `us-east-1`.

### VITE_COGNITO_USER_POOL_ID
The Cognito User Pool ID for authentication. Format: `us-east-1_XXXXXXXXX`

### VITE_COGNITO_USER_POOL_CLIENT_ID
The Cognito User Pool Client ID for the web dashboard. This is a long alphanumeric string.

### VITE_COGNITO_DOMAIN
The full Cognito Hosted UI URL including the protocol. Format: `https://mindful-browse-dev.auth.us-east-1.amazoncognito.com`

### VITE_API_URL
The API Gateway endpoint URL. Format: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/`

## Troubleshooting

### Missing CDK Outputs
If you don't see the outputs after deployment, check the AWS CloudFormation console:
1. Go to AWS CloudFormation in the AWS Console
2. Find the stack named `MindfulBrowseStack-dev`
3. Click on the "Outputs" tab
4. Copy the values to your `.env` file

### Authentication Errors
If you get authentication errors:
- Verify the Cognito User Pool ID and Client ID are correct
- Ensure the Cognito Domain URL includes `https://` and the full domain
- Check that the callback URLs in Cognito include `http://localhost:5173`

### API Connection Errors
If the dashboard can't connect to the API:
- Verify the API URL ends with a trailing slash
- Check that the API Gateway has CORS enabled
- Ensure your Cognito user has been created and verified

## Security Notes

- The `.env` file is gitignored and should never be committed
- Keep `.env.example` as a template for other developers
- For production deployments, use environment-specific configuration management
- Never share your `.env` file or commit it to version control

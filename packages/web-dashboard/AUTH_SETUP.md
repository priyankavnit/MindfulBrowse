# Authentication Setup Guide

## Overview

The web dashboard uses AWS Cognito for authentication with OAuth 2.0 flow via the Cognito Hosted UI. This implementation uses AWS Amplify library to handle the authentication flow.

## Architecture

1. **Unauthenticated Access**: User visits dashboard → redirected to `/login`
2. **Login Flow**: User clicks "Sign In" → redirected to Cognito Hosted UI
3. **OAuth Callback**: After authentication → Cognito redirects back with authorization code
4. **Token Exchange**: Amplify exchanges code for JWT tokens automatically
5. **Token Storage**: ID token stored in localStorage for persistence
6. **Protected Routes**: All dashboard routes require valid authentication

## Configuration

### Environment Variables

Create a `.env` file in `packages/web-dashboard/` with the following variables:

```bash
# Cognito User Pool ID (from CDK output: UserPoolId)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX

# Cognito User Pool Client ID (from CDK output: UserPoolClientId)
VITE_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Cognito Domain (format: {pool-name}.auth.{region}.amazoncognito.com)
VITE_COGNITO_DOMAIN=mindful-browse-dev.auth.us-east-1.amazoncognito.com

# API Gateway URL (from CDK output: ApiUrl)
VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

### Getting Configuration Values

After deploying the infrastructure with CDK:

```bash
cd packages/infrastructure
npm run deploy

# CDK will output the required values:
# - UserPoolId
# - UserPoolClientId
# - ApiUrl
```

For the Cognito domain, you need to configure it in the AWS Console:
1. Go to Amazon Cognito → User Pools → Select your pool
2. Navigate to "App integration" → "Domain"
3. Create a Cognito domain (e.g., `mindful-browse-dev`)
4. Use format: `{your-domain}.auth.{region}.amazoncognito.com`

### Cognito Hosted UI Configuration

The Cognito User Pool Client must be configured with:

1. **Callback URLs**: `http://localhost:5173` (dev), `https://your-cloudfront-domain.com` (prod)
2. **Sign-out URLs**: Same as callback URLs
3. **OAuth 2.0 Flows**: Authorization code grant
4. **OAuth Scopes**: `openid`, `email`, `profile`

## Components

### AuthContext

Located in `src/contexts/AuthContext.tsx`

Provides authentication state and methods:
- `isAuthenticated`: Boolean indicating if user is logged in
- `authToken`: JWT ID token for API requests
- `userEmail`: User's email address
- `isLoading`: Boolean indicating auth check in progress
- `login()`: Redirects to Cognito Hosted UI
- `logout()`: Signs out and clears tokens

### ProtectedRoute

Located in `src/components/ProtectedRoute.tsx`

Wrapper component that:
- Shows loading spinner while checking authentication
- Redirects to `/login` if not authenticated
- Renders protected content if authenticated

### Login Page

Located in `src/pages/Login.tsx`

Simple login page with "Sign In" button that triggers OAuth flow.

### Dashboard Page

Located in `src/pages/Dashboard.tsx`

Protected dashboard page with logout functionality.

## Usage

### Wrapping App with AuthProvider

```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your routes */}
    </AuthProvider>
  );
}
```

### Protecting Routes

```tsx
import ProtectedRoute from './components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Using Auth in Components

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, authToken, userEmail, logout } = useAuth();
  
  // Use authToken for API requests
  const fetchData = async () => {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    // ...
  };
  
  return (
    <div>
      <p>Welcome, {userEmail}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Token Handling

### Token Storage

- ID token stored in `localStorage` with key `authToken`
- Persists across browser sessions
- Automatically cleared on logout

### Token Expiration

- Access tokens expire after 1 hour (configured in CDK)
- Refresh tokens valid for 30 days
- Amplify automatically handles token refresh
- On 401 responses, user redirected to login

### Token Validation

- API Gateway validates tokens with Cognito on each request
- Invalid/expired tokens return 401 Unauthorized
- Dashboard catches 401 and redirects to login

## Security Considerations

1. **HTTPS Only**: All authentication flows use HTTPS in production
2. **Token Storage**: Tokens stored in localStorage (acceptable for MVP, consider httpOnly cookies for production)
3. **CORS**: API Gateway configured with appropriate CORS headers
4. **Token Expiration**: Short-lived access tokens (1 hour)
5. **Redirect Validation**: Cognito validates redirect URLs against whitelist

## Testing

### Local Development

1. Start the dev server:
```bash
npm run dev
```

2. Visit `http://localhost:5173`
3. Click "Sign In" → redirected to Cognito Hosted UI
4. Sign up or log in
5. Redirected back to dashboard with authentication

### Testing Logout

1. Click "Logout" button
2. Tokens cleared from localStorage
3. Redirected to Cognito sign-out page
4. Redirected back to login page

### Testing Token Expiration

1. Log in successfully
2. Manually expire token in localStorage or wait 1 hour
3. Make API request
4. Should receive 401 and redirect to login

## Troubleshooting

### "Invalid redirect URI" error

- Ensure callback URL is configured in Cognito User Pool Client
- Check that URL matches exactly (including protocol and port)

### "User pool client does not exist" error

- Verify `VITE_COGNITO_USER_POOL_CLIENT_ID` is correct
- Check that User Pool Client is created in correct region

### Infinite redirect loop

- Clear localStorage and cookies
- Verify Cognito domain is configured correctly
- Check that OAuth scopes are enabled

### Token not persisting

- Check browser localStorage is enabled
- Verify no browser extensions blocking storage
- Check for localStorage quota exceeded

## References

- [AWS Amplify Auth Documentation](https://docs.amplify.aws/javascript/build-a-backend/auth/)
- [Amazon Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)

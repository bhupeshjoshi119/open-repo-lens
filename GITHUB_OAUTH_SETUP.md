# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth authentication to access private repositories.

## 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Your app name (e.g., "TechHub Repository Analyzer")
   - **Homepage URL**: `http://localhost:8080` (for development)
   - **Authorization callback URL**: `http://localhost:8080/auth/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

## 2. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Update the GitHub OAuth variables:
   ```env
   VITE_GITHUB_CLIENT_ID="your_client_id_here"
   VITE_GITHUB_CLIENT_SECRET="your_client_secret_here"
   VITE_GITHUB_REDIRECT_URI="http://localhost:8080/auth/callback"
   ```

## 3. OAuth Scopes

The application requests the following GitHub scopes:

- `repo`: Access to public and private repositories
- `user:email`: Access to user email addresses
- `read:org`: Read access to organization membership

## 4. Security Notes

- **Client Secret**: Keep your client secret secure. In production, the token exchange should happen on your backend server.
- **HTTPS**: For production, use HTTPS URLs for both homepage and callback URLs.
- **Environment Variables**: Never commit your `.env` file to version control.

## 5. Production Deployment

For production deployment:

1. Update your GitHub OAuth App settings:

   - **Homepage URL**: Your production domain
   - **Authorization callback URL**: `https://yourdomain.com/auth/callback`

2. Update environment variables:

   ```env
   VITE_GITHUB_REDIRECT_URI="https://yourdomain.com/auth/callback"
   ```

3. Implement backend token exchange:
   - Move the token exchange logic to your backend
   - Remove `VITE_GITHUB_CLIENT_SECRET` from frontend environment
   - Update `src/services/githubAuth.ts` to call your backend endpoint

## 6. Features Enabled

With GitHub OAuth authentication, users can:

- Access their private repositories
- View organization repositories (with proper permissions)
- Get enhanced repository analytics
- Perform authenticated API requests (higher rate limits)

## 7. Troubleshooting

### Common Issues:

1. **"Bad verification code"**: Check that your callback URL matches exactly
2. **"Application suspended"**: Verify your OAuth app is active in GitHub settings
3. **Rate limiting**: Authenticated requests have higher rate limits (5,000/hour vs 60/hour)
4. **CORS errors**: Ensure your development server is running on the correct port

### Testing Authentication:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:8080`
3. Click "Sign in with GitHub"
4. Authorize the application
5. You should be redirected back and see your profile in the top-right corner

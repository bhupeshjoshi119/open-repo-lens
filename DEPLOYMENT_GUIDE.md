# Deployment Guide

## Environment Configuration

This application uses dynamic redirect URIs that automatically adapt to the deployment environment.

### Development
- Redirect URI: `http://localhost:8080/auth/callback`
- Uses Vite proxy for OAuth token exchange

### Production (Vercel)
- Redirect URI: `https://reposcan-one.vercel.app/auth/callback`
- Makes direct requests to GitHub OAuth API

## GitHub OAuth App Setup

### Option 1: Single OAuth App (Recommended)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Edit your existing OAuth App
3. Set **Authorization callback URL** to: `https://reposcan-one.vercel.app/auth/callback`
4. Add `http://localhost:8080/auth/callback` as an additional callback URL (if supported)

### Option 2: Separate OAuth Apps
Create separate OAuth apps for development and production:

**Development App:**
- Homepage URL: `http://localhost:8080`
- Callback URL: `http://localhost:8080/auth/callback`

**Production App:**
- Homepage URL: `https://reposcan-one.vercel.app`
- Callback URL: `https://reposcan-one.vercel.app/auth/callback`

## Vercel Environment Variables

Set these in your Vercel project settings:

```env
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_GITHUB_CLIENT_ID=
VITE_GITHUB_CLIENT_SECRET=
```

## Security Note

⚠️ **Important**: The current production setup exposes the GitHub client secret in the frontend bundle. For production applications, you should:

1. Create a backend API endpoint for OAuth token exchange
2. Keep the client secret on the server
3. Update the `exchangeCodeForToken` method to call your backend

## Testing

1. **Development**: Run `npm run dev` and test at `http://localhost:8080`
2. **Production**: Deploy to Vercel and test at `https://reposcan-one.vercel.app`

Both environments should now correctly handle GitHub OAuth authentication with the appropriate redirect URIs.
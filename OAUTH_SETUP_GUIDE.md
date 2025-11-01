# GitHub OAuth Setup Guide

## Issue
The "redirect_uri is not associated with this application" error occurs when the GitHub OAuth app doesn't have the correct callback URL configured.

## Solution

### 1. Update GitHub OAuth App Settings

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App (Client ID: `Ov23liEMGIRLG2hv8qtC`)
3. In the "Authorization callback URL" field, make sure you have both:
   - `http://localhost:8080/auth/callback` (for local development)
   - `https://reposcan-one.vercel.app/auth/callback` (for production)

### 2. Environment Configuration

Your `.env.local` file should have:
```
VITE_GITHUB_REDIRECT_URI="http://localhost:8080/auth/callback"
```

Your production environment should have:
```
VITE_GITHUB_REDIRECT_URI="https://reposcan-one.vercel.app/auth/callback"
```

### 3. Test the Fix

1. Restart your dev server: `sudo bun dev`
2. Try logging in again
3. The OAuth flow should now work correctly

## Why This Happens

GitHub OAuth apps require exact URL matches for security. The redirect URI in your OAuth request must exactly match one of the URLs configured in your GitHub OAuth app settings.

## Current Configuration

- **Development**: `http://localhost:8080/auth/callback`
- **Production**: `https://reposcan-one.vercel.app/auth/callback`
- **Port**: 8080 (configured in `vite.config.ts`)
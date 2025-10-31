# GitHub OAuth Redirect URI Fix

## Current Issue

The error "redirect_uri is not associated with this application" means your GitHub OAuth App doesn't have the correct redirect URIs configured.

## Step 1: Update GitHub OAuth App Settings

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Find your OAuth App (Client ID: Ov23liEMGIRLG2hv8qtC)
3. Click "Edit" on your OAuth App
4. Update the "Authorization callback URL" field to include ALL these URLs:

**For Development:**

```
http://localhost:8080/auth/callback
```

**For Production:**

```
https://reposcan-one.vercel.app/auth/callback
```

**Note:** GitHub OAuth Apps can only have ONE callback URL. You need separate OAuth Apps for development and production, OR use a single production URL and proxy during development.

## Step 2: Recommended Approach - Separate OAuth Apps

### Development OAuth App

- Homepage URL: `http://localhost:8080`
- Authorization callback URL: `http://localhost:8080/auth/callback`

### Production OAuth App

- Homepage URL: `https://reposcan-one.vercel.app`
- Authorization callback URL: `https://reposcan-one.vercel.app/auth/callback`

## Step 3: Update Environment Variables

Update your environment files with the correct Client IDs for each environment.

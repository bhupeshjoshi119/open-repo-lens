#!/usr/bin/env node

/**
 * Quick fix for GitHub OAuth redirect URI mismatch
 * This script updates your existing GitHub OAuth App with the correct redirect URI
 */

const GITHUB_API_BASE = 'https://api.github.com';

// Your current OAuth App details
const CLIENT_ID = 'Ov23liEMGIRLG2hv8qtC';

async function updateOAuthApp() {
  console.log('🔧 Fixing GitHub OAuth redirect URI...\n');

  // Check if we have a GitHub token
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('❌ GitHub Personal Access Token required!');
    console.log('\nTo fix this automatically:');
    console.log('1. Go to https://github.com/settings/tokens');
    console.log('2. Click "Generate new token (classic)"');
    console.log('3. Select "write:oauth_app" scope');
    console.log('4. Copy the token and run:');
    console.log('   export GITHUB_TOKEN=your_token_here');
    console.log('5. Then run: node scripts/fix-oauth-redirect.js\n');
    
    console.log('🔧 Manual fix:');
    console.log('1. Go to https://github.com/settings/developers');
    console.log(`2. Find your OAuth App with Client ID: ${CLIENT_ID}`);
    console.log('3. Click "Edit"');
    console.log('4. Update "Authorization callback URL" to:');
    console.log('   For development: http://localhost:8080/auth/callback');
    console.log('   For production: https://reposcan-one.vercel.app/auth/callback');
    return;
  }

  try {
    // First, get the current app details
    console.log('📱 Fetching current OAuth app details...');
    
    // Note: GitHub API doesn't provide a direct way to update OAuth apps by client_id
    // We need to list all apps and find the one with matching client_id
    const listResponse = await fetch(`${GITHUB_API_BASE}/user/applications`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!listResponse.ok) {
      throw new Error('Failed to fetch OAuth apps. Check your token permissions.');
    }

    const apps = await listResponse.json();
    const targetApp = apps.find(app => app.client_id === CLIENT_ID);

    if (!targetApp) {
      console.log(`❌ OAuth app with client ID ${CLIENT_ID} not found in your account.`);
      console.log('Please check the client ID or create a new OAuth app.');
      return;
    }

    console.log(`✅ Found OAuth app: ${targetApp.name}`);
    console.log(`📍 Current callback URL: ${targetApp.callback_url}`);

    // Determine the correct callback URL based on environment
    const isDev = process.env.NODE_ENV !== 'production';
    const newCallbackUrl = isDev 
      ? 'http://localhost:8080/auth/callback'
      : 'https://reposcan-one.vercel.app/auth/callback';

    if (targetApp.callback_url === newCallbackUrl) {
      console.log('✅ Callback URL is already correct!');
      return;
    }

    // Update the OAuth app
    console.log(`🔄 Updating callback URL to: ${newCallbackUrl}`);
    
    const updateResponse = await fetch(`${GITHUB_API_BASE}/user/applications/${targetApp.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callback_url: newCallbackUrl
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(`Failed to update OAuth app: ${error.message}`);
    }

    console.log('✅ OAuth app updated successfully!');
    console.log('🚀 You can now test GitHub authentication.');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.log('\n🔧 Manual fix required:');
    console.log('1. Go to https://github.com/settings/developers');
    console.log(`2. Find your OAuth App with Client ID: ${CLIENT_ID}`);
    console.log('3. Click "Edit"');
    console.log('4. Update "Authorization callback URL" to: http://localhost:8080/auth/callback');
  }
}

// Run the fix
updateOAuthApp();
#!/usr/bin/env node

/**
 * Immediate OAuth Fix - Opens GitHub settings and provides exact instructions
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

function readEnvValue(key) {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const match = envContent.match(new RegExp(`${key}="([^"]*)"`, 'm'));
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

function updateEnvValue(key, value) {
  try {
    let envContent = readFileSync('.env', 'utf8');
    const regex = new RegExp(`${key}="[^"]*"`, 'm');
    const newLine = `${key}="${value}"`;
    
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, newLine);
    } else {
      envContent += `\n${newLine}`;
    }
    
    writeFileSync('.env', envContent);
    return true;
  } catch (error) {
    console.error('Failed to update .env:', error.message);
    return false;
  }
}

function openBrowser(url) {
  try {
    const platform = process.platform;
    if (platform === 'darwin') {
      execSync(`open "${url}"`);
    } else if (platform === 'win32') {
      execSync(`start "${url}"`);
    } else {
      execSync(`xdg-open "${url}"`);
    }
    return true;
  } catch (error) {
    return false;
  }
}

console.log('🚀 GitHub OAuth Quick Fix');
console.log('========================\n');

const clientId = readEnvValue('VITE_GITHUB_CLIENT_ID');
const currentRedirectUri = readEnvValue('VITE_GITHUB_REDIRECT_URI');

console.log('📋 Current Configuration:');
console.log(`   Client ID: ${clientId}`);
console.log(`   Redirect URI: ${currentRedirectUri}\n`);

// Determine if we're in development or production
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const correctRedirectUri = isDev 
  ? 'http://localhost:8080/auth/callback'
  : 'https://reposcan-one.vercel.app/auth/callback';

console.log('🎯 Recommended Configuration:');
console.log(`   Environment: ${isDev ? 'Development' : 'Production'}`);
console.log(`   Correct Redirect URI: ${correctRedirectUri}\n`);

// Update .env file if needed
if (currentRedirectUri !== correctRedirectUri) {
  console.log('🔧 Updating .env file...');
  if (updateEnvValue('VITE_GITHUB_REDIRECT_URI', correctRedirectUri)) {
    console.log('✅ .env file updated\n');
  } else {
    console.log('❌ Failed to update .env file\n');
  }
} else {
  console.log('✅ .env file is already correct\n');
}

// Open GitHub settings
console.log('🌐 Opening GitHub OAuth App settings...');
const githubUrl = 'https://github.com/settings/developers';

if (openBrowser(githubUrl)) {
  console.log('✅ Browser opened\n');
} else {
  console.log(`❌ Please manually open: ${githubUrl}\n`);
}

console.log('📝 Manual Steps in GitHub:');
console.log('1. Find your OAuth App in the list');
console.log(`2. Look for Client ID: ${clientId}`);
console.log('3. Click "Edit" button');
console.log('4. Update "Authorization callback URL" to:');
console.log(`   ${correctRedirectUri}`);
console.log('5. Click "Update application"\n');

console.log('🔍 Verification:');
console.log('After updating GitHub settings:');
console.log('1. Restart your development server');
console.log('2. Try GitHub authentication again');
console.log('3. Check browser console for errors\n');

console.log('✅ Fix process initiated!');
console.log('The OAuth redirect URI error should be resolved once you update the GitHub OAuth App settings.');
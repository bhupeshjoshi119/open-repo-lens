#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests if the production deployment is working correctly
 */

const PRODUCTION_URL = 'https://reposcan-one.vercel.app';

async function testApiRoute() {
  console.log('🧪 Testing API routes...\n');
  
  try {
    // Test the test endpoint
    console.log('1. Testing /api/test endpoint...');
    const testResponse = await fetch(`${PRODUCTION_URL}/api/test`);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ API routes are working');
      console.log(`   Timestamp: ${testData.timestamp}`);
      console.log(`   Environment: ${testData.environment}`);
      console.log(`   GitHub env vars: ${testData.hasGitHubEnvVars ? '✅' : '❌'}`);
      
      if (!testData.hasGitHubEnvVars) {
        console.log('❌ Missing GitHub environment variables in Vercel!');
        console.log('   Go to Vercel Dashboard → Settings → Environment Variables');
      }
    } else {
      console.log('❌ API test endpoint failed:', testResponse.status);
    }
    
    // Test the OAuth endpoint (should return method not allowed for GET)
    console.log('\n2. Testing /api/github/oauth/token endpoint...');
    const oauthResponse = await fetch(`${PRODUCTION_URL}/api/github/oauth/token`);
    
    if (oauthResponse.status === 405) {
      console.log('✅ OAuth API endpoint is deployed (returns 405 for GET as expected)');
    } else {
      console.log('❌ OAuth API endpoint issue:', oauthResponse.status);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

async function testMainApp() {
  console.log('\n🌐 Testing main application...\n');
  
  try {
    const response = await fetch(PRODUCTION_URL);
    if (response.ok) {
      console.log('✅ Main application is accessible');
      
      // Check if it's serving the latest build
      const html = await response.text();
      if (html.includes('Connect with GitHub')) {
        console.log('✅ Login page is loading correctly');
      } else {
        console.log('⚠️  Login page content might be cached');
      }
    } else {
      console.log('❌ Main application failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Main app test failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Production Deployment Verification');
  console.log('=====================================');
  console.log(`Testing: ${PRODUCTION_URL}\n`);
  
  await testApiRoute();
  await testMainApp();
  
  console.log('\n📋 Next Steps:');
  console.log('1. If API routes are working but OAuth still fails:');
  console.log('   - Clear browser cache (Ctrl+Shift+R)');
  console.log('   - Try incognito/private mode');
  console.log('   - Check browser console for "🔧 OAuth Fix v2.0" message');
  console.log('');
  console.log('2. If environment variables are missing:');
  console.log('   - Go to Vercel Dashboard');
  console.log('   - Add VITE_GITHUB_CLIENT_ID, VITE_GITHUB_CLIENT_SECRET, VITE_GITHUB_REDIRECT_URI');
  console.log('   - Redeploy');
  console.log('');
  console.log('3. If still having issues:');
  console.log('   - Check Vercel function logs');
  console.log('   - Verify GitHub OAuth App callback URL');
}

main().catch(console.error);
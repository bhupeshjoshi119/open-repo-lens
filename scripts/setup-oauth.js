#!/usr/bin/env node

/**
 * Automated GitHub OAuth Setup Script
 * This script helps configure GitHub OAuth Apps and environment variables
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const GITHUB_API_BASE = 'https://api.github.com';

class OAuthSetup {
  constructor() {
    this.devConfig = {
      name: 'TechHub Repository Analyzer (Development)',
      homepage_url: 'http://localhost:8080',
      callback_url: 'http://localhost:8080/auth/callback',
      description: 'Development environment for TechHub Repository Analyzer'
    };
    
    this.prodConfig = {
      name: 'TechHub Repository Analyzer (Production)',
      homepage_url: 'https://reposcan-one.vercel.app',
      callback_url: 'https://reposcan-one.vercel.app/auth/callback',
      description: 'Production environment for TechHub Repository Analyzer'
    };
  }

  async createOAuthApp(config, token) {
    const response = await fetch(`${GITHUB_API_BASE}/user/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.name,
        url: config.homepage_url,
        callback_url: config.callback_url,
        description: config.description
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create OAuth app: ${error.message}`);
    }

    return await response.json();
  }

  updateEnvFile(filePath, updates) {
    let content = '';
    
    if (existsSync(filePath)) {
      content = readFileSync(filePath, 'utf8');
    }

    // Update or add each environment variable
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const line = `${key}="${value}"`;
      
      if (regex.test(content)) {
        content = content.replace(regex, line);
      } else {
        content += `\n${line}`;
      }
    });

    writeFileSync(filePath, content.trim() + '\n');
  }

  async setup() {
    console.log('🚀 Starting automated GitHub OAuth setup...\n');

    // Check if we have a GitHub token
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.log('❌ GitHub token required!');
      console.log('Please create a Personal Access Token with "write:oauth_app" scope:');
      console.log('1. Go to https://github.com/settings/tokens');
      console.log('2. Click "Generate new token (classic)"');
      console.log('3. Select "write:oauth_app" scope');
      console.log('4. Run: export GITHUB_TOKEN=your_token_here');
      console.log('5. Then run this script again');
      process.exit(1);
    }

    try {
      console.log('📱 Creating development OAuth app...');
      const devApp = await this.createOAuthApp(this.devConfig, token);
      console.log(`✅ Development app created: ${devApp.client_id}`);

      console.log('🌐 Creating production OAuth app...');
      const prodApp = await this.createOAuthApp(this.prodConfig, token);
      console.log(`✅ Production app created: ${prodApp.client_id}`);

      // Update environment files
      console.log('📝 Updating environment files...');

      // Development environment
      this.updateEnvFile('.env.local', {
        'VITE_GITHUB_CLIENT_ID': devApp.client_id,
        'VITE_GITHUB_CLIENT_SECRET': devApp.client_secret,
        'VITE_GITHUB_REDIRECT_URI': 'http://localhost:8080/auth/callback'
      });

      // Production environment
      this.updateEnvFile('.env.production', {
        'VITE_GITHUB_CLIENT_ID': prodApp.client_id,
        'VITE_GITHUB_CLIENT_SECRET': prodApp.client_secret,
        'VITE_GITHUB_REDIRECT_URI': 'https://reposcan-one.vercel.app/auth/callback'
      });

      // Default environment (use dev for local testing)
      this.updateEnvFile('.env', {
        'VITE_GITHUB_CLIENT_ID': devApp.client_id,
        'VITE_GITHUB_CLIENT_SECRET': devApp.client_secret,
        'VITE_GITHUB_REDIRECT_URI': 'http://localhost:8080/auth/callback'
      });

      console.log('\n🎉 Setup complete!');
      console.log('\nCreated OAuth Apps:');
      console.log(`📱 Development: ${devApp.client_id} (${this.devConfig.callback_url})`);
      console.log(`🌐 Production: ${prodApp.client_id} (${this.prodConfig.callback_url})`);
      console.log('\n✅ Environment files updated');
      console.log('🚀 You can now test GitHub OAuth authentication!');

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      
      if (error.message.includes('already_exists')) {
        console.log('\n💡 OAuth apps might already exist. Try updating existing ones or use different names.');
      }
      
      process.exit(1);
    }
  }
}

// Run the setup
const setup = new OAuthSetup();
setup.setup().catch(console.error);
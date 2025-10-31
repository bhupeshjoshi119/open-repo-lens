#!/bin/bash

# Production Deployment Script
# Ensures proper environment variable setup for Vercel

echo "🚀 Preparing Production Deployment"
echo "=================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    exit 1
fi

# Extract environment variables
CLIENT_ID=$(grep "VITE_GITHUB_CLIENT_ID" .env.production | cut -d'"' -f2)
CLIENT_SECRET=$(grep "VITE_GITHUB_CLIENT_SECRET" .env.production | cut -d'"' -f2)
REDIRECT_URI=$(grep "VITE_GITHUB_REDIRECT_URI" .env.production | cut -d'"' -f2)

echo "📋 Production Configuration:"
echo "   Client ID: ${CLIENT_ID:0:10}..."
echo "   Redirect URI: $REDIRECT_URI"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
    echo "   Or set environment variables manually in Vercel dashboard"
    echo ""
fi

echo "🔧 Required Vercel Environment Variables:"
echo "   VITE_GITHUB_CLIENT_ID=$CLIENT_ID"
echo "   VITE_GITHUB_CLIENT_SECRET=$CLIENT_SECRET"
echo "   VITE_GITHUB_REDIRECT_URI=$REDIRECT_URI"
echo ""

echo "📝 Manual Setup Instructions:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add the variables shown above"
echo "5. Redeploy your application"
echo ""

echo "🚀 Or use Vercel CLI:"
echo "   vercel env add VITE_GITHUB_CLIENT_ID"
echo "   vercel env add VITE_GITHUB_CLIENT_SECRET"
echo "   vercel env add VITE_GITHUB_REDIRECT_URI"
echo ""

echo "✅ Deployment preparation complete!"
echo "   Make sure to set environment variables in Vercel dashboard"
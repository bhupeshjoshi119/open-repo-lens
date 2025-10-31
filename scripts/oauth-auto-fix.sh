#!/bin/bash

# Automated GitHub OAuth Fix Script
# This script provides multiple ways to fix the OAuth redirect URI issue

echo "🔧 GitHub OAuth Redirect URI Auto-Fix"
echo "======================================"
echo ""

# Check current environment
if [ -f ".env" ]; then
    CURRENT_REDIRECT=$(grep "VITE_GITHUB_REDIRECT_URI" .env | cut -d'"' -f2)
    CLIENT_ID=$(grep "VITE_GITHUB_CLIENT_ID" .env | cut -d'"' -f2)
    echo "📋 Current Configuration:"
    echo "   Client ID: ${CLIENT_ID}"
    echo "   Redirect URI: ${CURRENT_REDIRECT}"
    echo ""
fi

echo "🎯 Quick Fix Options:"
echo ""
echo "1. 🌐 Set for Production (Vercel)"
echo "   Redirect URI: https://reposcan-one.vercel.app/auth/callback"
echo ""
echo "2. 💻 Set for Development (localhost)"
echo "   Redirect URI: http://localhost:8080/auth/callback"
echo ""
echo "3. 🔧 Manual GitHub Settings"
echo "   Open GitHub OAuth App settings"
echo ""

read -p "Choose option (1/2/3): " choice

case $choice in
    1)
        echo "🌐 Configuring for production..."
        # Update .env for production
        sed -i.bak 's|VITE_GITHUB_REDIRECT_URI=".*"|VITE_GITHUB_REDIRECT_URI="https://reposcan-one.vercel.app/auth/callback"|' .env
        echo "✅ Updated .env for production"
        echo "⚠️  Make sure your GitHub OAuth App callback URL is set to:"
        echo "   https://reposcan-one.vercel.app/auth/callback"
        ;;
    2)
        echo "💻 Configuring for development..."
        # Update .env for development
        sed -i.bak 's|VITE_GITHUB_REDIRECT_URI=".*"|VITE_GITHUB_REDIRECT_URI="http://localhost:8080/auth/callback"|' .env
        echo "✅ Updated .env for development"
        echo "⚠️  Make sure your GitHub OAuth App callback URL is set to:"
        echo "   http://localhost:8080/auth/callback"
        ;;
    3)
        echo "🔧 Opening GitHub OAuth App settings..."
        echo ""
        echo "Manual steps:"
        echo "1. Go to: https://github.com/settings/developers"
        echo "2. Find your OAuth App with Client ID: ${CLIENT_ID}"
        echo "3. Click 'Edit'"
        echo "4. Update 'Authorization callback URL' to match your .env file:"
        echo "   Current: ${CURRENT_REDIRECT}"
        echo ""
        if command -v open >/dev/null 2>&1; then
            open "https://github.com/settings/developers"
        elif command -v xdg-open >/dev/null 2>&1; then
            xdg-open "https://github.com/settings/developers"
        else
            echo "Please manually open: https://github.com/settings/developers"
        fi
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🚀 Next steps:"
echo "1. Restart your development server if running"
echo "2. Test GitHub authentication"
echo "3. Check browser console for any remaining errors"
echo ""
echo "✅ OAuth fix complete!"
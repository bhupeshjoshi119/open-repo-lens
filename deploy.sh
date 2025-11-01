#!/bin/bash

# TechHub Chrome AI - Quick Deployment Script
# Usage: ./deploy.sh [vercel|netlify|docker]

set -e

echo "🚀 TechHub Chrome AI - Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) detected"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    print_success "Dependencies installed"
}

# Run build
build_app() {
    print_status "Building application..."
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not found"
        exit 1
    fi
    
    print_success "Application built successfully"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    vercel --prod
    print_success "Deployed to Vercel!"
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    netlify deploy --prod --dir=dist
    print_success "Deployed to Netlify!"
}

# Build Docker image
deploy_docker() {
    print_status "Building Docker image..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    
    docker build -t techhub-chrome-ai .
    print_success "Docker image built: techhub-chrome-ai"
    
    print_status "To run the container:"
    echo "docker run -p 80:80 techhub-chrome-ai"
}

# Pre-deployment checks
pre_deploy_checks() {
    print_status "Running pre-deployment checks..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the right directory?"
        exit 1
    fi
    
    # Check if src directory exists
    if [ ! -d "src" ]; then
        print_error "src directory not found. Are you in the right directory?"
        exit 1
    fi
    
    print_success "Pre-deployment checks passed"
}

# Main deployment function
main() {
    local platform=${1:-"vercel"}
    
    echo "Platform: $platform"
    echo ""
    
    pre_deploy_checks
    check_node
    install_deps
    build_app
    
    case $platform in
        "vercel")
            deploy_vercel
            ;;
        "netlify")
            deploy_netlify
            ;;
        "docker")
            deploy_docker
            ;;
        *)
            print_error "Unknown platform: $platform"
            echo "Usage: $0 [vercel|netlify|docker]"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test your deployed application"
    echo "2. Configure custom domain (if needed)"
    echo "3. Set up monitoring and analytics"
    echo "4. Update DNS records (if using custom domain)"
    echo ""
    echo "For more information, see DEPLOYMENT_GUIDE.md"
}

# Run main function with all arguments
main "$@"
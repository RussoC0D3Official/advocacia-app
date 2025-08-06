#!/bin/bash

# DocuMerge Frontend Deployment Script
# This script builds and deploys the React frontend to Firebase Hosting

set -e

# Configuration
PROJECT_ID=${1:-"your-project-id"}
BACKEND_URL=${2:-"https://your-backend-url.com"}

echo "🚀 Deploying DocuMerge Frontend to Firebase Hosting"
echo "Project ID: $PROJECT_ID"
echo "Backend URL: $BACKEND_URL"

# Check if Node.js and pnpm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

# Check if user is authenticated with Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not authenticated with Firebase. Please run 'firebase login'"
    exit 1
fi

# Navigate to frontend directory
cd documerge-frontend

# Install dependencies
echo "📦 Installing dependencies"
pnpm install

# Update API configuration with backend URL
echo "🔧 Updating API configuration"
if [ "$BACKEND_URL" != "https://your-backend-url.com" ]; then
    sed -i.bak "s|https://your-backend-url.com|$BACKEND_URL|g" src/lib/api.js
    echo "✅ Updated backend URL to: $BACKEND_URL"
fi

# Build the application
echo "🏗️ Building React application"
pnpm run build

# Initialize Firebase if not already done
if [ ! -f "firebase.json" ]; then
    echo "🔧 Initializing Firebase"
    firebase init hosting --project $PROJECT_ID
fi

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting"
firebase deploy --only hosting --project $PROJECT_ID

# Get the hosting URL
HOSTING_URL="https://$PROJECT_ID.web.app"

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend URL: $HOSTING_URL"

# Test the deployment
echo "🩺 Testing deployment..."
if curl -f "$HOSTING_URL" > /dev/null 2>&1; then
    echo "✅ Frontend is accessible!"
else
    echo "⚠️ Frontend test failed. Please check the deployment."
fi

echo ""
echo "📝 Next steps:"
echo "1. Test the complete application at: $HOSTING_URL"
echo "2. Set up Firebase Authentication users"
echo "3. Upload test documents and verify merging functionality"
echo "4. Configure custom domain if needed"

# Restore original API configuration if it was modified
if [ -f "src/lib/api.js.bak" ]; then
    mv src/lib/api.js.bak src/lib/api.js
    echo "🔄 Restored original API configuration"
fi


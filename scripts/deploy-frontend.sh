#!/bin/bash
# Frontend Deployment Script for Vercel
# 
# This script helps deploy the frontend to Vercel with proper configuration

set -e

echo "🚀 Frontend Deployment to Vercel"
echo "=================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

# Check if already linked to Vercel project
if [ ! -f ".vercel/project.json" ]; then
    echo "📋 Not linked to Vercel project. Linking..."
    vercel link
fi

# Build the project
echo "🔨 Building frontend..."
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build successful"

# Deploy to production
echo ""
echo "🚀 Deploying to Vercel production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: Make sure VITE_API_BASE_URL is set in Vercel:"
echo "   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
echo "   2. Add: VITE_API_BASE_URL=https://intel-academy-api.fly.dev/api"
echo "   3. Redeploy if you just added it"
echo ""


# Frontend Deployment Script for Vercel (PowerShell)
# This script helps deploy the frontend to Vercel with proper configuration

Write-Host "Frontend Deployment to Vercel" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    $null = Get-Command vercel -ErrorAction Stop
    Write-Host "Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Get script directory and navigate to frontend
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$frontendDir = Join-Path $rootDir "frontend"

# Navigate to frontend directory
Set-Location $frontendDir
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Check if logged in to Vercel
try {
    $null = vercel whoami 2>&1 | Out-Null
    Write-Host "Logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "Not logged in to Vercel. Please login first:" -ForegroundColor Yellow
    Write-Host "  Run: vercel login" -ForegroundColor White
    Write-Host ""
    Write-Host "Attempting to login..." -ForegroundColor Yellow
    vercel login
}

# Check if already linked to Vercel project
if (-not (Test-Path ".vercel\project.json")) {
    Write-Host "Not linked to Vercel project. Linking..." -ForegroundColor Yellow
    vercel link
    Write-Host ""
}

# Build the project
Write-Host "Building frontend..." -ForegroundColor Cyan
npm run build

# Check if build succeeded
if (-not (Test-Path "dist")) {
    Write-Host "Build failed - dist directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful" -ForegroundColor Green
Write-Host ""

# Deploy to production
Write-Host "Deploying to Vercel production..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Make sure VITE_API_BASE_URL is set in Vercel:" -ForegroundColor Yellow
Write-Host "  1. Go to Vercel Dashboard -> Your Project -> Settings -> Environment Variables" -ForegroundColor White
Write-Host "  2. Add: VITE_API_BASE_URL=https://intel-academy-api.fly.dev/api" -ForegroundColor White
Write-Host "  3. Redeploy if you just added it" -ForegroundColor White
Write-Host ""

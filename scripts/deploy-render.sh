#!/bin/bash
# Render Deployment Script
# Assists with deploying to Render using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Render Deployment Script${NC}"
echo ""

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ render.yaml not found${NC}"
    echo "Please ensure render.yaml exists in the project root"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Skipping local Docker checks.${NC}"
else
    echo -e "${GREEN}✅ Docker found${NC}"
    
    # Test Docker builds locally
    echo ""
    echo "Testing Docker builds locally..."
    echo "================================"
    
    echo -n "Building backend Docker image... "
    if docker build -t solosuccess-backend:test -f backend/Dockerfile backend/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Success${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "Run 'docker build -t solosuccess-backend:test -f backend/Dockerfile backend/' for details"
        exit 1
    fi
    
    echo -n "Building frontend Docker image... "
    if docker build -t solosuccess-frontend:test -f frontend/Dockerfile frontend/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Success${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "Run 'docker build -t solosuccess-frontend:test -f frontend/Dockerfile frontend/' for details"
        exit 1
    fi
fi

# Validate environment variables
echo ""
echo "Validating environment variables..."
echo "==================================="

if [ -f "backend/src/scripts/validate-env.ts" ]; then
    cd backend
    if npm run validate:env 2>/dev/null; then
        echo -e "${GREEN}✅ Environment variables validated${NC}"
    else
        echo -e "${YELLOW}⚠️  Environment variable validation failed or incomplete${NC}"
        echo "Please ensure all required environment variables are set in Render dashboard"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  Environment validation script not found${NC}"
fi

# Security audit
echo ""
echo "Running security audit..."
echo "========================"

if [ -f "scripts/security-audit.sh" ]; then
    if bash scripts/security-audit.sh; then
        echo -e "${GREEN}✅ Security audit passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Security audit found issues. Review warnings above.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Security audit script not found${NC}"
fi

# Render deployment instructions
echo ""
echo "=========================================="
echo "Render Deployment Instructions"
echo "=========================================="
echo ""
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for production deployment'"
echo "   git push origin main"
echo ""
echo "2. In Render Dashboard:"
echo "   - Go to Dashboard > New > Blueprint"
echo "   - Connect your GitHub repository"
echo "   - Render will detect render.yaml automatically"
echo "   - Review and confirm service configuration"
echo ""
echo "3. Set Environment Variables in Render:"
echo "   - Go to each service > Environment"
echo "   - Add all required variables from PRODUCTION_ENV.md"
echo "   - Use Render's secret management for sensitive values"
echo ""
echo "4. Deploy:"
echo "   - Render will automatically build and deploy using Docker"
echo "   - Monitor deployment logs in Render dashboard"
echo ""
echo "5. Verify Deployment:"
echo "   - Wait for services to become healthy"
echo "   - Run health checks:"
echo "     BACKEND_URL=https://your-backend.onrender.com \\"
echo "     FRONTEND_URL=https://your-frontend.onrender.com \\"
echo "     bash scripts/health-check.sh"
echo ""
echo -e "${GREEN}✅ Pre-deployment checks complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review render.yaml configuration"
echo "2. Set up environment variables in Render dashboard"
echo "3. Push to GitHub and deploy via Render"


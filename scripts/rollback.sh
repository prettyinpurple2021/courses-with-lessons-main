#!/bin/bash
# Rollback Script
# Provides instructions for rolling back a failed deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}🔄 Rollback Script${NC}"
echo ""
echo "This script provides instructions for rolling back a failed deployment."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Get current branch and commit
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse --short HEAD)

echo "Current Status:"
echo "==============="
echo "Branch: $CURRENT_BRANCH"
echo "Commit: $CURRENT_COMMIT"
echo ""

# Show recent commits
echo "Recent Commits:"
echo "==============="
git log --oneline -10
echo ""

# Rollback options
echo "Rollback Options:"
echo "================="
echo ""
echo "1. Rollback to Previous Commit (Git)"
echo "   git reset --hard HEAD~1"
echo "   git push origin $CURRENT_BRANCH --force"
echo ""
echo "2. Rollback to Specific Commit"
echo "   git reset --hard <commit-hash>"
echo "   git push origin $CURRENT_BRANCH --force"
echo ""
echo "3. Rollback via Fly.io Dashboard"
echo "   - Go to Fly.io Dashboard > Your App"
echo "   - Click on 'Releases'"
echo "   - Select previous successful release"
echo "   - Click 'Rollback'"
echo ""
echo "4. Rollback Database (if needed)"
echo "   - Go to Fly.io Dashboard > Your Database"
echo "   - Use backup restore if available"
echo "   - Or restore from GitHub Actions backup artifacts"
echo ""
echo "5. Emergency Rollback (Docker Compose)"
if [ -f "docker-compose.prod.yml" ]; then
    echo "   docker-compose -f docker-compose.prod.yml down"
    echo "   git checkout <previous-commit>"
    echo "   docker-compose -f docker-compose.prod.yml up -d"
else
    echo "   docker-compose.yml not found"
fi
echo ""

# Interactive rollback
read -p "Do you want to rollback to the previous commit? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: This will reset your current branch to the previous commit${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PREVIOUS_COMMIT=$(git rev-parse --short HEAD~1)
        echo "Rolling back to: $PREVIOUS_COMMIT"
        
        git reset --hard HEAD~1
        
        echo ""
        echo -e "${GREEN}✅ Local rollback complete${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Test the rollback locally"
        echo "2. Push to remote: git push origin $CURRENT_BRANCH --force"
        echo "3. Fly.io will automatically redeploy (if auto-deploy enabled)"
        echo ""
        echo -e "${RED}⚠️  Force push will overwrite remote history${NC}"
    else
        echo "Rollback cancelled"
    fi
else
    echo ""
    echo "Manual rollback instructions shown above."
    echo "Choose the appropriate method for your deployment platform."
fi

echo ""
echo "Post-Rollback Checklist:"
echo "========================"
echo "1. ✅ Verify application is working"
echo "2. ✅ Run health checks"
echo "3. ✅ Check error logs"
echo "4. ✅ Notify team of rollback"
echo "5. ✅ Document reason for rollback"
echo "6. ✅ Fix issues before redeploying"


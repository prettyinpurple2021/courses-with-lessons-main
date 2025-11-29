#!/bin/bash
# Security Audit Script
# Checks for common security issues before production deployment

set -e

echo "🔒 Running security audit..."
echo ""

ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to check for hardcoded secrets
check_hardcoded_secrets() {
    echo "Checking for hardcoded secrets..."
    
    # Check for common secret patterns
    PATTERNS=(
        "password.*=.*['\"][^'\"]+['\"]"
        "secret.*=.*['\"][^'\"]+['\"]"
        "api[_-]?key.*=.*['\"][^'\"]+['\"]"
        "jwt[_-]?secret.*=.*['\"][^'\"]+['\"]"
        "token.*=.*['\"][^'\"]+['\"]"
    )
    
    for pattern in "${PATTERNS[@]}"; do
        if grep -r -i -E "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" backend/src frontend/src 2>/dev/null | grep -v "example\|test\|spec" | grep -v "//.*secret\|//.*password" > /dev/null; then
            echo -e "${RED}❌ Found potential hardcoded secret: $pattern${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
    
    # Check for default JWT secrets
    if grep -r "your-super-secret-jwt-key-change-this-in-production" backend/src 2>/dev/null; then
        echo -e "${RED}❌ Found default JWT secret in code${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
    fi
    echo ""
}

# Function to check npm audit
check_dependencies() {
    echo "Checking for vulnerable dependencies..."
    
    cd backend
    if npm audit --audit-level=moderate 2>/dev/null | grep -q "found"; then
        echo -e "${YELLOW}⚠️  Backend has vulnerable dependencies${NC}"
        npm audit --audit-level=moderate
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ Backend dependencies are secure${NC}"
    fi
    cd ..
    
    cd frontend
    if npm audit --audit-level=moderate 2>/dev/null | grep -q "found"; then
        echo -e "${YELLOW}⚠️  Frontend has vulnerable dependencies${NC}"
        npm audit --audit-level=moderate
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ Frontend dependencies are secure${NC}"
    fi
    cd ..
    echo ""
}

# Function to check for exposed sensitive files
check_exposed_files() {
    echo "Checking for exposed sensitive files..."
    
    SENSITIVE_FILES=(
        ".env"
        ".env.production"
        "*.pem"
        "*.key"
        "*.crt"
        "*.p12"
        "*.pfx"
    )
    
    for file in "${SENSITIVE_FILES[@]}"; do
        if find . -name "$file" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | grep -v ".example" | grep -v ".gitignore" > /dev/null; then
            echo -e "${RED}❌ Found sensitive file: $file${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
    
    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}✅ No exposed sensitive files found${NC}"
    fi
    echo ""
}

# Function to check security headers
check_security_headers() {
    echo "Checking security headers configuration..."
    
    if grep -q "helmet" backend/src/server.ts 2>/dev/null; then
        echo -e "${GREEN}✅ Helmet security middleware configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Helmet not found in server configuration${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "X-Frame-Options" frontend/nginx.conf 2>/dev/null; then
        echo -e "${GREEN}✅ Security headers in nginx configuration${NC}"
    else
        echo -e "${YELLOW}⚠️  Security headers missing in nginx config${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    echo ""
}

# Function to check for console.log in production code
check_console_logs() {
    echo "Checking for console.log statements..."
    
    # Check backend (should use logger instead)
    CONSOLE_COUNT=$(grep -r "console\.log" backend/src --include="*.ts" --exclude-dir=scripts 2>/dev/null | wc -l || echo "0")
    if [ "$CONSOLE_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console.log statements in backend${NC}"
        echo "   Consider using logger instead for production"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ No console.log statements in backend${NC}"
    fi
    echo ""
}

# Function to check environment variable validation
check_env_validation() {
    echo "Checking environment variable validation..."
    
    if [ -f "backend/src/scripts/validate-env.ts" ]; then
        echo -e "${GREEN}✅ Environment validation script exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Environment validation script not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    echo ""
}

# Function to check Docker security
check_docker_security() {
    echo "Checking Docker security..."
    
    # Check for non-root user
    if grep -q "USER nodejs" backend/Dockerfile 2>/dev/null || grep -q "USER nginx" frontend/Dockerfile 2>/dev/null; then
        echo -e "${GREEN}✅ Dockerfiles use non-root user${NC}"
    else
        echo -e "${YELLOW}⚠️  Dockerfiles may not use non-root user${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for .dockerignore
    if [ -f "backend/.dockerignore" ] && [ -f "frontend/.dockerignore" ]; then
        echo -e "${GREEN}✅ .dockerignore files exist${NC}"
    else
        echo -e "${YELLOW}⚠️  .dockerignore files missing${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    echo ""
}

# Run all checks
check_hardcoded_secrets
check_dependencies
check_exposed_files
check_security_headers
check_console_logs
check_env_validation
check_docker_security

# Summary
echo "=========================================="
echo "Security Audit Summary"
echo "=========================================="
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Security audit failed. Please fix errors before deploying.${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Security audit passed with warnings. Review warnings before deploying.${NC}"
    exit 0
else
    echo -e "${GREEN}✅ Security audit passed!${NC}"
    exit 0
fi


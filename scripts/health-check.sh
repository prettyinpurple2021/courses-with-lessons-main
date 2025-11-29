#!/bin/bash
# Health Check Script
# Verifies that all services are healthy after deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:80}"
MAX_RETRIES=5
RETRY_DELAY=10

echo "🏥 Running health checks..."
echo ""

FAILED=0

# Function to check HTTP endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $name... "
    
    for i in $(seq 1 $MAX_RETRIES); do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")
        
        if [ "$HTTP_CODE" = "$expected_status" ]; then
            echo -e "${GREEN}✅ Healthy (HTTP $HTTP_CODE)${NC}"
            return 0
        fi
        
        if [ $i -lt $MAX_RETRIES ]; then
            echo -n "(retry $i/$MAX_RETRIES in ${RETRY_DELAY}s)... "
            sleep $RETRY_DELAY
        fi
    done
    
    echo -e "${RED}❌ Unhealthy (HTTP $HTTP_CODE)${NC}"
    FAILED=$((FAILED + 1))
    return 1
}

# Function to check JSON endpoint
check_json_endpoint() {
    local name=$1
    local url=$2
    local expected_key=$3
    
    echo -n "Checking $name... "
    
    for i in $(seq 1 $MAX_RETRIES); do
        RESPONSE=$(curl -s --max-time 10 "$url" || echo "")
        
        if [ -n "$RESPONSE" ] && echo "$RESPONSE" | grep -q "$expected_key"; then
            echo -e "${GREEN}✅ Healthy${NC}"
            return 0
        fi
        
        if [ $i -lt $MAX_RETRIES ]; then
            echo -n "(retry $i/$MAX_RETRIES in ${RETRY_DELAY}s)... "
            sleep $RETRY_DELAY
        fi
    done
    
    echo -e "${RED}❌ Unhealthy${NC}"
    FAILED=$((FAILED + 1))
    return 1
}

# Backend Health Check
echo "Backend Health Checks:"
echo "===================="
check_json_endpoint "Backend API" "$BACKEND_URL/api/health" "status"
check_json_endpoint "Database Connection" "$BACKEND_URL/api/health" "database"
check_json_endpoint "Redis Connection" "$BACKEND_URL/api/health" "redis"
echo ""

# Frontend Health Check
echo "Frontend Health Checks:"
echo "======================"
check_endpoint "Frontend Application" "$FRONTEND_URL/health" "200"
check_endpoint "Frontend Root" "$FRONTEND_URL/" "200"
echo ""

# Summary
echo "=========================================="
echo "Health Check Summary"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED health check(s) failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check service logs: docker-compose logs"
    echo "2. Verify environment variables are set correctly"
    echo "3. Ensure all services are running: docker-compose ps"
    echo "4. Check network connectivity between services"
    exit 1
fi


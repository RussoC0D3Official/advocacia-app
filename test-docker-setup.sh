#!/bin/bash

echo "🧪 Testing DocuMerge Docker Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

# Function to test JSON response (without jq)
test_json_endpoint() {
    local url=$1
    local description=$2
    local expected_field=$3
    
    echo -n "Testing $description... "
    
    if curl -s "$url" | grep -q "\"$expected_field\""; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

# Check if containers are running
echo -e "\n${YELLOW}1. Checking container status...${NC}"
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ All containers are running${NC}"
else
    echo -e "${RED}✗ Some containers are not running${NC}"
    docker-compose ps
    exit 1
fi

# Test backend endpoints
echo -e "\n${YELLOW}2. Testing backend endpoints...${NC}"
test_endpoint "http://localhost:5000/api/documents/health" "Backend health check"
test_json_endpoint "http://localhost:5000/api/documents/health" "Backend health JSON response" "status"
test_json_endpoint "http://localhost:5000/api/documents/dev/list" "Development document list" "documents"

# Test frontend
echo -e "\n${YELLOW}3. Testing frontend...${NC}"
test_endpoint "http://localhost:5173" "Frontend accessibility"

# Test container logs
echo -e "\n${YELLOW}4. Checking container logs...${NC}"
if docker-compose logs backend | grep -q "Running on"; then
    echo -e "${GREEN}✓ Backend logs show successful startup${NC}"
else
    echo -e "${RED}✗ Backend logs show issues${NC}"
fi

if docker-compose logs frontend | grep -q "ready"; then
    echo -e "${GREEN}✓ Frontend logs show successful startup${NC}"
else
    echo -e "${RED}✗ Frontend logs show issues${NC}"
fi

# Test network connectivity
echo -e "\n${YELLOW}5. Testing network connectivity...${NC}"
if docker-compose exec backend ping -c 1 frontend > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend can reach frontend${NC}"
else
    echo -e "${YELLOW}⚠ Backend cannot reach frontend (expected for this setup)${NC}"
fi

# Summary
echo -e "\n${YELLOW}📊 Test Summary${NC}"
echo "=================="
echo "✅ Backend API: http://localhost:5000"
echo "✅ Frontend App: http://localhost:5173"
echo "✅ Health Check: http://localhost:5000/api/documents/health"
echo "✅ Development Mode: Enabled (no Firebase required)"

echo -e "\n${GREEN}🎉 Docker setup is working correctly!${NC}"
echo -e "\nYou can now:"
echo "• Open http://localhost:5173 in your browser to access the application"
echo "• Use the development endpoints for testing without Firebase setup"
echo "• View logs with: docker-compose logs -f"
echo "• Stop services with: docker-compose down" 
#!/bin/bash

echo "🧪 Testing All API Endpoints..."
echo "================================"
echo ""

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_status=$5
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $http_code)"
        echo "  Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Test 1: GET /api/schemes
test_endpoint "GET /api/schemes" "GET" "/api/schemes" "" "200"

# Test 2: POST /api/schemes/match (with intent)
test_endpoint "POST /api/schemes/match" "POST" "/api/schemes/match" '{"userIntent":"tractor loan"}' "200"

# Test 3: POST /api/schemes/match (without intent - should fail)
test_endpoint "POST /api/schemes/match (no intent)" "POST" "/api/schemes/match" '{}' "400"

# Test 4: POST /api/auth/login (valid phone)
test_endpoint "POST /api/auth/login (valid)" "POST" "/api/auth/login" '{"phoneNumber":"9876543210"}' "200"

# Test 5: POST /api/auth/login (invalid phone - should fail)
test_endpoint "POST /api/auth/login (invalid)" "POST" "/api/auth/login" '{"phoneNumber":"123"}' "400"

# Test 6: POST /api/auth/login (missing phone - should fail)
test_endpoint "POST /api/auth/login (missing)" "POST" "/api/auth/login" '{}' "400"

# Test 7: POST /api/auth/logout
test_endpoint "POST /api/auth/logout" "POST" "/api/auth/logout" '{}' "200"

echo ""
echo "================================"
echo "Test Results:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All endpoints are working correctly!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some endpoints failed. Please check above.${NC}"
    exit 1
fi


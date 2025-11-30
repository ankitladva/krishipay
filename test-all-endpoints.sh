#!/bin/bash

echo "🧪 Comprehensive API Endpoint Testing..."
echo "========================================"
echo ""

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_status=$5
    local cookie_file=$6
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        if [ -n "$cookie_file" ]; then
            response=$(curl -s -w "\n%{http_code}" -b "$cookie_file" "$BASE_URL$url")
        else
            response=$(curl -s -w "\n%{http_code}" "$BASE_URL$url")
        fi
    else
        if [ -n "$cookie_file" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -b "$cookie_file" \
                -d "$data" \
                "$BASE_URL$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$url")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $http_code)"
        echo "  Response: $body" | head -c 200
        echo ""
        ((FAILED++))
        return 1
    fi
}

# Clean up cookie file
COOKIE_FILE="/tmp/farmerkyc_cookies.txt"
rm -f "$COOKIE_FILE"

echo -e "${BLUE}=== Public Endpoints ===${NC}"
echo ""

# Test 1: GET /api/schemes
test_endpoint "GET /api/schemes" "GET" "/api/schemes" "" "200"

# Test 2: POST /api/schemes/match (with intent)
test_endpoint "POST /api/schemes/match (tractor)" "POST" "/api/schemes/match" '{"userIntent":"tractor loan"}' "200"

# Test 3: POST /api/schemes/match (dairy)
test_endpoint "POST /api/schemes/match (dairy)" "POST" "/api/schemes/match" '{"userIntent":"dairy loan"}' "200"

# Test 4: POST /api/schemes/match (without intent - should fail)
test_endpoint "POST /api/schemes/match (no intent)" "POST" "/api/schemes/match" '{}' "400"

echo ""
echo -e "${BLUE}=== Authentication Endpoints ===${NC}"
echo ""

# Test 5: POST /api/auth/login (valid phone) - Save cookies
echo -n "Testing POST /api/auth/login (save session)... "
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -c "$COOKIE_FILE" \
    -d '{"phoneNumber":"9876543210"}' \
    "$BASE_URL/api/auth/login")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Status: $http_code)"
    ((PASSED++))
    USER_ID=$(echo "$body" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  Session created, User ID: ${USER_ID:0:10}..."
else
    echo -e "${RED}✗ FAILED${NC} (Status: $http_code)"
    ((FAILED++))
fi

# Test 6: POST /api/auth/login (invalid phone - should fail)
test_endpoint "POST /api/auth/login (invalid)" "POST" "/api/auth/login" '{"phoneNumber":"123"}' "400"

# Test 7: POST /api/auth/login (missing phone - should fail)
test_endpoint "POST /api/auth/login (missing)" "POST" "/api/auth/login" '{}' "400"

# Test 8: POST /api/auth/logout
test_endpoint "POST /api/auth/logout" "POST" "/api/auth/logout" '{}' "200"

echo ""
echo -e "${BLUE}=== Authenticated Endpoints ===${NC}"
echo ""

# Re-login to get fresh session
echo -n "Re-authenticating for protected endpoints... "
curl -s -X POST \
    -H "Content-Type: application/json" \
    -c "$COOKIE_FILE" \
    -d '{"phoneNumber":"9876543210"}' \
    "$BASE_URL/api/auth/login" > /dev/null
echo -e "${GREEN}✓${NC}"
echo ""

# Test 9: POST /api/loan/create (authenticated)
SCHEME_ID=$(curl -s "$BASE_URL/api/schemes" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
test_endpoint "POST /api/loan/create" "POST" "/api/loan/create" \
    "{\"loanCategory\":\"Tractor\",\"extractedData\":{\"name\":\"Test User\",\"landArea\":2.5},\"geoValuation\":500000,\"matchedSchemeId\":\"$SCHEME_ID\"}" \
    "200" "$COOKIE_FILE"

# Test 10: POST /api/loan/create (without auth - should fail)
test_endpoint "POST /api/loan/create (no auth)" "POST" "/api/loan/create" \
    '{"loanCategory":"Tractor"}' \
    "401"

# Test 11: POST /api/loan/create (missing category - should fail)
test_endpoint "POST /api/loan/create (no category)" "POST" "/api/loan/create" \
    '{}' \
    "400" "$COOKIE_FILE"

echo ""
echo -e "${BLUE}=== File Upload Endpoint ===${NC}"
echo ""

# Test 12: POST /api/upload (authenticated) - Create a dummy image file
echo -n "Creating test image file... "
# Create a larger PNG file (at least 10KB)
dd if=/dev/urandom of=/tmp/test_image.png bs=1024 count=20 2>/dev/null
# Add PNG header to make it a valid PNG
printf '\x89PNG\r\n\x1a\n' > /tmp/test_image.png
dd if=/dev/urandom bs=1024 count=19 >> /tmp/test_image.png 2>/dev/null
echo -e "${GREEN}✓${NC}"

echo -n "Testing POST /api/upload (authenticated)... "
response=$(curl -s -w "\n%{http_code}" -X POST \
    -b "$COOKIE_FILE" \
    -F "file=@/tmp/test_image.png" \
    -F "documentType=land_record" \
    "$BASE_URL/api/upload")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Status: $http_code)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (Expected: 200, Got: $http_code)"
    echo "  Response: $body" | head -c 200
    echo ""
    ((FAILED++))
fi

# Test 13: POST /api/upload (without auth - should fail)
echo -n "Testing POST /api/upload (no auth)... "
response=$(curl -s -w "\n%{http_code}" -X POST \
    -F "file=@/tmp/test_image.png" \
    -F "documentType=land_record" \
    "$BASE_URL/api/upload")

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Status: $http_code)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (Expected: 401, Got: $http_code)"
    ((FAILED++))
fi

# Cleanup
rm -f "$COOKIE_FILE" /tmp/test_image.png

echo ""
echo "========================================"
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


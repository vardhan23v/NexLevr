#!/bin/sh
set -e

BASE_URL="http://localhost:5001"
TEST_EMAIL="auth-test-$(date +%s)@example.com"
TEST_PASSWORD="SecurePass123!"

echo "--- Register ---"
REGISTER_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Auth Test User\",\"role\":\"ADMIN\"}")
echo "$REGISTER_RESPONSE"
REGISTER_STATUS=$(echo "$REGISTER_RESPONSE" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
if [ "$REGISTER_STATUS" != "201" ]; then
  echo "Register failed with status $REGISTER_STATUS"
  exit 1
fi

echo ""
echo "--- Login ---"
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
echo "$LOGIN_RESPONSE"
LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
if [ "$LOGIN_STATUS" != "200" ]; then
  echo "Login failed with status $LOGIN_STATUS"
  exit 1
fi
TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n '1p' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "--- Me ---"
ME_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")
echo "$ME_RESPONSE"
ME_STATUS=$(echo "$ME_RESPONSE" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
if [ "$ME_STATUS" != "200" ]; then
  echo "Get current user failed with status $ME_STATUS"
  exit 1
fi

echo ""
echo "--- Me without token ---"
ME_NO_TOKEN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/auth/me")
echo "$ME_NO_TOKEN_RESPONSE"
ME_NO_TOKEN_STATUS=$(echo "$ME_NO_TOKEN_RESPONSE" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
if [ "$ME_NO_TOKEN_STATUS" != "401" ]; then
  echo "Expected 401 for missing token, got $ME_NO_TOKEN_STATUS"
  exit 1
fi

echo ""
echo "--- Logout ---"
LOGOUT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/auth/logout")
echo "$LOGOUT_RESPONSE"
LOGOUT_STATUS=$(echo "$LOGOUT_RESPONSE" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
if [ "$LOGOUT_STATUS" != "200" ]; then
  echo "Logout failed with status $LOGOUT_STATUS"
  exit 1
fi

echo ""
echo "--- Validation error ---"
INVALID_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"short","name":""}')
echo "$INVALID_RESPONSE"
INVALID_STATUS=$(echo "$INVALID_RESPONSE" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
if [ "$INVALID_STATUS" != "400" ]; then
  echo "Expected 400 for invalid input, got $INVALID_STATUS"
  exit 1
fi

echo ""
echo "All auth API checks passed."

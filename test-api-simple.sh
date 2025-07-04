#!/bin/bash

echo "🔍 Testing Cash Payment API Step by Step..."
echo ""

# Step 1: Test login
echo "Step 1: Testing login..."
LOGIN_RESULT=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@smart-s.com", "password": "password123"}')

HTTP_STATUS=$(echo $LOGIN_RESULT | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
LOGIN_BODY=$(echo $LOGIN_RESULT | sed -e 's/HTTPSTATUS\:.*//g')

echo "Login HTTP Status: $HTTP_STATUS"
echo "Login Response: $LOGIN_BODY"

if [ $HTTP_STATUS -ne 200 ]; then
    echo "❌ Login failed with status $HTTP_STATUS"
    exit 1
fi

# Extract token using grep and sed
TOKEN=$(echo $LOGIN_BODY | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to extract token from login response"
    exit 1
fi

echo "✅ Login successful, token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test cash payment endpoint directly
echo "Step 2: Testing cash payment endpoint..."
PAYMENT_RESULT=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST http://localhost:3000/api/v1/payment/pay-with-cash \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_id", "fee_id": "test_fee_id"}')

PAYMENT_HTTP_STATUS=$(echo $PAYMENT_RESULT | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
PAYMENT_BODY=$(echo $PAYMENT_RESULT | sed -e 's/HTTPSTATUS\:.*//g')

echo "Payment HTTP Status: $PAYMENT_HTTP_STATUS"
echo "Payment Response: $PAYMENT_BODY"

if [ $PAYMENT_HTTP_STATUS -eq 200 ] || [ $PAYMENT_HTTP_STATUS -eq 201 ]; then
    echo "✅ Payment endpoint is working"
else
    echo "❌ Payment failed with status $PAYMENT_HTTP_STATUS"
    echo "This is likely the error causing the red toast!"
fi

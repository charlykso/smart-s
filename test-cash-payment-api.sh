#!/bin/bash

echo "🔍 Testing Cash Payment API with cURL..."
echo ""

# Test login first
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "bursaruser@example.com",
    "password": "Password123!"
  }')

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Extract token (assuming JSON response with "token" field)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token from login response"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."
echo ""

# Test getting students
echo "2. Testing student retrieval..."
STUDENTS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/school-access/get-students-by-role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Students response: $STUDENTS_RESPONSE"
echo ""

# Test getting fees
echo "3. Testing fee retrieval..."
FEES_RESPONSE=$(curl -s -X GET http://localhost:5000/api/fee \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Fees response: $FEES_RESPONSE"
echo ""

# Test cash payment with sample data
echo "4. Testing cash payment..."
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/payment/pay-with-cash \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user": "sample_user_id",
    "fee": "sample_fee_id",
    "amount": 1000,
    "paymentType": "full",
    "notes": "Test payment"
  }')

echo "Payment response: $PAYMENT_RESPONSE"
echo ""

echo "🔍 Complete API test finished."

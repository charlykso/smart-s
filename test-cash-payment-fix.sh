#!/bin/bash

echo "🧪 Testing Cash Payment Fix"
echo "=========================="

# Fresh login as bursar
echo "1. Logging in as Bursar..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"bursar@smartschool.edu","password":"password123"}' \
  http://localhost:3000/api/v1/auth/login)

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"

# Get students
echo "2. Getting students..."
STUDENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/user/student/all)

STUDENT_ID=$(echo $STUDENTS_RESPONSE | jq -r '.data[0]._id')

if [ "$STUDENT_ID" = "null" ]; then
  echo "❌ No students found"
  exit 1
fi

echo "✅ Found student: $STUDENT_ID"

# Get fees
echo "3. Getting approved fees..."
FEES_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/fee/get-approved-fees)

FEE_ID=$(echo $FEES_RESPONSE | jq -r '.[0]._id')

if [ "$FEE_ID" = "null" ]; then
  echo "❌ No fees found"
  exit 1
fi

echo "✅ Found fee: $FEE_ID"

# Test cash payment
echo "4. Testing cash payment..."
PAYMENT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"user_id\":\"$STUDENT_ID\",\"fee_id\":\"$FEE_ID\"}" \
  http://localhost:3000/api/v1/payment/pay-with-cash)

if echo $PAYMENT_RESPONSE | grep -q "Payment successful"; then
  echo "✅ Cash payment processed successfully!"
  echo "   Payment details:"
  echo $PAYMENT_RESPONSE | jq '.payment | {trx_ref, amount, status}'
else
  echo "❌ Cash payment failed:"
  echo $PAYMENT_RESPONSE
fi

echo ""
echo "🎉 Test completed!"

#!/bin/bash

echo "🏗️ Creating Payment Profile for Smart School Academy..."
echo ""

# Generate a simple JWT token (this is just for testing)
# In production, this would be done properly with the JWT library
# For now, let's use a test admin login to get a real token

echo "📡 Step 1: Login as admin to get authentication token..."

# Login as admin
ADMIN_LOGIN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartschool.edu",
    "password": "admin123"
  }')

# Extract token from response
TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get admin token. Login response:"
  echo $ADMIN_LOGIN
  exit 1
fi

echo "✅ Got admin token: ${TOKEN:0:20}..."
echo ""

echo "📤 Step 2: Creating payment profile..."

# Create payment profile
PROFILE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/paymentProfile/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "school_id": "507f1f77bcf86cd799439012",
    "ps_public_key": "pk_test_demo_paystack_public_key",
    "ps_secret_key": "sk_test_demo_paystack_secret_key",
    "fw_public_key": "FLWPUBK_TEST-demo_flutterwave_public_key", 
    "fw_secret_key": "FLWSECK_TEST-demo_flutterwave_secret_key",
    "account_no": "0123456789",
    "account_name": "Smart School Academy",
    "bank_name": "First Bank Nigeria"
  }')

echo "📋 Profile creation response:"
echo $PROFILE_RESPONSE | jq '.' 2>/dev/null || echo $PROFILE_RESPONSE
echo ""

echo "🧪 Step 3: Testing payment methods API..."

# Test payment methods API
METHODS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/v1/payment/available-methods/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer $TOKEN")

echo "📊 Payment methods response:"
echo $METHODS_RESPONSE | jq '.' 2>/dev/null || echo $METHODS_RESPONSE
echo ""

echo "🎓 Step 4: Testing student view (filtering out cash)..."

# Extract available methods and filter out cash
echo $METHODS_RESPONSE | jq '.data | map(select(.method != "cash")) | .[] | "💳 \(.name): \(.description)"' 2>/dev/null || echo "Could not parse response"

echo ""
echo "✅ Payment profile integration test complete!"

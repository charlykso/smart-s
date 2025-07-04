#!/bin/bash

# Test script to check existing students
API_BASE="http://localhost:3000/api/v1"

echo "=== Getting Admin Token ==="
ADMIN_TOKEN=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@smart-s.com", "password": "password123"}' \
  | jq -r '.data.token // empty')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo "❌ Failed to get admin token"
  echo "Trying to get full response:"
  curl -s -X POST $API_BASE/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@smart-s.com", "password": "password123"}'
  exit 1
fi

echo "✅ Admin token obtained"

echo ""
echo "=== Getting All Students ==="
curl -s -X GET $API_BASE/user/students \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.data[] | {email, firstname, lastname, regNo, school, roles}'

echo ""
echo "=== Getting Schools ==="
curl -s -X GET $API_BASE/school/all \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.[] | {_id, name}'

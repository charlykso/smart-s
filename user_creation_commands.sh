#!/bin/bash

# Script to create ICT_Administrator, Proprietor, and Bursar for all schools
# This will create addresses first, then users

BASE_URL="http://localhost:3000/api/v1"

echo "Creating addresses for users..."

# Create addresses for ICT Administrators
echo "Creating ICT Admin addresses..."
ICT_ADDR_1=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"ICT Admin Street 1","street_no":1,"zip_code":480211}' | jq -r '._id')
ICT_ADDR_2=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"ICT Admin Street 2","street_no":2,"zip_code":480211}' | jq -r '._id')
ICT_ADDR_3=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"ICT Admin Street 3","street_no":3,"zip_code":480211}' | jq -r '._id')
ICT_ADDR_4=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"ICT Admin Street 4","street_no":4,"zip_code":480211}' | jq -r '._id')
ICT_ADDR_5=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"ICT Admin Street 5","street_no":5,"zip_code":480211}' | jq -r '._id')

# Create addresses for Proprietors
echo "Creating Proprietor addresses..."
PROP_ADDR_1=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Proprietor Street 1","street_no":11,"zip_code":480211}' | jq -r '._id')
PROP_ADDR_2=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Proprietor Street 2","street_no":12,"zip_code":480211}' | jq -r '._id')
PROP_ADDR_3=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Proprietor Street 3","street_no":13,"zip_code":480211}' | jq -r '._id')
PROP_ADDR_4=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Proprietor Street 4","street_no":14,"zip_code":480211}' | jq -r '._id')
PROP_ADDR_5=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Proprietor Street 5","street_no":15,"zip_code":480211}' | jq -r '._id')

# Create addresses for Bursars
echo "Creating Bursar addresses..."
BURSAR_ADDR_1=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Bursar Street 1","street_no":21,"zip_code":480211}' | jq -r '._id')
BURSAR_ADDR_2=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Bursar Street 2","street_no":22,"zip_code":480211}' | jq -r '._id')
BURSAR_ADDR_3=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Bursar Street 3","street_no":23,"zip_code":480211}' | jq -r '._id')
BURSAR_ADDR_4=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Bursar Street 4","street_no":24,"zip_code":480211}' | jq -r '._id')
BURSAR_ADDR_5=$(curl -s -X POST $BASE_URL/Address -H "Content-Type: application/json" -d '{"country":"Nigeria","state":"Ebonyi","town":"Abakaliki","street":"Bursar Street 5","street_no":25,"zip_code":480211}' | jq -r '._id')

echo "Addresses created successfully!"
echo "ICT Admin addresses: $ICT_ADDR_1, $ICT_ADDR_2, $ICT_ADDR_3, $ICT_ADDR_4, $ICT_ADDR_5"
echo "Proprietor addresses: $PROP_ADDR_1, $PROP_ADDR_2, $PROP_ADDR_3, $PROP_ADDR_4, $PROP_ADDR_5"
echo "Bursar addresses: $BURSAR_ADDR_1, $BURSAR_ADDR_2, $BURSAR_ADDR_3, $BURSAR_ADDR_4, $BURSAR_ADDR_5"

# School IDs
SCHOOL_1="68405b7d80498c76b2126e71"  # Annunciation Secondary School
SCHOOL_2="68405fd33f705d8a6ae77355"  # Annunciation Primary School  
SCHOOL_3="684062343f705d8a6ae773b6"  # Holyghost Secondary School
SCHOOL_4="684063521c5ba900ed1c9302"  # Test School Fixed
SCHOOL_5="68406529007c8504c1f3f6aa"  # Annunciation Nursery School

echo "Creating users..."

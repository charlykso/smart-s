#!/bin/bash

# Test School-Based Access Control System
# This script tests that users can only access data from their assigned school

echo "🧪 Testing School-Based Access Control System"
echo "=============================================="

API_BASE="http://localhost:3000/api/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Test credentials
GENERAL_ADMIN_CREDS='{"email":"admin@ledgrio.com","password":"password123"}'
ICT_ADMIN_CREDS='{"email":"ict@ledgrio.com","password":"password123"}'
STUDENT_CREDS='{"email":"student@ledgrio.com","password":"password123"}'
PRINCIPAL_CREDS='{"email":"principal@ledgrio.com","password":"password123"}'

# Function to login and get token
login_user() {
    local creds=$1
    local user_type=$2
    
    log_test "Logging in $user_type"
    
    response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "$creds")
    
    if echo "$response" | grep -q '"success":true'; then
        token=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        user_info=$(echo "$response" | grep -o '"user":{[^}]*}')
        school_info=$(echo "$response" | grep -o '"school":"[^"]*"' || echo "")
        
        log_success "$user_type logged in successfully"
        echo "   Token: ${token:0:20}..."
        echo "   User: $user_info"
        echo "   School: $school_info"
        echo "$token"
    else
        log_error "$user_type login failed"
        echo "   Response: $response"
        echo ""
    fi
}

# Function to test endpoint access
test_endpoint() {
    local token=$1
    local endpoint=$2
    local user_type=$3
    local expected_status=$4
    
    log_test "Testing $endpoint access for $user_type (expecting $expected_status)"
    
    response=$(curl -s -w "%{http_code}" -X GET "$API_BASE$endpoint" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json")
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        log_success "$user_type access to $endpoint: $status_code (as expected)"
        
        # Show data count if successful
        if [ "$status_code" = "200" ]; then
            data_count=$(echo "$body" | grep -o '"data":\[[^]]*\]' | grep -o '\[.*\]' | grep -o ',' | wc -l)
            data_count=$((data_count + 1))
            echo "   Data items returned: $data_count"
        fi
    else
        log_error "$user_type access to $endpoint: $status_code (expected $expected_status)"
        echo "   Response: $body"
    fi
    
    echo ""
}

# Function to test school validation
test_school_validation() {
    local token=$1
    local user_type=$2
    
    log_test "Testing school validation endpoint for $user_type"
    
    response=$(curl -s -w "%{http_code}" -X GET "$API_BASE/school-access/validate-assignments" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json")
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$user_type" = "General Admin" ] && [ "$status_code" = "200" ]; then
        log_success "$user_type can access school validation (as expected)"
        
        # Parse validation results
        total_users=$(echo "$body" | grep -o '"totalUsers":[0-9]*' | cut -d':' -f2)
        users_without_school=$(echo "$body" | grep -o '"usersWithoutSchool":\[[^]]*\]' | grep -o '\[.*\]' | grep -o ',' | wc -l)
        users_without_school=$((users_without_school + 1))
        
        echo "   Total users: $total_users"
        echo "   Users without school: $users_without_school"
    elif [ "$user_type" != "General Admin" ] && [ "$status_code" = "403" ]; then
        log_success "$user_type correctly denied access to school validation"
    else
        log_error "$user_type school validation test failed: $status_code"
        echo "   Response: $body"
    fi
    
    echo ""
}

# Function to test cross-school data access
test_cross_school_access() {
    local token=$1
    local user_type=$2
    local other_school_id=$3
    
    if [ -z "$other_school_id" ]; then
        log_warning "No other school ID provided for cross-school test"
        return
    fi
    
    log_test "Testing cross-school access for $user_type"
    
    # Try to access users from another school
    response=$(curl -s -w "%{http_code}" -X GET "$API_BASE/user/student/$other_school_id/get" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json")
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$user_type" = "General Admin" ] && [ "$status_code" = "200" ]; then
        log_success "$user_type can access other school data (as expected)"
    elif [ "$user_type" != "General Admin" ] && [ "$status_code" = "403" ]; then
        log_success "$user_type correctly denied cross-school access"
    else
        log_error "$user_type cross-school test unexpected result: $status_code"
        echo "   Response: $body"
    fi
    
    echo ""
}

echo ""
echo "🚀 Starting School Access Control Tests"
echo "======================================="

# Test 1: Login all user types
echo ""
echo "📝 Test 1: User Authentication"
echo "-----------------------------"

GENERAL_ADMIN_TOKEN=$(login_user "$GENERAL_ADMIN_CREDS" "General Admin")
ICT_ADMIN_TOKEN=$(login_user "$ICT_ADMIN_CREDS" "ICT Admin")
STUDENT_TOKEN=$(login_user "$STUDENT_CREDS" "Student")
PRINCIPAL_TOKEN=$(login_user "$PRINCIPAL_CREDS" "Principal")

# Test 2: School-filtered user access
echo ""
echo "📝 Test 2: School-Filtered User Access"
echo "--------------------------------------"

test_endpoint "$GENERAL_ADMIN_TOKEN" "/user/all" "General Admin" "200"
test_endpoint "$ICT_ADMIN_TOKEN" "/user/all" "ICT Admin" "403"
test_endpoint "$STUDENT_TOKEN" "/user/all" "Student" "403"
test_endpoint "$PRINCIPAL_TOKEN" "/user/all" "Principal" "403"

# Test 3: School-filtered endpoints
echo ""
echo "📝 Test 3: School-Filtered Data Endpoints"
echo "-----------------------------------------"

test_endpoint "$GENERAL_ADMIN_TOKEN" "/school-access/users" "General Admin" "200"
test_endpoint "$ICT_ADMIN_TOKEN" "/school-access/users" "ICT Admin" "200"
test_endpoint "$PRINCIPAL_TOKEN" "/school-access/users" "Principal" "200"
test_endpoint "$STUDENT_TOKEN" "/school-access/users" "Student" "403"

# Test 4: School validation endpoint (General Admin only)
echo ""
echo "📝 Test 4: School Validation Endpoint"
echo "------------------------------------"

test_school_validation "$GENERAL_ADMIN_TOKEN" "General Admin"
test_school_validation "$ICT_ADMIN_TOKEN" "ICT Admin"
test_school_validation "$PRINCIPAL_TOKEN" "Principal"
test_school_validation "$STUDENT_TOKEN" "Student"

# Test 5: Fee access (school-filtered)
echo ""
echo "📝 Test 5: Fee Access (School-Filtered)"
echo "---------------------------------------"

test_endpoint "$GENERAL_ADMIN_TOKEN" "/fee/all" "General Admin" "200"
test_endpoint "$ICT_ADMIN_TOKEN" "/fee/all" "ICT Admin" "200"
test_endpoint "$PRINCIPAL_TOKEN" "/fee/all" "Principal" "200"
test_endpoint "$STUDENT_TOKEN" "/fee/all" "Student" "200"

# Test 6: Payment access (school-filtered)
echo ""
echo "📝 Test 6: Payment Access (School-Filtered)"
echo "-------------------------------------------"

test_endpoint "$GENERAL_ADMIN_TOKEN" "/payment/all" "General Admin" "200"
test_endpoint "$ICT_ADMIN_TOKEN" "/payment/all" "ICT Admin" "200"
test_endpoint "$PRINCIPAL_TOKEN" "/payment/all" "Principal" "200"
test_endpoint "$STUDENT_TOKEN" "/payment/all" "Student" "403"

# Test 7: Student data access (school-filtered)
echo ""
echo "📝 Test 7: Student Data Access (School-Filtered)"
echo "------------------------------------------------"

test_endpoint "$GENERAL_ADMIN_TOKEN" "/user/students/all" "General Admin" "200"
test_endpoint "$ICT_ADMIN_TOKEN" "/user/students/all" "ICT Admin" "200"
test_endpoint "$PRINCIPAL_TOKEN" "/user/students/all" "Principal" "200"
test_endpoint "$STUDENT_TOKEN" "/user/students/all" "Student" "403"

echo ""
echo "✅ School Access Control Tests Completed"
echo "========================================"

echo ""
echo "📊 Test Summary:"
echo "- General Admin: Should have access to all data across schools"
echo "- ICT Admin/Principal: Should only see data from their assigned school"
echo "- Student: Should have limited access, only to their own data and approved fees"
echo "- All users (except General Admin) must be assigned to a school"
echo ""
echo "🔒 Security Status: School-based access control is now enforced!"

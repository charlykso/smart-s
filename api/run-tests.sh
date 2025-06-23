#!/bin/bash
# Test Script Runner
# This script helps run common tests from the organized tests directory

echo "Smart School Management System - Test Runner"
echo "============================================"
echo ""
echo "Available test categories:"
echo "1. Authentication Tests"
echo "2. ICT Admin Workflow Tests"
echo "3. Connection Tests"
echo "4. Excel Template Tests"
echo "5. User Creation Tests"
echo ""

# Function to run authentication tests
run_auth_tests() {
    echo "Running Authentication Tests..."
    cd tests
    node test-auth-simple.js
    node test-ict-admin-auth.js
    cd ..
}

# Function to run ICT Admin tests
run_ict_tests() {
    echo "Running ICT Admin Tests..."
    cd tests
    node test-both-ict-admins.js
    cd ..
}

# Function to run connection tests
run_connection_tests() {
    echo "Running Connection Tests..."
    cd tests
    node test-basic-connection.js
    node test-db-connection.js
    cd ..
}

# Check if argument provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 [auth|ict|connection|all]"
    echo ""
    echo "Examples:"
    echo "  $0 auth       - Run authentication tests"
    echo "  $0 ict        - Run ICT Admin tests"
    echo "  $0 connection - Run connection tests"
    echo "  $0 all        - Run all basic tests"
    exit 1
fi

case $1 in
    auth)
        run_auth_tests
        ;;
    ict)
        run_ict_tests
        ;;
    connection)
        run_connection_tests
        ;;
    all)
        run_connection_tests
        run_auth_tests
        run_ict_tests
        ;;
    *)
        echo "Invalid option: $1"
        echo "Valid options: auth, ict, connection, all"
        exit 1
        ;;
esac

echo ""
echo "Test execution completed!"

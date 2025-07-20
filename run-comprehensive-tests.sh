#!/bin/bash

echo "================================================================"
echo "LEDGRIO School Accounting System - Comprehensive Test Runner"
echo "================================================================"
echo

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version
echo

# Check if we're in the right directory
if [ ! -f "api/server.js" ]; then
    echo "ERROR: Please run this script from the root directory of the project"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "================================================================"
echo "STEP 1: Setting up test environment"
echo "================================================================"
echo

# Setup test environment
echo "Creating test users and school data..."
cd tests
node setup-test-environment.js
if [ $? -ne 0 ]; then
    echo "WARNING: Test environment setup had issues, continuing..."
fi
cd ..
echo

echo "================================================================"
echo "STEP 2: Starting API server"
echo "================================================================"
echo

# Start the API server in background
echo "Starting Ledgrio API server on port 3000..."
cd api
node server.js &
SERVER_PID=$!
cd ..

# Wait for server to start
echo "Waiting for server to initialize..."
sleep 5

echo
echo "================================================================"
echo "STEP 3: Running comprehensive tests"
echo "================================================================"
echo

# Run the comprehensive test suite
echo "Running all user role tests..."
cd tests
node run-all-tests.js
TEST_RESULT=$?
cd ..

echo
echo "================================================================"
echo "STEP 4: Test completion"
echo "================================================================"
echo

if [ $TEST_RESULT -eq 0 ]; then
    echo "SUCCESS: All tests completed successfully!"
    echo "The Ledgrio School Accounting System is ready for use."
else
    echo "WARNING: Some tests may have failed."
    echo "Please review the test output above for details."
fi

echo
echo "================================================================"
echo "Cleaning up..."
echo "================================================================"

# Kill the background server process
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null
    echo "Server process terminated."
fi

echo
echo "Test run complete."
echo "================================================================"

exit $TEST_RESULT

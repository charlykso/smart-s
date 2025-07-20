@echo off
echo ================================================================
echo LEDGRIO School Accounting System - Comprehensive Test Runner
echo ================================================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if we're in the right directory
if not exist "api\server.js" (
    echo ERROR: Please run this script from the root directory of the project
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo ================================================================
echo STEP 1: Setting up test environment
echo ================================================================
echo.

REM Setup test environment
echo Creating test users and school data...
cd tests
node setup-test-environment.js
if %errorlevel% neq 0 (
    echo WARNING: Test environment setup had issues, continuing...
)
cd ..
echo.

echo ================================================================
echo STEP 2: Starting API server
echo ================================================================
echo.

REM Start the API server in background
echo Starting Ledgrio API server on port 3000...
cd api
start /B node server.js
cd ..

REM Wait for server to start
echo Waiting for server to initialize...
timeout /t 5 /nobreak >nul

echo.
echo ================================================================
echo STEP 3: Running comprehensive tests
echo ================================================================
echo.

REM Run the comprehensive test suite
echo Running all user role tests...
cd tests
node run-all-tests.js
set TEST_RESULT=%errorlevel%
cd ..

echo.
echo ================================================================
echo STEP 4: Test completion
echo ================================================================
echo.

if %TEST_RESULT% equ 0 (
    echo SUCCESS: All tests completed successfully!
    echo The Ledgrio School Accounting System is ready for use.
) else (
    echo WARNING: Some tests may have failed.
    echo Please review the test output above for details.
)

echo.
echo ================================================================
echo Cleaning up...
echo ================================================================

REM Kill the background server process
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Test run complete. Press any key to exit...
pause >nul

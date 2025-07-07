# Smart School Academy - Test Suite

This directory contains comprehensive test suites for all user types in the Smart School Academy system.

## Test Files

- **`create-system-admin.js`** - Creates the system administrator account (admin@ledgrio.com)
- **`test-student.js`** - Tests student authentication, fees, payments, and dashboard functionality
- **`test-admin.js`** - Tests admin authentication, user management, and system operations
- **`test-ict-admin.js`** - Tests ICT administrator functionality, school management, and bulk uploads
- **`test-bursar.js`** - Tests bursar authentication, fee management, and payment processing
- **`test-principal.js`** - Tests principal authentication, school oversight, and reporting
- **`run-all-tests.js`** - Master test runner that executes all test suites

## Running Tests

### Individual Tests

```bash
# Test specific user type
node tests/test-student.js
node tests/test-admin.js
node tests/test-ict-admin.js
node tests/test-bursar.js
node tests/test-principal.js
```

### Run All Tests

```bash
# Run comprehensive test suite for all user types
node tests/run-all-tests.js
```

## Prerequisites

1. **Backend server** must be running on `http://localhost:3001`
2. **Database** must be connected and populated with test users
3. **Test credentials** for each user type should exist:
   - Student: `student@smart-s.com` / `password123`
   - Admin: `admin@smart-s.com` / `password123`
   - ICT Admin: `ictadmin@smart-s.com` / `password123`
   - Bursar: `bursar@smart-s.com` / `password123`
   - Principal: `principal@smart-s.com` / `password123`

## Test Coverage

Each test suite covers:

- ✅ Authentication and authorization
- ✅ User profile retrieval
- ✅ Role-specific functionality
- ✅ API endpoint accessibility
- ✅ Data retrieval and manipulation
- ✅ Error handling

## Output

Tests provide detailed console output showing:

- ✅ Successful operations
- ❌ Failed operations
- ℹ️ Optional/unavailable features
- 📊 Summary statistics

The master test runner provides a comprehensive report of all system components.

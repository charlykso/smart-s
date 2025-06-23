# Test and Utility Scripts

This directory contains all test, debug, and utility scripts for the Smart School Management System backend.

## File Categories

### Authentication & Login Tests

- `test-auth-flow.js` - Complete authentication flow testing
- `test-auth-simple.js` - Simple authentication test
- `test-ict-admin-auth.js` - ICT Admin authentication testing
- `test-ict-admin-login.js` - ICT Admin login testing

### Connection & Database Tests

- `test-basic-connection.js` - Basic server connection test
- `test-db-connection.js` - Database connection test

### Endpoint Tests

- `test-endpoints.js` - General endpoint testing
- `test-admin-ict-endpoints.js` - Admin and ICT Admin endpoint tests
- `test-ict-admin-endpoints.js` - ICT Admin specific endpoint tests
- `testAdminEndpoints.js` - Admin endpoint testing
- `testBulkUploadEndpoints.js` - Bulk upload endpoint testing
- `test-routes.js` - Route testing

### ICT Admin Workflow Tests

- `test-ict-workflow-complete.js` - Complete ICT Admin workflow test
- `test-both-ict-admins.js` - Testing with multiple ICT Admins
- `test-final-both.js` - Final test for both ICT Admins
- `test-second-ict-admin.js` - Second ICT Admin testing
- `test-second-ict-now.js` - Current second ICT Admin test

### Excel Template Tests

- `test-excel-with-group-logo.js` - Excel template with group logo
- `test-exceljs-with-image.js` - Excel template with image using ExcelJS
- `test-professional-template.js` - Professional Excel template test
- `test-simple-template.js` - Simple template test
- `test-template-download.js` - Template download test
- `test-template-with-logo.js` - Template with logo test
- `test-student-count.js` - Student count validation test

### User Creation Scripts

- `createAllTestUsers.js` - Create all test users
- `createTestUser.js` - Create individual test user
- `createGeneralAdmin.js` - Create General Admin user
- `createSchoolUsers.js` - Create school users
- `createStudentUser.js` - Create student user

### ICT Admin Creation Scripts

- `create-ict-admin-setup.js` - ICT Admin setup script
- `create-ict-admin-simple.js` - Simple ICT Admin creation
- `create-ict-admin-native.js` - Native ICT Admin creation
- `create-ict-admin-final.js` - Final ICT Admin creation
- `create-ict-admin-direct.js` - Direct ICT Admin creation
- `create-second-ict-admin-setup.js` - Second ICT Admin setup
- `create-second-ict-admin-clean.js` - Clean second ICT Admin creation
- `create-second-ict-admin-final.js` - Final second ICT Admin creation
- `create-second-ict-simple.js` - Simple second ICT Admin creation
- `create-proper-second-ict.js` - Proper second ICT Admin creation
- `create-bluefield-ict-admin.js` - Bluefield ICT Admin creation
- `create-bluefield-final.js` - Final Bluefield creation
- `quick-ict-create.js` - Quick ICT Admin creation
- `final-second-ict.js` - Final second ICT creation

### Debug Scripts

- `debug-group-schools.js` - Debug group schools
- `debug-ict-access.js` - Debug ICT Admin access
- `debug-schools-endpoint.js` - Debug schools endpoint
- `debug-schools-simple.js` - Simple schools debug
- `debugFeeRoute.js` - Debug fee route

### Utility Scripts

- `list-all-resources.js` - List all system resources
- `list-ict-admins.js` - List ICT Admins
- `list-resources.js` - List resources
- `check-schools.js` - Check schools status
- `checkICTAdminGroupSchool.js` - Check ICT Admin group school associations

## How to Use These Scripts

### Prerequisites

1. **Start the Backend Server**

   ```bash
   cd api
   npm start
   # or
   node server.js
   ```

   The server should be running on `http://localhost:3000`

2. **Ensure Database Connection**
   - MongoDB should be running and accessible
   - Check `.env` file for correct database configuration

### Running Individual Scripts

```bash
cd api/tests
node <script-name>.js
```

### Common Usage Workflows

#### 1. **Setting Up Test Environment**

```bash
# Test database connection first
node test-db-connection.js

# Create test users
node createAllTestUsers.js
node createGeneralAdmin.js

# Create ICT Admin and associated schools
node create-ict-admin-setup.js
```

#### 2. **Testing Authentication Flow**

```bash
# Basic authentication test
node test-auth-simple.js

# Complete authentication workflow
node test-auth-flow.js

# ICT Admin specific authentication
node test-ict-admin-auth.js
```

#### 3. **Testing ICT Admin Workflow**

```bash
# Create ICT Admin setup
node create-ict-admin-setup.js

# Test ICT Admin login and endpoints
node test-ict-admin-login.js
node test-ict-admin-endpoints.js

# Complete workflow test
node test-ict-workflow-complete.js
```

#### 4. **Multiple ICT Admin Testing**

```bash
# Create second ICT Admin
node create-second-ict-admin-final.js

# Test both ICT Admins
node test-both-ict-admins.js
node test-final-both.js
```

#### 5. **Excel Template Testing**

```bash
# Test template generation
node test-simple-template.js
node test-professional-template.js

# Test templates with logos
node test-template-with-logo.js
node test-excel-with-group-logo.js
```

#### 6. **Debugging and Inspection**

```bash
# List all resources
node list-all-resources.js

# Debug specific components
node debug-group-schools.js
node debug-schools-simple.js

# Check ICT Admin associations
node checkICTAdminGroupSchool.js
```

### Using the Test Runner Script

From the main `api` directory:

```bash
# Run authentication tests
./run-tests.sh auth

# Run ICT Admin tests
./run-tests.sh ict

# Run connection tests
./run-tests.sh connection

# Run all basic tests
./run-tests.sh all
```

### Recommended Test Sequence

For a complete system test, run scripts in this order:

1. **Environment Setup**

   ```bash
   node test-basic-connection.js
   node test-db-connection.js
   ```

2. **User Creation**

   ```bash
   node createGeneralAdmin.js
   node create-ict-admin-setup.js
   node create-second-ict-admin-final.js
   ```

3. **Authentication Testing**

   ```bash
   node test-auth-simple.js
   node test-ict-admin-auth.js
   ```

4. **Functionality Testing**

   ```bash
   node test-ict-workflow-complete.js
   node test-both-ict-admins.js
   node test-professional-template.js
   ```

5. **Verification**
   ```bash
   node list-all-resources.js
   node test-final-both.js
   ```

### Script Parameters and Configuration

Most scripts use these default configurations:

- **Base URL**: `http://localhost:3000/api/v1`
- **Test Credentials**: Defined within each script
- **Database**: Uses the same database as the main application

### Troubleshooting

#### Common Issues:

1. **Connection Refused**

   ```bash
   # Make sure server is running
   cd api
   node server.js
   ```

2. **Authentication Errors**

   ```bash
   # Check if users exist
   node list-ict-admins.js

   # Recreate users if needed
   node create-ict-admin-setup.js
   ```

3. **Database Errors**

   ```bash
   # Test database connection
   node test-db-connection.js

   # Check MongoDB status
   ```

4. **Template Generation Errors**

   ```bash
   # Check if group schools exist
   node debug-group-schools.js

   # Test simple template first
   node test-simple-template.js
   ```

### Script Categories Quick Reference

| Category           | Purpose                        | Key Scripts                                                   |
| ------------------ | ------------------------------ | ------------------------------------------------------------- |
| **Setup**          | Initial environment setup      | `test-db-connection.js`, `createGeneralAdmin.js`              |
| **Authentication** | Login and auth testing         | `test-auth-simple.js`, `test-ict-admin-auth.js`               |
| **ICT Admin**      | ICT Admin workflow testing     | `test-ict-workflow-complete.js`, `test-both-ict-admins.js`    |
| **Templates**      | Excel template testing         | `test-professional-template.js`, `test-template-with-logo.js` |
| **Debug**          | Troubleshooting and inspection | `list-all-resources.js`, `debug-group-schools.js`             |

## Notes

- **Server Required**: Most endpoint tests require the backend server to be running
- **Database Connection**: All tests require a valid MongoDB connection
- **Test Data**: Some scripts create test data in the database
- **Console Output**: Check console for detailed test results and error messages
- **Cleanup**: Some scripts may leave test data; use list scripts to verify state
- **Order Matters**: Some tests depend on data created by other scripts

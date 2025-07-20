# Ledgrio School Accounting System - Comprehensive Test Guide

## Overview

This guide provides step-by-step instructions for running comprehensive tests on the Ledgrio School Accounting System. The tests cover all user roles from System Admin to Student, ensuring complete functionality across the entire system.

## System Architecture

**Ledgrio** is a comprehensive school accounting system with the following user roles:

1. **System Admin** - Full system access, manages all schools and users
2. **ICT Administrator** - School-scoped technical management and user creation
3. **School Principal** - Academic oversight, fee approval, student management
4. **School Bursar** - Financial management, payment processing, fee collection
5. **Student** - Personal information access, payment history, fee payments

## Prerequisites

1. **Node.js** installed (v14 or higher)
2. **MongoDB** connection available
3. **Environment variables** configured in `api/.env`
4. **Dependencies** installed in the `api` directory

## Test Environment Setup

### Step 1: Install Dependencies

```bash
cd api
npm install
```

### Step 2: Configure Environment

Ensure `api/.env` contains:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
PORT=3000
```

### Step 3: Set Up Test Data

```bash
# Create test users and school data
node tests/setup-test-environment.js
```

This creates:
- System Administrator account
- Test school group and school
- All required user roles with test credentials

## Running the Tests

### Option 1: Complete Test Suite

Run all tests in sequence:

```bash
# Start the API server (in one terminal)
cd api
node server.js

# Run comprehensive tests (in another terminal)
node tests/run-all-tests.js
```

### Option 2: Individual Role Tests

Test specific roles:

```bash
# System Admin
node tests/test-admin.js

# ICT Administrator
node tests/test-ict-admin.js

# School Bursar
node tests/test-bursar.js

# School Principal
node tests/test-principal.js

# Student
node tests/test-student.js
```

## Test Credentials

The following test accounts are created:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| System Admin | admin@ledgrio.com | KGnd#%$ld | Full system access |
| School Admin | admin@smart-s.com | password123 | School-level admin |
| ICT Admin | ictadmin@smart-s.com | password123 | Technical management |
| Principal | principal@smart-s.com | password123 | Academic oversight |
| Bursar | bursar@smart-s.com | password123 | Financial management |
| Student | student@smart-s.com | password123 | Student portal |

## Test Coverage

### System Admin Tests
- ✅ Authentication and login
- ✅ User management (CRUD operations)
- ✅ School management
- ✅ System analytics access
- ✅ Global permissions verification

### ICT Admin Tests
- ✅ Authentication and dashboard access
- ✅ School-scoped user management
- ✅ Student management
- ✅ Bulk upload functionality
- ✅ Technical system configuration

### Bursar Tests
- ✅ Authentication and profile access
- ✅ Fee management and creation
- ✅ Payment processing
- ✅ Financial reporting
- ✅ Fee collection summaries

### Principal Tests
- ✅ Authentication and school overview
- ✅ Student and teacher oversight
- ✅ Academic session management
- ✅ Fee approval workflows
- ✅ Financial oversight

### Student Tests
- ✅ Authentication and profile access
- ✅ Personal fee information
- ✅ Payment history
- ✅ Outstanding fee calculations
- ✅ Payment portal access

## Expected Test Results

A successful test run should show:

```
🏫 LEDGRIO - Comprehensive School Accounting System Test
======================================================================

🔧 SYSTEM SETUP & INFRASTRUCTURE:
   System Setup:       ✅ PASSED
   System Admin:       ✅ PASSED

💼 SCHOOL ADMINISTRATION:
   ICT Admin:          ✅ PASSED
   Principal:          ✅ PASSED

💰 FINANCIAL MANAGEMENT:
   Bursar:             ✅ PASSED

🎓 STUDENT SERVICES:
   Student Portal:     ✅ PASSED

OVERALL RESULT: 6/6 components passed
🎉 ALL SYSTEMS FULLY OPERATIONAL!
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure API server is running on port 3000
2. **Authentication Failed**: Verify test users exist (run setup script)
3. **Database Errors**: Check MongoDB connection string
4. **Permission Denied**: Ensure user roles are correctly assigned

### Debug Steps

1. Check server logs for errors
2. Verify database connectivity
3. Confirm test user creation
4. Review API endpoint responses

## Production Readiness Checklist

After successful tests:

- [ ] All user roles can authenticate
- [ ] System admin can manage users and schools
- [ ] ICT admin can perform technical tasks
- [ ] Principal can oversee academic functions
- [ ] Bursar can manage finances
- [ ] Students can access their information
- [ ] Payment processing works correctly
- [ ] Security permissions are enforced

## Next Steps

1. **Performance Testing**: Load test with multiple concurrent users
2. **Security Audit**: Penetration testing and vulnerability assessment
3. **Integration Testing**: Test with external payment gateways
4. **User Acceptance Testing**: Real-world scenario testing
5. **Documentation**: Update user manuals and API documentation

## Support

For issues or questions:
- Review API logs in `api/server.js`
- Check database connectivity
- Verify environment configuration
- Contact development team

---

**Ledgrio School Accounting System**  
*Comprehensive Financial Management for Educational Institutions*

# Testing Documentation

This directory contains testing procedures, test data, and validation guidelines.

## Files

### 🔑 Test Data & Credentials
- **TEST_USER_CREDENTIALS.md** - Test user accounts, passwords, and access levels for different roles
- **README_TESTING.md** - Testing procedures, guidelines, and best practices

## Quick Links

- [Main Documentation](../README.md)
- [API Tests](../../api/tests/) - Backend testing scripts
- [Implementation Guides](../implementation/)
- [Features Documentation](../features/)

## Testing Overview

The testing documentation provides:
- Pre-configured test user accounts for all roles
- Testing procedures for different features
- Validation checklists
- Test data and scenarios

## Test User Roles

| Role | Purpose | Documentation |
|------|---------|---------------|
| General Admin | System administration testing | [Credentials](./TEST_USER_CREDENTIALS.md) |
| ICT Admin | School IT management testing | [Credentials](./TEST_USER_CREDENTIALS.md) |
| Principal | School leadership testing | [Credentials](./TEST_USER_CREDENTIALS.md) |
| Teacher | Classroom management testing | [Credentials](./TEST_USER_CREDENTIALS.md) |
| Student | Student portal testing | [Credentials](./TEST_USER_CREDENTIALS.md) |
| Parent | Parent portal testing | [Credentials](./TEST_USER_CREDENTIALS.md) |

## Testing Resources

- **Backend Tests**: [API Tests Directory](../../api/tests/) - 53+ automated test scripts
- **Test Runner**: Use `./run-tests.sh` in the API directory
- **Mock Data**: Pre-populated test database with sample schools, students, and users

## Testing Workflow

1. Review [TEST_USER_CREDENTIALS.md](./TEST_USER_CREDENTIALS.md) for login details
2. Follow [README_TESTING.md](./README_TESTING.md) for testing procedures
3. Use [Backend Tests](../../api/tests/) for API validation
4. Check [Implementation Guides](../implementation/) for role-specific testing

## Quick Test Commands

```bash
# Run all basic tests
cd api
./run-tests.sh all

# Test authentication
./run-tests.sh auth

# Test ICT Admin workflow
./run-tests.sh ict
```

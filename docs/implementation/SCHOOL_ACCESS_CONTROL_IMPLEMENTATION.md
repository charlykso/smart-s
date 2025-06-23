# School-Based Access Control System Implementation

## Overview

This document describes the comprehensive school-based access control system implemented for the Ledgrio school management platform. The system ensures that users can only access data from their assigned school, except for general administrators who can access all schools.

## 🎯 Objectives

1. **Data Isolation**: Ensure complete data separation between schools
2. **Role-Based Access**: Maintain proper access control based on user roles
3. **Security**: Prevent unauthorized cross-school data access
4. **Scalability**: Support multiple schools within a single platform instance

## 🔧 Implementation Components

### 1. Backend Middleware (`/api/middleware/auth.js`)

#### Enhanced Middleware Functions:

- **`filterByUserSchool`**: Automatically filters queries by user's school
- **`enforceSchoolBoundary`**: Strict enforcement of school boundaries
- **`checkSchoolAccess`**: Validates school access for specific endpoints
- **`validateSchoolAssignment`**: Ensures proper school assignment on user creation
- **`restrictGeneralAdminAccess`**: Limits certain endpoints to general admins only

#### Key Features:

```javascript
// Only general Admin (not assigned to a school) can access all schools
if (userRoles.includes('Admin') && !userSchool) {
  return next() // No filtering
}

// All other users must have school filtering
req.schoolFilter = { school: userSchool }
```

### 2. User Role Definitions

#### General Admin

- **School Assignment**: None (null)
- **Access Level**: All schools and users
- **Capabilities**: System-wide administration, user validation, cross-school operations

#### School-Assigned Roles

- **School Assignment**: Required
- **Access Level**: Only their assigned school
- **Roles**: ICT Administrator, Principal, Headteacher, Bursar, Student, Parent, Auditor

### 3. Database Schema Requirements

#### User Model Updates

```javascript
{
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    // Required for all users except general Admin
  },
  roles: {
    type: [String],
    enum: ['Admin', 'ICT_administrator', 'Auditor', 'Proprietor',
           'Principal', 'Headteacher', 'Bursar', 'Student', 'Parent'],
    required: true,
  }
}
```

### 4. API Endpoints Structure

#### School-Filtered Endpoints

- `/api/v1/school-access/users` - Get users filtered by school
- `/api/v1/school-access/validate-assignments` - Validate school assignments (General Admin only)

#### Updated Route Protection

```javascript
// Example: Student creation with school validation
router.route('/student/create').post(
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.Proprietor, roleList.ICT_administrator),
  validateSchoolAssignment, // NEW: Validates school assignment
  userController.createStudent
)
```

### 5. Frontend Implementation

#### School Access Utilities (`/frontend/src/utils/schoolAccess.ts`)

Key functions:

- `canAccessSchool()` - Check school access permissions
- `isGeneralAdmin()` - Identify general administrators
- `shouldShowSchoolFilter()` - Determine UI filtering needs
- `filterByUserSchool()` - Client-side data filtering

#### Service Layer Updates

- `SchoolAccessService` - Dedicated service for school operations
- Updated `UserService` to use school-filtered endpoints

## 🛡️ Security Measures

### 1. Server-Side Validation

- All API endpoints validate user school assignments
- Middleware automatically applies school filters
- Cross-school data access is blocked for non-admin users

### 2. Client-Side Protection

- UI components check permissions before rendering
- School filtering applied to all data displays
- Access denied pages for unauthorized users

### 3. Data Integrity Checks

- School assignment validation on user creation
- Invalid school reference detection
- Automated assignment validation tools

## 📊 Access Control Matrix

| Role                    | General Admin  | School Admin  | ICT Admin     | Principal     | Student     | Parent          |
| ----------------------- | -------------- | ------------- | ------------- | ------------- | ----------- | --------------- |
| **School Assignment**   | None           | Required      | Required      | Required      | Required    | Required        |
| **Cross-School Access** | ✅ Yes         | ❌ No         | ❌ No         | ❌ No         | ❌ No       | ❌ No           |
| **User Management**     | ✅ All Schools | ✅ Own School | ✅ Own School | ❌ Limited    | ❌ No       | ❌ No           |
| **Student Data**        | ✅ All Schools | ✅ Own School | ✅ Own School | ✅ Own School | ✅ Own Data | ✅ Own Children |
| **Financial Data**      | ✅ All Schools | ✅ Own School | ✅ Own School | ✅ Own School | ✅ Own Fees | ✅ Own Payments |

## 🔍 Testing & Validation

### Automated Testing Script

Run the comprehensive test suite:

```bash
./test-school-access-control.sh
```

### Test Coverage

1. **Authentication**: Verify all user types can log in
2. **Endpoint Access**: Test proper access restrictions
3. **Cross-School Prevention**: Ensure data isolation
4. **School Validation**: Test assignment validation tools
5. **Data Filtering**: Verify school-specific data returns

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Run user school assignment validation
- [ ] Verify all existing users have proper school assignments
- [ ] Test with sample data from multiple schools
- [ ] Validate API endpoint protection

### Post-Deployment

- [ ] Monitor access logs for unauthorized attempts
- [ ] Verify data isolation in production
- [ ] Test user creation workflows
- [ ] Validate school filtering accuracy

## 📝 API Usage Examples

### 1. Get School-Filtered Users

```javascript
// Request
GET /api/v1/school-access/users?role=Student&search=john

// Response (for school-assigned user)
{
  "success": true,
  "data": {
    "users": [...], // Only users from requester's school
    "total": 25,
    "userSchool": "school_id_123",
    "isGeneralAdmin": false
  }
}
```

### 2. Validate School Assignments (General Admin Only)

```javascript
// Request
GET /api/v1/school-access/validate-assignments

// Response
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "usersWithoutSchool": [...], // Users missing school assignment
    "usersWithInvalidSchool": [...], // Users with invalid school refs
    "validAssignments": 145,
    "fixedAssignments": 0
  }
}
```

### 3. Create User with School Validation

```javascript
// Request
POST /api/v1/user/student/create
{
  "school_id": "valid_school_id",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@school.com",
  "roles": ["Student"]
}

// Automatic validation ensures:
// - school_id is valid and exists
// - User has permission to create users for that school
// - School assignment is enforced
```

## 🔧 Maintenance & Monitoring

### Regular Tasks

1. **Weekly**: Run school assignment validation
2. **Monthly**: Review access logs for anomalies
3. **Quarterly**: Audit user-school relationships

### Monitoring Alerts

- Failed cross-school access attempts
- Users without school assignments
- Invalid school references
- Unusual data access patterns

## 📈 Future Enhancements

### Planned Features

1. **Multi-School User Support**: Users assigned to multiple schools
2. **Temporary Access Grants**: Time-limited cross-school access
3. **Audit Trail Enhancement**: Detailed school access logging
4. **Automated Assignment**: Smart school assignment based on user data

### Performance Optimizations

1. **Query Indexing**: Optimize school-based queries
2. **Caching Strategy**: Cache school assignments
3. **Batch Operations**: Bulk school assignment updates

## 🆘 Troubleshooting

### Common Issues

#### 1. User Can't Access Their School's Data

**Symptoms**: 403 Forbidden errors, empty data responses
**Causes**: Missing or invalid school assignment
**Solution**:

```bash
# Check user's school assignment
db.users.findOne({email: "user@school.com"}, {school: 1, roles: 1})

# Fix assignment if needed
db.users.updateOne(
  {email: "user@school.com"},
  {$set: {school: ObjectId("valid_school_id")}}
)
```

#### 2. General Admin Can't Access All Data

**Symptoms**: Restricted access for admin user
**Causes**: Admin user incorrectly assigned to a school
**Solution**:

```bash
# Remove school assignment for general admin
db.users.updateOne(
  {email: "admin@system.com", roles: "Admin"},
  {$unset: {school: ""}}
)
```

#### 3. Cross-School Data Leakage

**Symptoms**: Users seeing data from other schools
**Causes**: Missing middleware, improper filtering
**Solution**: Review route protection and middleware application

## 📚 References

- [API Documentation](./API_DOCUMENTATION.md)
- [Security Guidelines](./SECURITY.md)
- [User Management Guide](./USER_MANAGEMENT.md)
- [Testing Guide](./README_TESTING.md)

---

**Implementation Status**: ✅ Complete
**Last Updated**: June 18, 2025
**Version**: 1.0.0

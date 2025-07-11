# Smart-S School Accounting System - Test User Credentials

## 🔐 **Test User Login Details**

### **Universal Password: `password123`**

All test users use the same password for easy testing.

---

## ✅ **VERIFIED ACTIVE USERS (Database Confirmed)**

### **1. System Administrator**

- **Email**: `admin@smart-s.com`
- **Password**: `password123`
- **Name**: System Admin
- **RegNo**: ADM001
- **Role**: Admin/Proprietor
- **School**: N/A (System-wide access)
- **Status**: ✅ **ACTIVE & VERIFIED**
- **Dashboard**: System-wide overview, user management, financial analytics
- **Permissions**: Full system access, can manage all schools

### **2. School Bursar**

- **Email**: `bursar@smart-s.com`
- **Password**: `password123`
- **Name**: Test Bursar
- **RegNo**: BUR001
- **Role**: Bursar
- **School**: Smart School Academy (ID: 6856ca374de0e2d916dc329c)
- **Status**: ✅ **ACTIVE & VERIFIED**
- **Dashboard**: Financial management, fee tracking, payment reports
- **Permissions**: Can create/update/delete fees for own school only, CANNOT approve fees

### **3. School Principal**

- **Email**: `principal@smart-s.com`
- **Password**: `password123`
- **Name**: Test Principal
- **RegNo**: PRI001
- **Role**: Principal
- **School**: Smart School Academy (ID: 6856ca374de0e2d916dc329c)
- **Status**: ✅ **ACTIVE & VERIFIED**
- **Dashboard**: School management, academic oversight, staff management
- **Permissions**: Can approve/reject fees for own school only, CANNOT create fees

---

## ⚠️ **LEGACY USERS (Status Unknown - May Not Exist)**

### **Student Account**

- **Email**: `student@ledgrio.com`
- **Password**: `password123`
- **Name**: John Student
- **RegNo**: STU001
- **Role**: Student
- **Status**: ❓ **UNKNOWN**
- **Dashboard**: Personal academic progress, fee payments, assignments

### **Legacy Principal**

- **Email**: `principal@ledgrio.com`
- **Password**: `password123`
- **Name**: Dr. Sarah Principal
- **RegNo**: PRI001
- **Role**: Principal
- **Status**: ❓ **UNKNOWN**
- **Dashboard**: School management, academic oversight, staff management

### **Legacy Bursar**

- **Email**: `bursar@ledgrio.com`
- **Password**: `password123`
- **Name**: Michael Bursar
- **RegNo**: BUR001
- **Role**: Bursar
- **Status**: ❓ **UNKNOWN**
- **Dashboard**: Financial management, fee tracking, payment reports

### **Parent Account**

- **Email**: `parent@ledgrio.com`
- **Password**: `password123`
- **Name**: Mary Parent
- **RegNo**: PAR001
- **Role**: Parent
- **Status**: ❓ **UNKNOWN**
- **Dashboard**: Children's progress, payment history, school communication

### **System Auditor**

- **Email**: `auditor@ledgrio.com`
- **Password**: `password123`
- **Name**: James Auditor
- **RegNo**: AUD001
- **Role**: Auditor
- **Status**: ❓ **UNKNOWN**
- **Dashboard**: Financial auditing, system reports, compliance tracking

### **ICT Administrator**

- **Email**: `ictadmin@ledgrio.com`
- **Password**: `password123`
- **Name**: David ICTAdmin
- **RegNo**: ICT001
- **Role**: ICT_administrator
- **Status**: ❓ **UNKNOWN**
- **Dashboard**: System administration, technical management

### **School Proprietor**

- **Email**: `proprietor@ledgrio.com`
- **Password**: `password123`
- **Name**: Robert Proprietor
- **RegNo**: PRO001
- **Role**: Proprietor
- **Status**: ❓ **UNKNOWN**
- **Dashboard**: Multi-school oversight, business management

### **Headteacher**

- **Email**: `headteacher@smart-s.com`
- **Password**: `password123`
- **Name**: Mrs. Jane Headteacher
- **RegNo**: HEAD001
- **Role**: Headteacher
- **Status**: ❓ **UNKNOWN**
- **Dashboard**: School operations, academic management

---

## 🔒 **Access Control Implementation Status**

### ✅ **Enforced Security Features**

- **School Boundary Enforcement**: Bursars can only access their assigned school's data
- **Fee Creation Control**: Bursars can create fees but cannot approve them
- **Principal Approval**: Principals can approve/reject fees only for their school
- **Cross-School Prevention**: Unauthorized access to other schools is blocked
- **Authentication Required**: All operations require valid JWT tokens
- **Role-Based Access**: Different permissions for different user roles

### 📋 **Access Control Matrix**

| Role          | Create Fee     | Update Fee     | Delete Fee     | Approve Fee    | View Fees      | Cross-School Access |
| ------------- | -------------- | -------------- | -------------- | -------------- | -------------- | ------------------- |
| **Bursar**    | ✅ Own School  | ✅ Own School  | ✅ Own School  | ❌             | ✅ Own School  | ❌ **BLOCKED**      |
| **Principal** | ❌             | ❌             | ❌             | ✅ Own School  | ✅ Own School  | ❌ **BLOCKED**      |
| **Admin**     | ✅ All Schools | ✅ All Schools | ✅ All Schools | ✅ All Schools | ✅ All Schools | ✅ **ALLOWED**      |

---

## 🌐 **Application URLs**

### **Frontend Application**

- **URL**: `http://localhost:3001`
- **Login Page**: `http://localhost:3001/login`

### **Backend API**

- **Base URL**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api/v1`

---

## 🧪 **Testing Instructions**

### **Step 1: Start the Application**

```bash
# Start Backend (Terminal 1)
cd api
node server.js

# Start Frontend (Terminal 2)
cd frontend
npm run dev
```

### **Step 2: Test User Login**

1. Navigate to: `http://localhost:3001/login`
2. Enter any email from the list above
3. Enter password: `password123`
4. Click "Sign In"
5. Verify role-specific dashboard loads

### **Step 3: Test API Endpoints**

```bash
# Login via API
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smart-s.com","password":"password123"}'

# Use token from response to access dashboard
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/admin/dashboard
```

---

## 📊 **Available API Endpoints by Role**

### **Admin Endpoints** (`/api/v1/admin/`)

- `GET /dashboard` - System overview
- `GET /system-overview` - Active sessions and terms
- `GET /user-management` - User management with pagination
- `GET /financial-overview` - Financial analytics

### **Principal Endpoints** (`/api/v1/principal/`)

- `GET /dashboard` - School overview
- `GET /academic-overview` - Academic statistics
- `GET /staff-management` - Staff management

### **Bursar Endpoints** (`/api/v1/bursar/`)

- `GET /dashboard` - Financial overview
- `GET /payment-reports` - Payment analytics
- `GET /outstanding-fees-report` - Outstanding fees

### **Parent Endpoints** (`/api/v1/parent/`)

- `GET /dashboard` - Children overview
- `GET /child/:childId` - Child details
- `GET /payment-history` - Payment history

### **Student Endpoints** (`/api/v1/student/`)

- `GET /dashboard` - Student overview
- `GET /payments` - Payment history
- `GET /outstanding-fees` - Outstanding fees
- `GET /academic-summary` - Academic performance

---

## 🔧 **Quick Test Commands**

### **Test All User Logins**

```bash
# ✅ VERIFIED ACTIVE USERS (Use these for testing)

# Admin Login (VERIFIED WORKING)
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@smart-s.com","password":"password123"}'

# Bursar Login (VERIFIED WORKING)
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"bursar@smart-s.com","password":"password123"}'

# Principal Login (VERIFIED WORKING)
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"principal@smart-s.com","password":"password123"}'

# ❓ LEGACY USERS (May not work - use at your own risk)

# Student Login (UNKNOWN STATUS)
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"student@ledgrio.com","password":"password123"}'

# Legacy Principal Login (UNKNOWN STATUS)
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"principal@ledgrio.com","password":"password123"}'

# Legacy Bursar Login (UNKNOWN STATUS)
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"bursar@ledgrio.com","password":"password123"}'

# Parent Login (UNKNOWN STATUS)
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"parent@ledgrio.com","password":"password123"}'
```

---

## 🎯 **Expected Dashboard Features**

### **Admin Dashboard**

- Total users, students, teachers, schools
- System-wide revenue and payment statistics
- Recent user registrations and activities
- Monthly revenue trends and analytics

### **Principal Dashboard**

- School-specific student and staff counts
- Academic session and term information
- Recent school activities and registrations
- School financial overview

### **Bursar Dashboard**

- Detailed financial statistics (daily, monthly, total revenue)
- Payment method breakdowns
- Fee collection status by fee type
- Outstanding fees tracking

### **Parent Dashboard**

- Children's academic progress and attendance
- Payment history and outstanding fees
- Recent activities for all children
- Overall family financial summary

### **Student Dashboard**

- Personal academic progress and attendance
- Outstanding fees and payment history
- Assignment completion status
- Recent academic activities

---

## 🚨 **Troubleshooting**

### **If Login Fails:**

1. Verify backend is running on port 3000
2. Check MongoDB connection
3. Ensure user exists in database
4. Verify password is exactly `password123`

### **If Dashboard is Empty:**

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check JWT token in localStorage
4. Ensure role-based access is working

### **If API Calls Fail:**

1. Check CORS settings
2. Verify authentication headers
3. Check backend logs for errors
4. Ensure proper role permissions

---

## 📝 **Notes**

- All users are created with basic information
- Some users may not have school assignments (will show mock data)
- Financial data is calculated from existing payments and fees
- Academic data includes both real and mock information for demonstration
- All passwords are hashed using bcrypt with salt rounds of 10

---

## 🔄 **Recreate Test Users**

If you need to recreate all test users:

```bash
# Recommended: Use the verified seed script
cd api
node tests/seed-database.js

# Alternative: Use the user creation script
cd api
node tests/create-bursar-and-principal.js

# Legacy script (may not work with current database)
cd api
node createAllTestUsers.js
```

**Recommended Method**: Use `seed-database.js` as it creates users with all required fields and proper school relationships.

---

**Last Updated**: January 16, 2025  
**System Version**: Smart-S v1.0  
**Environment**: Development/Testing
**Database Status**: Active with verified users
**Access Control**: Implemented and enforced

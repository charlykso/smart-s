# Ledgrio School Accounting System - Test User Credentials

## 🔐 **Test User Login Details**

### **Universal Password: `password123`**

All test users use the same password for easy testing.

---

## 👥 **User Accounts by Role**

### **1. System Administrator**

- **Email**: `admin@ledgrio.com`
- **Password**: `password123`
- **Name**: Admin User
- **RegNo**: ADM001
- **Role**: Admin
- **Dashboard**: System-wide overview, user management, financial analytics

### **2. Student Account**

- **Email**: `student@ledgrio.com`
- **Password**: `password123`
- **Name**: John Student
- **RegNo**: STU001
- **Role**: Student
- **Dashboard**: Personal academic progress, fee payments, assignments

### **3. School Principal**

- **Email**: `principal@ledgrio.com`
- **Password**: `password123`
- **Name**: Dr. Sarah Principal
- **RegNo**: PRI001
- **Role**: Principal
- **Dashboard**: School management, academic oversight, staff management

### **4. School Bursar**

- **Email**: `bursar@ledgrio.com`
- **Password**: `password123`
- **Name**: Michael Bursar
- **RegNo**: BUR001
- **Role**: Bursar
- **Dashboard**: Financial management, fee tracking, payment reports

### **5. Parent Account**

- **Email**: `parent@ledgrio.com`
- **Password**: `password123`
- **Name**: Mary Parent
- **RegNo**: PAR001
- **Role**: Parent
- **Dashboard**: Children's progress, payment history, school communication

### **6. System Auditor**

- **Email**: `auditor@ledgrio.com`
- **Password**: `password123`
- **Name**: James Auditor
- **RegNo**: AUD001
- **Role**: Auditor
- **Dashboard**: Financial auditing, system reports, compliance tracking

### **7. ICT Administrator**

- **Email**: `ictadmin@ledgrio.com`
- **Password**: `password123`
- **Name**: David ICTAdmin
- **RegNo**: ICT001
- **Role**: ICT_administrator
- **Dashboard**: System administration, technical management

### **8. School Proprietor**

- **Email**: `proprietor@ledgrio.com`
- **Password**: `password123`
- **Name**: Robert Proprietor
- **RegNo**: PRO001
- **Role**: Proprietor
- **Dashboard**: Multi-school oversight, business management

### **9. Headteacher**

- **Email**: `headteacher@smart-s.com`
- **Password**: `password123`
- **Name**: Mrs. Jane Headteacher
- **RegNo**: HEAD001
- **Role**: Headteacher
- **Dashboard**: School operations, academic management

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
# Admin Login
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@smart-s.com","password":"password123"}'

# Student Login
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"student@smart-s.com","password":"password123"}'

# Principal Login
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"principal@smart-s.com","password":"password123"}'

# Bursar Login
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"bursar@smart-s.com","password":"password123"}'

# Parent Login
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"parent@smart-s.com","password":"password123"}'
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
cd api
node createAllTestUsers.js
```

This will create all users if they don't exist, or show existing users if they're already created.

---

**Last Updated**: January 2025  
**System Version**: Smart-S v1.0  
**Environment**: Development/Testing

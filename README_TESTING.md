# Smart-S School Management System - Testing Guide

## 🚀 Quick Start

### Start the Application
```bash
# Terminal 1 - Backend
cd api
node server.js

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3001
- **Login Page**: http://localhost:3001/login
- **Backend API**: http://localhost:3000

## 🔐 Test User Credentials

**Universal Password**: `password123`

| Role | Email | Dashboard Features |
|------|-------|-------------------|
| **Admin** | admin@smart-s.com | System overview, user management, analytics |
| **Student** | student@smart-s.com | Academic progress, fees, assignments |
| **Principal** | principal@smart-s.com | School management, staff oversight |
| **Bursar** | bursar@smart-s.com | Financial management, payment tracking |
| **Parent** | parent@smart-s.com | Children progress, payment history |
| **Auditor** | auditor@smart-s.com | Financial auditing, compliance reports |
| **ICT Admin** | ictadmin@smart-s.com | System administration, technical support |
| **Proprietor** | proprietor@smart-s.com | Multi-school oversight, business management |
| **Headteacher** | headteacher@smart-s.com | School operations, academic management |

## 🧪 Testing Steps

### 1. Test User Login
1. Go to http://localhost:3001/login
2. Enter any email from the table above
3. Enter password: `password123`
4. Click "Sign In"
5. Verify role-specific dashboard loads

### 2. Test API Endpoints
```bash
# Login via API
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smart-s.com","password":"password123"}'

# Use token from response
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/admin/dashboard
```

### 3. Test Different Roles
- Login with different user types
- Verify each sees appropriate dashboard
- Test role-specific features
- Check data access permissions

## 📊 Available Features by Role

### Admin Dashboard
- ✅ System-wide user statistics
- ✅ Financial overview across all schools  
- ✅ User management interface
- ✅ Monthly revenue analytics

### Student Dashboard  
- ✅ Personal academic progress
- ✅ Fee payment status and history
- ✅ Assignment tracking
- ✅ Outstanding fees alerts

### Principal Dashboard
- ✅ School-specific statistics
- ✅ Student and staff management
- ✅ Academic performance overview
- ✅ School financial summary

### Bursar Dashboard
- ✅ Detailed financial analytics
- ✅ Payment processing overview
- ✅ Outstanding fees tracking  
- ✅ Revenue reporting by period

### Parent Dashboard
- ✅ Children's academic progress
- ✅ Payment history for all children
- ✅ Outstanding fees summary
- ✅ School communication updates

## 🔧 Backend API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh

### Role-Specific Dashboards
- `GET /api/v1/admin/dashboard` - Admin overview
- `GET /api/v1/student/dashboard` - Student overview  
- `GET /api/v1/principal/dashboard` - Principal overview
- `GET /api/v1/bursar/dashboard` - Bursar overview
- `GET /api/v1/parent/dashboard` - Parent overview

### Additional Endpoints
- `GET /api/v1/admin/user-management` - User management
- `GET /api/v1/student/payments` - Student payment history
- `GET /api/v1/bursar/payment-reports` - Payment analytics
- `GET /api/v1/parent/child/:id` - Child details

## 🛠️ Troubleshooting

### Login Issues
- Verify backend is running on port 3000
- Check MongoDB connection
- Ensure exact email and password
- Check browser console for errors

### Dashboard Issues  
- Verify JWT token in localStorage
- Check API endpoint accessibility
- Review role permissions
- Check backend logs for errors

### Data Issues
- Some users may show mock data initially
- Financial data depends on existing payments
- Academic data includes demonstration values
- School assignments may be missing for some users

## 📁 Reference Files

- `TEST_USER_CREDENTIALS.md` - Detailed user information
- `QUICK_LOGIN_REFERENCE.txt` - Quick reference table
- `test-users.json` - Programmatic access to user data

## 🔄 Reset/Recreate Users

If you need to recreate test users:
```bash
cd api
node createAllTestUsers.js
```

## 📝 Development Notes

- All passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 10 hours  
- Role-based access control enforced on all endpoints
- CORS enabled for frontend-backend communication
- MongoDB required for data persistence

## 🎯 Expected Test Results

### Successful Login
- Redirects to appropriate dashboard
- Shows role-specific navigation
- Displays relevant data and statistics
- No console errors

### API Functionality
- Authentication returns valid JWT token
- Dashboard endpoints return appropriate data
- Role restrictions properly enforced
- Error handling works gracefully

### Frontend Integration
- Smooth navigation between pages
- Loading states display correctly
- Error messages show appropriately  
- Data updates reflect backend changes

---

**Happy Testing!** 🎉

For issues or questions, check the browser console and backend logs for detailed error information.

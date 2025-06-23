# ICT Administrator School Management System

## Overview

This document outlines the implementation of the ICT Administrator functionality for the Ledgrio School Accounting System. The ICT Admin role has specific permissions and capabilities for managing schools and users within their assigned Group School.

## 🎯 Key Requirements & Implementation

### 1. ICT Admin Restrictions ✅

- **CANNOT create GroupSchool**: ICT Admins are restricted from creating new group schools
- **CANNOT modify ICT_administrator or Admin users**: Security restriction to prevent privilege escalation
- **Scope limited to Group School**: Can only manage resources within their assigned group school

### 2. School Management Capabilities ✅

- **Create schools under same GroupSchool**: ICT Admin can create new schools within their group
- **Manage multiple schools**: Dashboard view of all schools under their group school
- **School CRUD operations**: Create, read, update, and delete schools (with restrictions)
- **Automatic GroupSchool association**: New schools are automatically linked to ICT Admin's group school

### 3. User Management Capabilities ✅

- **Create users in managed schools**: Can create users across all schools in their group
- **Role restrictions**: Can create Principal, Bursar, Teacher, Student, Parent roles only
- **Multi-school user management**: Manage users across multiple schools simultaneously
- **User status control**: Activate/deactivate users, reset passwords

## 🎨 Frontend Architecture

### Component Structure

```
ICTAdminSchoolManagement.tsx
├── Main Dashboard Component
├── Schools Management Tab
│   ├── School Cards Grid
│   ├── Create School Modal
│   └── School Actions (Edit, Delete, Add Users)
├── Users Management Tab
│   ├── Users Table
│   ├── Create User Modal
│   └── User Actions (Activate/Deactivate, Edit)
└── Navigation & Header
```

### Key Features

#### Schools Management Tab

- **Grid Layout**: Responsive card-based layout for school display
- **School Information**: Name, email, phone, status, user count, group school
- **Quick Actions**:
  - Add Users (green plus icon)
  - Edit School (pencil icon)
  - Delete School (trash icon)
- **Create School Button**: Prominent blue button to add new schools
- **Empty State**: Helpful guidance when no schools exist

#### Users Management Tab

- **Data Table**: Comprehensive table with user information
- **School Filter**: Dropdown to select specific school for user creation
- **User Information Display**:
  - User avatar with initials
  - Full name and registration number
  - Contact information (email, phone)
  - Role badge and user type
  - School association
  - Active/inactive status
- **User Actions**:
  - Activate/Deactivate toggle
  - Edit user (pencil icon)

### Modal Components

#### Create School Modal

```typescript
interface CreateSchoolData {
  name: string
  email: string
  phoneNumber: string
  address?: string
  isActive: boolean
}
```

- Form validation for required fields
- Group school context display
- Auto-focus on first field
- Success/error handling

#### Create User Modal

```typescript
interface CreateUserData {
  firstname: string
  lastname: string
  email: string
  phone: string
  roles: string[]
  type: 'day' | 'boarding'
  gender: 'Male' | 'Female'
  regNo: string
  school: string
}
```

- Two-column layout for efficient space usage
- Role restrictions enforced
- School selection with current selection context
- Real-time form validation

## 🔧 Backend API Implementation

### School Management Routes (`/api/schools/`)

#### GET `/by-group`

- **Purpose**: Fetch all schools under ICT Admin's group school
- **Authentication**: Required (ICT_administrator role)
- **Response**: Array of schools with user counts
- **Security**: Validates ICT Admin's group school association

```javascript
// Example Response
{
  "schools": [
    {
      "_id": "school_id",
      "name": "Smart School Academy",
      "email": "info@smartschool.edu",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "groupSchool": {
        "_id": "group_id",
        "name": "Smart Education Group"
      },
      "userCount": 45
    }
  ]
}
```

#### POST `/`

- **Purpose**: Create new school under same group school
- **Validation**: Email and phone uniqueness, required fields
- **Auto-assignment**: GroupSchool automatically set from ICT Admin's context
- **Security**: Prevents group school modification

#### PATCH `/:schoolId`

- **Purpose**: Update school information
- **Restrictions**: Cannot change group school association
- **Validation**: Email/phone conflict checking
- **Security**: Verifies school belongs to ICT Admin's group

#### DELETE `/:schoolId`

- **Purpose**: Delete school (only if no users)
- **Safety**: Prevents deletion of schools with existing users
- **Security**: Group school boundary enforcement

### User Management Routes (`/api/users/`)

#### GET `/managed-schools`

- **Purpose**: Fetch users from all schools under ICT Admin's group
- **Filtering**: Excludes ICT_administrator and Admin users
- **Population**: Includes school information
- **Sorting**: Most recent users first

#### GET `/me`

- **Purpose**: Get current ICT Admin details with group school info
- **Population**: Full school and group school hierarchy
- **Usage**: Context display in frontend

#### POST `/`

- **Purpose**: Create new user in managed schools
- **Role Restrictions**: Limited to: Principal, Bursar, Teacher, Student, Parent
- **Validation**:
  - Email uniqueness across system
  - Registration number uniqueness per school
  - School belongs to ICT Admin's group
- **Security**:
  - Default password assignment
  - Group school boundary enforcement

#### PATCH `/:userId/status`

- **Purpose**: Toggle user active/inactive status
- **Restrictions**: Cannot modify ICT_administrator or Admin users
- **Security**: Group school validation

#### PATCH `/:userId`

- **Purpose**: Update user information
- **Restrictions**: Cannot change sensitive fields (password, \_id)
- **Validation**: Email and registration number conflicts
- **Security**: Role and group school restrictions

#### POST `/:userId/reset-password`

- **Purpose**: Reset user password to default
- **Default Password**: "password123"
- **Restrictions**: Cannot reset ICT_administrator or Admin passwords
- **Security**: Group school boundary enforcement

## 🔐 Security Implementation

### Authentication & Authorization

#### Middleware Stack

```javascript
const auth = require('../middleware/auth')

// Route protection
router.get(
  '/by-group',
  auth.authenticate, // JWT token validation
  auth.authorize(['ICT_administrator']), // Role-based access
  controller
)
```

#### Group School Boundary Enforcement

```javascript
// Validate ICT Admin's group school association
const ictAdmin = await User.findById(req.user.id).populate('school')
if (!ictAdmin.school || !ictAdmin.school.groupSchool) {
  return res.status(400).json({
    message: 'ICT Admin not associated with a group school',
  })
}

// Verify target resource belongs to same group school
const targetSchool = await School.findOne({
  _id: schoolId,
  groupSchool: ictAdmin.school.groupSchool,
})
```

### Role-Based Restrictions

#### User Creation Limitations

```javascript
const allowedRoles = ['Principal', 'Bursar', 'Teacher', 'Student', 'Parent']
const restrictedRoles = ['ICT_administrator', 'Admin']

// Prevent privilege escalation
if (!allowedRoles.includes(requestedRole)) {
  return res.status(403).json({
    message: 'Not authorized to assign this role',
  })
}
```

#### User Modification Restrictions

```javascript
// Prevent modifying higher-privilege users
if (user.roles.includes('ICT_administrator') || user.roles.includes('Admin')) {
  return res.status(403).json({
    message: 'Not authorized to modify this user type',
  })
}
```

## 📱 User Experience Design

### Dashboard Header

- **Context Display**: Shows current group school name prominently
- **Statistics**: Live counts of managed schools and total users
- **Role Clarity**: Clear indication of ICT Administrator permissions

### Navigation

- **Tab-based Interface**: Clean separation between Schools and Users management
- **Active State Indicators**: Visual feedback for current tab
- **Consistent Icons**: Heroicons for professional appearance

### Responsive Design

- **Mobile-first Approach**: Tables scroll horizontally on mobile
- **Grid Layouts**: Responsive school cards (1-3 columns based on screen size)
- **Modal Optimization**: Scrollable modals for smaller screens

### User Feedback

- **Toast Notifications**: Success/error messages for all actions
- **Loading States**: Spinners during API calls
- **Empty States**: Helpful guidance when no data exists
- **Confirmation Dialogs**: Prevents accidental deletions

## 🗄️ Database Schema Integration

### Entity Relationships

```
GroupSchool (1) ──→ (Many) School ──→ (Many) User
                              ↑
                              │
                         ICT Admin User
```

### Key Collections

#### GroupSchool

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  logo: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### School

```javascript
{
  _id: ObjectId,
  groupSchool: ObjectId, // Reference to GroupSchool
  name: String,
  email: String,
  phoneNumber: String,
  address: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### User

```javascript
{
  _id: ObjectId,
  school: ObjectId, // Reference to School
  firstname: String,
  lastname: String,
  email: String,
  phone: String,
  roles: [String], // Array of roles
  type: String, // 'day' or 'boarding'
  gender: String, // 'Male' or 'Female'
  regNo: String,
  password: String, // Hashed
  isActive: Boolean,
  status: String, // 'active' or 'inactive'
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Development Setup

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- VS Code with TypeScript support

### Environment Configuration

#### Backend (.env)

```env
MONGO_URI=mongodb+srv://node_user:ScTwyXjyH8FQqvtg@cluster0.bgsnb.mongodb.net/ledgrio_DB
JWT_SECRET="ayz12defghibcoxjklm4567pqrstn3uvw890"
JWT_REFRESH_SECRET="bcoxjkayz12defghilv0"
NODE_ENV=development
CLOUD_NAME="dtx7br2gz"
CLOUD_API_KEY="573938113434329"
CLOUD_API_SECRET="RL6vTcu25rQw5LuE3cfneRfpzRM"
```

#### Frontend (.env)

```env
JWT_SECRET="ayz12defghibcoxjklm4567pqrstn3uvw890"
JWT_REFRESH_SECRET="bcoxjkayz12defghilv0"
NODE_ENV=development
CLOUD_NAME="dgrzgjzzu"
CLOUD_API_KEY="768761993318129"
CLOUD_API_SECRET="4EY4CTVTmguOw"
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Running the Application

#### Backend Server

```bash
cd api
npm install
npm run dev
# Server runs on http://localhost:3000
```

#### Frontend Server

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3002
```

### Test User Credentials

#### ICT Administrator

- **Email**: `ictadmin@smartschool.edu`
- **Password**: `password123`
- **Role**: `ICT_administrator`
- **School**: Smart School Academy
- **Group School**: Smart Education Group

#### Other Test Users

- **Principal**: `principal@smartschool.edu`
- **Bursar**: `bursar@smartschool.edu`
- **Student**: `alice.student@smartschool.edu`

## 📋 Testing Checklist

### Functional Testing

#### School Management

- [ ] ICT Admin can view schools in their group
- [ ] ICT Admin can create new schools
- [ ] ICT Admin cannot create schools in other groups
- [ ] School creation validates email uniqueness
- [ ] School creation validates phone uniqueness
- [ ] ICT Admin can edit schools they manage
- [ ] ICT Admin can delete schools without users
- [ ] ICT Admin cannot delete schools with users

#### User Management

- [ ] ICT Admin can view users across managed schools
- [ ] ICT Admin can create users with allowed roles
- [ ] ICT Admin cannot create ICT_administrator users
- [ ] ICT Admin cannot create Admin users
- [ ] User creation validates email uniqueness
- [ ] User creation validates regNo uniqueness per school
- [ ] ICT Admin can activate/deactivate users
- [ ] ICT Admin cannot modify ICT_administrator users
- [ ] ICT Admin cannot modify Admin users

#### Security Testing

- [ ] Unauthenticated requests are rejected
- [ ] Wrong role access is forbidden
- [ ] Group school boundaries are enforced
- [ ] JWT token validation works correctly
- [ ] Password reset functionality works
- [ ] Role escalation is prevented

#### UI/UX Testing

- [ ] Responsive design works on mobile
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Success notifications appear
- [ ] Empty states are helpful
- [ ] Forms validate input correctly

## 🔄 Future Enhancements

### Phase 1: Enhanced Features

- [ ] Bulk user import functionality
- [ ] Advanced user filtering and search
- [ ] School performance analytics
- [ ] User activity logging and audit trail

### Phase 2: Integration Features

- [ ] Email notifications for new user creation
- [ ] Integration with payment systems
- [ ] Advanced reporting and analytics
- [ ] Multi-language support

### Phase 3: Advanced Administration

- [ ] Custom role creation
- [ ] Advanced permission management
- [ ] School template system
- [ ] Automated user provisioning

## 📚 API Documentation

### Base URL

```
Production: https://api.ledgrio.com
Development: http://localhost:3000
```

### Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

### Error Responses

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message" // Development only
}
```

### Success Responses

```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": { /* Response data */ }
}
```

## 🤝 Contributing

### Code Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write descriptive commit messages
- Include JSDoc comments for functions
- Test all new features

### Pull Request Process

1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation
4. Submit pull request with description
5. Address code review feedback
6. Merge after approval

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Last Updated**: June 21, 2025  
**Version**: 1.0.0  
**Author**: Ledgrio Development Team

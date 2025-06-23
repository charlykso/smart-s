# General Admin Implementation - School Management System

## 🏗️ **System Architecture Overview**

The school management system follows a hierarchical structure:

```
General Admin (System Administrator)
    ↓
Group School (e.g., "Smart Education Group")
    ↓
School (e.g., "Smart School Academy", "Tech High School")
    ↓
ICT Administrator (assigned to specific school)
    ↓
Users (Principal, Teachers, Students, etc. - managed by ICT Admin)
```

## 👑 **General Admin Role & Responsibilities**

The **General Admin** is the highest-level administrator who can:

1. ✅ **Create Group Schools** - Educational institution groups
2. ✅ **Create Schools** - Individual schools under group schools
3. ✅ **Create ICT Administrators** - Assign ICT admins to specific schools
4. ✅ **Manage all Group Schools** - View, edit, delete group schools
5. ✅ **System-wide overview** - Access to all users, schools, and financial data

### **General Admin Credentials**

- **Email**: `admin@ledgrio.com`
- **Password**: `password123`
- **Role**: `Admin`

## 🏫 **ICT Administrator Role & Responsibilities**

The **ICT Administrator** is assigned to a specific school and can:

1. ✅ **Create new schools** - Under the same group school
2. ✅ **Manage users** - Create/manage Principal, Teachers, Students, Parents
3. ✅ **Bulk student upload** - Upload multiple students at once
4. ✅ **School management** - Manage schools within their group school boundary
5. ❌ **Cannot create Group Schools** - This is reserved for General Admin
6. ❌ **Cannot create other ICT Administrators** - This is reserved for General Admin

### **Sample ICT Administrator Credentials**

- **Email**: `ictadmin@smartschool.edu`
- **Password**: `password123`
- **Role**: `ICT_administrator`
- **School**: Smart School Academy
- **Group School**: Smart Education Group

## 🔄 **Complete Workflow**

### **Phase 1: General Admin Setup**

1. **General Admin logs in** using `admin@ledgrio.com`
2. **Creates a Group School** (e.g., "Excellence Education Group")

   ```
   POST /api/v1/groupSchool/create
   {
     "name": "Excellence Education Group",
     "description": "Leading educational institution group"
   }
   ```

3. **Creates a School under the Group School**

   ```
   POST /api/v1/admin/schools
   {
     "name": "Excellence High School",
     "email": "info@excellencehigh.edu",
     "phoneNumber": "+1234567890",
     "groupSchoolId": "GROUP_SCHOOL_ID",
     "address": "123 Education Street"
   }
   ```

4. **Creates an ICT Administrator for the School**
   ```
   POST /api/v1/admin/ict-administrators
   {
     "firstname": "John",
     "lastname": "TechAdmin",
     "email": "ictadmin@excellencehigh.edu",
     "phone": "+1234567891",
     "schoolId": "SCHOOL_ID",
     "regNo": "ICT002",
     "gender": "Male"
   }
   ```

### **Phase 2: ICT Administrator Operations**

1. **ICT Administrator logs in** using credentials provided by General Admin
2. **Views schools in their group**

   ```
   GET /api/v1/schools/by-group
   ```

3. **Creates additional schools** under the same group school

   ```
   POST /api/v1/schools
   {
     "name": "Excellence Elementary",
     "email": "elementary@excellencehigh.edu",
     "phoneNumber": "+1234567892"
   }
   ```

4. **Creates users** (Principal, Teachers, Students)

   ```
   POST /api/v1/users
   {
     "firstname": "Jane",
     "lastname": "Principal",
     "email": "principal@excellencehigh.edu",
     "roles": ["Principal"],
     "school": "SCHOOL_ID"
   }
   ```

5. **Manages existing users** across all schools in their group

## 🛠️ **API Endpoints**

### **General Admin Endpoints**

- `POST /api/v1/groupSchool/create` - Create group school
- `GET /api/v1/groupSchool/all` - Get all group schools
- `POST /api/v1/admin/schools` - Create school under group school
- `POST /api/v1/admin/ict-administrators` - Create ICT administrator
- `GET /api/v1/admin/schools` - Get all schools
- `GET /api/v1/admin/ict-administrators` - Get all ICT administrators

### **ICT Administrator Endpoints**

- `GET /api/v1/schools/by-group` - Get schools in same group
- `POST /api/v1/schools` - Create school in same group
- `GET /api/v1/users/managed-schools` - Get users in managed schools
- `POST /api/v1/users` - Create user in managed schools
- `PATCH /api/v1/users/:id/status` - Toggle user status

## 🔐 **Authentication & Authorization**

### **General Admin (`Admin` role)**

- ✅ Full system access
- ✅ Can create Group Schools
- ✅ Can create Schools and ICT Administrators
- ✅ System-wide reports and analytics

### **ICT Administrator (`ICT_administrator` role)**

- ✅ Limited to schools within their group school
- ✅ Can create schools under same group school
- ✅ Can manage users in their schools
- ❌ Cannot access other group schools
- ❌ Cannot create ICT administrators

## 🎯 **Key Features**

1. **Hierarchical Access Control** - Users can only access resources within their scope
2. **Group School Boundaries** - ICT Admins are restricted to their group school
3. **Role-Based Permissions** - Different capabilities based on user role
4. **Audit Trail** - All operations are logged and tracked
5. **Scalable Architecture** - Support for multiple group schools and institutions

## 🚀 **Getting Started**

1. **Login as General Admin**: `admin@ledgrio.com / password123`
2. **Create your first Group School**
3. **Create a School under the Group School**
4. **Create an ICT Administrator for the School**
5. **Login as ICT Administrator and start managing users**

## 📊 **Current System State**

The system currently has:

- ✅ **1 General Admin**: `admin@ledgrio.com`
- ✅ **1 Group School**: "Smart Education Group"
- ✅ **1 School**: "Smart School Academy"
- ✅ **1 ICT Administrator**: `ictadmin@smartschool.edu`
- ✅ **5 Users**: Principal, Bursar, ICT Admin, 2 Students

The ICT Administrator can now properly access and manage schools and users within their group school boundary.

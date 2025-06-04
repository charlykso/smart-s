# Ledgrio: School Accounting System

## Overview

Ledgrio is a comprehensive accounting system specifically designed for educational institutions including nursery, primary, and secondary schools. The system provides a complete financial management solution for schools, focusing on fee collection, payment tracking, financial reporting, and audit compliance.

## Technology Stack

- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with refresh token support
- **File Storage**: Cloudinary for image/file uploads
- **Payment Processing**: Paystack integration (with Flutterwave support planned)
- **Security**: bcryptjs for password hashing, custom encryption for sensitive data
- **Development**: Nodemon for development server

## Core Features

### 1. User Management & Authentication

- **Multi-role system** supporting:
  - Admin
  - ICT Administrator
  - Auditor
  - Proprietor
  - Principal
  - Headteacher
  - Bursar
  - Student
  - Parent
- **Secure authentication** with JWT tokens (10-hour expiry) and refresh tokens (5-day expiry)
- **Role-based access control** with middleware verification
- **Password encryption** using bcryptjs
- **User profiles** with image upload support

### 2. School Structure Management

- **Group Schools**: Manage multiple school groups with logos and descriptions
- **Individual Schools**: Each school linked to a group with contact information
- **Academic Sessions**: Yearly academic periods with start/end dates
- **Terms**: Academic terms within sessions
- **Class Arms**: Class divisions with student capacity tracking
- **Address Management**: Comprehensive address system for schools and users

### 3. Fee Management System

- **Fee Creation**: Define various fee types (tuition, development, etc.)
- **Installment Support**: Allow fees to be paid in multiple installments
- **Fee Approval Workflow**: Principal/Admin approval required for fee activation
- **Term-based Fees**: Link fees to specific academic terms
- **Fee Status Tracking**: Active/inactive fee management

### 4. Payment Processing

- **Multiple Payment Methods**:
  - Paystack integration (card payments, bank transfers)
  - Cash payments
  - Bank transfers
  - Flutterwave (planned)
- **Payment Verification**: Automatic verification via Paystack webhooks
- **Transaction Tracking**: Complete audit trail of all payments
- **Payment Status Management**: Pending, success, failed status tracking
- **Installment Payments**: Support for partial fee payments

### 5. Audit & Reporting System

- **Payment Auditing**: Track all payments by user, term, or session
- **Comprehensive Reporting**: Detailed payment history with school/group information
- **User Payment History**: Individual student payment tracking
- **Session-based Reports**: Payment summaries by academic session
- **Term-based Reports**: Payment analysis by academic term

### 6. Security Features

- **Advanced Encryption**: Custom AES-256-GCM encryption for sensitive data
- **Secure Payment Callbacks**: Encrypted payment verification
- **Token-based Authentication**: Secure API access with role verification
- **Input Validation**: Comprehensive data validation and sanitization
- **CORS Support**: Secure cross-origin resource sharing

### 7. File Management

- **Cloudinary Integration**: Secure cloud storage for images and documents
- **Profile Pictures**: User profile image management
- **School Logos**: Group school logo upload and management
- **File Type Validation**: Secure file upload with type checking
- **Automatic Notifications**: Cloudinary webhook integration

## API Architecture

### Database Models

1. **User**: Student, staff, and admin information with role-based access
2. **School**: Individual school information and settings
3. **GroupSchool**: School group management with branding
4. **Address**: Comprehensive address management
5. **ClassArm**: Class divisions and student capacity
6. **Session**: Academic year management
7. **Term**: Academic term periods
8. **Fee**: Fee definitions and configurations
9. **Payment**: Transaction records and payment tracking
10. **PaymentProfile**: Payment gateway configurations per school
11. **Profile**: Extended user profile information

### API Endpoints Structure

- `/api/v1/auth` - Authentication and login
- `/api/v1/user` - User management (CRUD operations)
- `/api/v1/school` - School management
- `/api/v1/groupSchool` - School group management
- `/api/v1/Address` - Address management
- `/api/v1/ClassArm` - Class management
- `/api/v1/Session` - Academic session management
- `/api/v1/Term` - Academic term management
- `/api/v1/fee` - Fee management
- `/api/v1/payment` - Payment processing
- `/api/v1/paymentProfile` - Payment gateway configuration
- `/api/v1/approve` - Fee approval workflow
- `/api/v1/audit` - Payment auditing and reporting
- `/api/v1/notifications` - System notifications
- `/api/v1/profile` - User profile management

### Security Middleware

- **authenticateToken**: JWT token validation
- **verifyRoles**: Role-based access control
- **File Upload Security**: Multer with file type validation

## Payment Integration

### Paystack Integration

- **Payment Initiation**: Secure payment URL generation
- **Webhook Verification**: Automatic payment confirmation
- **Transaction Mapping**: Convert Paystack data to internal format
- **Callback Handling**: Secure payment verification with encryption
- **Multiple Channels**: Support for web, mobile, POS, and card payments

### Payment Security

- **Encrypted Callbacks**: Payment verification URLs with encrypted keys
- **Transaction References**: Unique reference generation for each payment
- **Duplicate Prevention**: Prevent duplicate payments for same fee
- **Amount Validation**: Ensure payment amounts match fee amounts

## Development Features

- **Environment Configuration**: dotenv for environment variables
- **Development Server**: Nodemon for automatic server restart
- **Error Handling**: Comprehensive error handling and logging
- **Data Validation**: Mongoose schema validation
- **API Documentation**: RESTful API design with clear endpoints

## Deployment Configuration

- **Port**: Configurable (default: 3000)
- **Database**: MongoDB connection with error handling
- **Environment Variables**: Secure configuration management
- **Production Ready**: Environment-specific security settings

## Current Status

The system is fully functional with:

- ✅ Complete user management and authentication
- ✅ School structure and academic management
- ✅ Fee creation and management
- ✅ Paystack payment integration
- ✅ Comprehensive audit system
- ✅ File upload and management
- ✅ Role-based security
- ⏳ Flutterwave integration (planned)
- ⏳ Advanced reporting features (in development)

## Installation & Setup

1. Install dependencies: `npm install`
2. Configure environment variables (MongoDB URI, JWT secrets, Cloudinary, Paystack keys)
3. Start development server: `npm run dev`
4. Start production server: `npm start`

This system provides a robust foundation for school financial management with comprehensive accounting capabilities, payment processing, and audit compliance, making it suitable for educational institutions of various sizes seeking professional financial management solutions.

## Detailed Technical Implementation

### User Management System

The user system supports a hierarchical role structure where:

- **Admin**: Full system access, can create other admins and manage all schools
- **ICT Administrator**: Technical management, user creation, system configuration
- **Proprietor**: School ownership level access, can manage principals and view all data
- **Principal**: School-level management, fee approval, student oversight
- **Headteacher**: Academic management within schools
- **Bursar**: Financial management, payment processing, fee collection
- **Auditor**: Read-only access for financial auditing and reporting
- **Student**: Limited access to personal information and payment history
- **Parent**: Access to linked student information and payment capabilities

### Database Schema Details

#### User Schema

- Personal information (name, email, phone, DOB, gender)
- Academic information (registration number, class arm, student type)
- Relationships (school, profile, address, parent-student linking)
- Security (encrypted password, roles array)
- Timestamps for audit trails

#### Payment Schema

- Transaction details (amount, reference, transaction ID)
- Payment method tracking (Paystack, Flutterwave, cash, bank transfer)
- Status management (pending, success, failed)
- Channel information (web, mobile, POS, card)
- Installment support with boolean flags
- Audit timestamps (transaction date, payment date)

#### Fee Schema

- Fee configuration (name, description, type, amount)
- Academic linking (term, school associations)
- Installment settings (allowed, number of installments)
- Approval workflow (requires principal/admin approval)
- Status management (active/inactive, approved/pending)

### Security Implementation

#### Authentication Flow

1. User login with email/password
2. Password verification using bcryptjs
3. JWT token generation with user ID and roles
4. Refresh token creation for extended sessions
5. Token validation on protected routes
6. Role-based access control per endpoint

#### Payment Security

1. Paystack integration with encrypted callback URLs
2. Custom encryption using AES-256-GCM for sensitive data
3. Transaction reference generation for uniqueness
4. Webhook verification for payment confirmation
5. Duplicate payment prevention mechanisms

### File Upload System

- **Cloudinary Integration**: Secure cloud storage with automatic optimization
- **File Validation**: MIME type checking, size limits (5MB max)
- **Organized Storage**: Folder structure (Smart-s/[category]/[file])
- **Webhook Notifications**: Real-time upload status updates
- **Profile Management**: User avatars and school logos

### API Response Patterns

- **Success Responses**: Consistent JSON structure with data and status
- **Error Handling**: Standardized error messages with appropriate HTTP codes
- **Pagination**: Built-in support for large data sets
- **Population**: Mongoose populate for related data fetching
- **Validation**: Comprehensive input validation and sanitization

### Environment Configuration

Required environment variables:

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `CLOUD_NAME`: Cloudinary cloud name
- `CLOUD_API_KEY`: Cloudinary API key
- `CLOUD_API_SECRET`: Cloudinary API secret
- `NODE_ENV`: Environment (development/production)

### Performance Considerations

- **Database Indexing**: Optimized queries with proper indexing
- **Connection Pooling**: MongoDB connection management
- **Middleware Optimization**: Efficient request processing
- **Error Boundaries**: Graceful error handling and recovery
- **Memory Management**: Proper resource cleanup and management

### Audit Trail System

The system maintains comprehensive audit trails for:

- User creation and modifications
- Payment transactions and status changes
- Fee approvals and modifications
- Login attempts and security events
- File uploads and modifications
- Administrative actions and changes

This implementation ensures data integrity, security, and compliance with educational institution requirements while providing scalability for growth.

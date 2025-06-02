# Smart-S API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication
#### POST /auth/login
Login user and receive authentication tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "Id": "user_id",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "roles": ["Student"],
    "type": "day",
    "gender": "Male"
  },
  "message": "Successful",
  "token": "jwt_token_here"
}
```

### User Management
#### GET /user/all
Get all users (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "_id": "user_id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "roles": ["Student"],
    "school": {
      "name": "Example School"
    },
    "classArm": {
      "name": "JSS 1A"
    }
  }
]
```

#### POST /user/student/create
Create a new student.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "school_id": "school_id",
  "firstname": "Jane",
  "lastname": "Smith",
  "email": "jane@example.com",
  "phone": "1234567890",
  "password": "password123",
  "gender": "Female",
  "classArm_id": "class_id",
  "type": "day",
  "address_id": "address_id"
}
```

### School Management
#### GET /school/all
Get all schools.

**Response:**
```json
[
  {
    "_id": "school_id",
    "name": "Example School",
    "email": "school@example.com",
    "phoneNumber": "1234567890",
    "isActive": true,
    "groupSchool": "group_id",
    "address": "address_id"
  }
]
```

#### POST /school/create
Create a new school (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "groupSchool_id": "group_id",
  "name": "New School",
  "email": "newschool@example.com",
  "phoneNumber": "1234567890",
  "country": "Nigeria",
  "state": "Lagos",
  "town": "Ikeja",
  "street": "Main Street",
  "street_no": 123,
  "zip_code": 100001
}
```

### Fee Management
#### GET /fee/all
Get all fees.

**Response:**
```json
[
  {
    "_id": "fee_id",
    "name": "Tuition Fee",
    "description": "School tuition for the term",
    "type": "tuition",
    "amount": 50000,
    "isActive": true,
    "isApproved": true,
    "isInstallmentAllowed": true,
    "no_ofInstallments": 3,
    "term": {
      "name": "First Term"
    },
    "school": {
      "name": "Example School"
    }
  }
]
```

#### POST /fee/create
Create a new fee.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "term_id": "term_id",
  "school_id": "school_id",
  "name": "Development Fee",
  "description": "School development levy",
  "type": "development",
  "amount": 25000,
  "isInstallmentAllowed": true,
  "no_ofInstallments": 2
}
```

### Payment Processing
#### POST /payment/initiate
Initiate a payment.

**Request Body:**
```json
{
  "user_id": "user_id",
  "fee_id": "fee_id",
  "school_id": "school_id"
}
```

**Response:**
```json
{
  "message": "Payment initiated",
  "paymentUrl": "https://checkout.paystack.com/..."
}
```

#### GET /payment/all
Get all payments.

**Response:**
```json
[
  {
    "_id": "payment_id",
    "amount": 50000,
    "status": "success",
    "mode_of_payment": "paystack",
    "trans_date": "2024-01-15T10:30:00Z",
    "trx_ref": "TXN_REF_123",
    "user": {
      "email": "student@example.com",
      "regNo": "STU001"
    },
    "fee": {
      "name": "Tuition Fee",
      "amount": 50000
    }
  }
]
```

#### POST /payment/pay-with-cash
Record cash payment (Student/Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "user_id",
  "fee_id": "fee_id"
}
```

### Academic Management
#### GET /Session/all
Get all academic sessions.

**Headers:** `Authorization: Bearer <token>`

#### POST /Session/create
Create academic session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "school_id": "school_id",
  "name": "2023/2024",
  "startDate": "2023-09-01",
  "endDate": "2024-07-31"
}
```

#### GET /Term/all
Get all terms.

**Headers:** `Authorization: Bearer <token>`

#### POST /Term/create
Create academic term.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "session_id": "session_id",
  "name": "First Term",
  "startDate": "2023-09-01",
  "endDate": "2023-12-15"
}
```

### Class Management
#### GET /ClassArm/all
Get all class arms.

**Headers:** `Authorization: Bearer <token>`

#### POST /ClassArm/
Create class arm.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "school_id": "school_id",
  "name": "JSS 1A",
  "totalNumberOfStudents": 30
}
```

### Audit & Reporting
#### GET /audit/user/:user_id
Get all payments by user.

**Response:**
```json
[
  {
    "_id": "payment_id",
    "amount": 50000,
    "status": "success",
    "trans_date": "2024-01-15T10:30:00Z",
    "user": {
      "email": "student@example.com",
      "regNo": "STU001"
    },
    "fee": {
      "name": "Tuition Fee",
      "amount": 50000,
      "school": {
        "name": "Example School"
      }
    }
  }
]
```

#### GET /audit/user/:user_id/term/:term_id
Get user payments for specific term.

#### GET /audit/user/:user_id/session/:session_id
Get user payments for specific session.

### Fee Approval
#### PUT /approve/:fee_id/approve
Approve a fee (Principal/Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "isApproved": true
}
```

## Error Responses
All endpoints return standardized error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Role-Based Access Control
Different endpoints require different role permissions:

- **Admin**: Full access to all endpoints
- **ICT Administrator**: User management, system configuration
- **Principal**: School management, fee approval, student oversight
- **Bursar**: Payment processing, financial reports
- **Auditor**: Read-only access to financial data
- **Student**: Limited access to personal data and payments
- **Parent**: Access to linked student information

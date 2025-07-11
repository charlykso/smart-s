# Smart School Academy - Ledgrio School Accounting System

A comprehensive school management system with role-based access control, fee management, and student information systems.

## 🏗️ Project Structure

```
smart-s/
├── api/                     # Backend API (Node.js/Express)
├── frontend/                # Frontend React Application
├── tests/                   # Comprehensive test suites for all user types
├── docs/                    # Project documentation
├── sample-students.xlsx     # Sample data for bulk upload testing
└── test-users.json         # Test user credentials
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB database
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd smart-s
   ```

2. **Install dependencies**

   ```bash
   # Backend
   cd api && npm install

   # Frontend
   cd ../frontend && npm install
   ```

3. **Environment setup**

   ```bash
   # Copy environment file in api directory
   cp .env.example .env
   # Configure MongoDB URI and other variables
   ```

4. **Start the application**

   ```bash
   # Terminal 1: Start backend (from api directory)
   npm start

   # Terminal 2: Start frontend (from frontend directory)
   npm run dev
   ```

## 🎯 User Types & Access

| Role                  | Access Level     | Key Features                                 |
| --------------------- | ---------------- | -------------------------------------------- |
| **Student**           | View Only        | Fees, payments, receipts, profile            |
| **Teacher**           | Limited          | Class management, student records            |
| **Bursar**            | Financial        | Fee management, payment processing           |
| **Principal**         | School Oversight | Reports, school analytics                    |
| **ICT Administrator** | Technical        | User management, bulk uploads, system config |
| **Admin**             | Full System      | All features, system administration          |

## 🧪 Testing

Comprehensive test suites for all user types:

```bash
# Run all tests
node tests/run-all-tests.js

# Test specific user type
node tests/test-student.js
node tests/test-admin.js
node tests/test-ict-admin.js
node tests/test-bursar.js
node tests/test-principal.js
```

## 🔑 Key Features

### ✅ Completed Features

- **Multi-role authentication** with JWT tokens
- **Student fee management** with payment tracking
- **Bulk student upload** with PDF credential generation
- **Dynamic fee calculation** and outstanding balance tracking
- **Receipt generation** and payment history
- **Role-based dashboard** customization
- **Dark mode support** across all interfaces
- **Responsive design** for mobile and desktop

### 🎨 UI/UX Features

- Modern, clean interface design
- Dark/light mode toggle
- Responsive mobile-first design
- Toast notifications for user feedback
- Loading states and error handling
- Intuitive navigation and breadcrumbs

### 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Secure password hashing
- Protected API endpoints
- XSS and CSRF protection

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- API documentation
- Frontend component documentation
- Deployment guides
- Feature specifications

## 🛠️ Development

### Backend (API)

- **Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **File uploads**: Multer
- **PDF generation**: PDFKit

### Frontend

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State management**: Zustand
- **HTTP client**: Axios
- **UI components**: Headless UI
- **Icons**: Heroicons

## 🚀 Deployment

The application is ready for deployment with:

- Environment-based configuration
- Production build optimization
- Database migration scripts
- Docker support (optional)

## 📞 Support

For technical support or questions:

- Check the documentation in `docs/`
- Run the test suites to verify system status
- Review error logs for troubleshooting

---

**Smart School Academy** - Empowering education through technology

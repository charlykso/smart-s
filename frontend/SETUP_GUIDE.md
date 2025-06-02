# Smart-S Frontend Setup Guide

## Quick Start

### 1. Project Initialization
```bash
# Navigate to frontend directory
cd frontend

# Initialize React project with Vite and TypeScript
npm create vite@latest . -- --template react-ts

# Install all dependencies
npm install
```

### 2. Install Required Packages
```bash
# Core dependencies
npm install react-router-dom zustand @tanstack/react-query axios

# UI and styling
npm install tailwindcss autoprefixer postcss @headlessui/react @heroicons/react clsx tailwind-merge

# Forms and validation
npm install react-hook-form @hookform/resolvers zod

# UI feedback and animations
npm install react-hot-toast framer-motion

# Charts and data visualization
npm install chart.js react-chartjs-2 @tanstack/react-table

# File handling
npm install react-dropzone react-image-crop

# Payment integration
npm install react-paystack

# Date handling
npm install date-fns react-datepicker

# Utilities
npm install lodash @types/lodash uuid @types/uuid

# Development dependencies
npm install -D @types/react @types/react-dom @vitejs/plugin-react
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D husky lint-staged
npm install -D @tailwindcss/forms @tailwindcss/typography
```

### 3. Configure Tailwind CSS
```bash
# Initialize Tailwind CSS
npx tailwindcss init -p

# Install Tailwind CSS plugins
npm install -D @tailwindcss/forms @tailwindcss/typography
```

### 4. Project Structure Setup
```bash
# Create directory structure
mkdir -p src/{components/{ui,forms,layout,common,charts},pages/{auth,dashboard,users,schools,fees,payments,reports,settings},hooks,services,store,types,utils,constants}

# Create component subdirectories
mkdir -p src/components/{ui,forms,layout,common,charts}
mkdir -p src/pages/{auth,dashboard,users,schools,fees,payments,reports,settings}
```

## Configuration Files

### 1. Environment Variables
Create `.env` file in frontend root:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Smart-S School Management

# Payment Configuration
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# File Upload Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# App Configuration
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

### 2. TypeScript Configuration
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/store/*": ["./src/store/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/constants/*": ["./src/constants/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Vite Configuration
Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/constants': path.resolve(__dirname, './src/constants'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### 4. Tailwind Configuration
Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### 5. ESLint Configuration
Create `.eslintrc.cjs`:
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
```

### 6. Prettier Configuration
Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## Initial File Structure

### 1. Create Base Types
```typescript
// src/types/index.ts
export interface User {
  _id: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  email: string;
  phone: string;
  roles: UserRole[];
  school?: School;
  classArm?: ClassArm;
  profile?: Profile;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  groupSchool: GroupSchool;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Fee {
  _id: string;
  name: string;
  description: string;
  type: string;
  amount: number;
  isActive: boolean;
  isApproved: boolean;
  isInstallmentAllowed: boolean;
  no_ofInstallments: number;
  term: Term;
  school: School;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  user: User;
  fee: Fee;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  mode_of_payment: 'paystack' | 'flutterwave' | 'bank_transfer' | 'cash';
  trans_date: string;
  trx_ref?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'Admin' 
  | 'ICT_administrator' 
  | 'Auditor' 
  | 'Proprietor' 
  | 'Principal' 
  | 'Headteacher' 
  | 'Bursar' 
  | 'Student' 
  | 'Parent';
```

### 2. Create Constants
```typescript
// src/constants/index.ts
export const USER_ROLES: Record<UserRole, string> = {
  Admin: 'Administrator',
  ICT_administrator: 'ICT Administrator',
  Auditor: 'Auditor',
  Proprietor: 'Proprietor',
  Principal: 'Principal',
  Headteacher: 'Head Teacher',
  Bursar: 'Bursar',
  Student: 'Student',
  Parent: 'Parent',
};

export const PAYMENT_METHODS = {
  paystack: 'Paystack',
  flutterwave: 'Flutterwave',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash Payment',
};

export const PAYMENT_STATUS = {
  pending: 'Pending',
  success: 'Successful',
  failed: 'Failed',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    ALL: '/user/all',
    CREATE: '/user/create',
    STUDENT_CREATE: '/user/student/create',
  },
  SCHOOLS: {
    ALL: '/school/all',
    CREATE: '/school/create',
  },
  FEES: {
    ALL: '/fee/all',
    CREATE: '/fee/create',
  },
  PAYMENTS: {
    ALL: '/payment/all',
    INITIATE: '/payment/initiate',
    CASH: '/payment/pay-with-cash',
  },
};
```

## Development Workflow

### 1. Start Development Server
```bash
# Start frontend development server
npm run dev

# Start backend API server (in separate terminal)
cd ../api
npm run dev
```

### 2. Code Quality Commands
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### 3. Build for Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

This setup guide provides everything needed to get the Smart-S frontend project up and running with a solid foundation for development.

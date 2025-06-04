# Ledgrio Frontend Routing & Navigation Structure

## Route Hierarchy

### Public Routes (No Authentication Required)

```typescript
// src/routes/publicRoutes.ts
export const publicRoutes = [
  {
    path: '/login',
    component: LoginPage,
    title: 'Login - Ledgrio',
  },
  {
    path: '/forgot-password',
    component: ForgotPasswordPage,
    title: 'Forgot Password - Ledgrio',
  },
  {
    path: '/reset-password/:token',
    component: ResetPasswordPage,
    title: 'Reset Password - Ledgrio',
  },
  {
    path: '/',
    redirect: '/login',
  },
];
```

### Protected Routes (Authentication Required)

```typescript
// src/routes/protectedRoutes.ts
export const protectedRoutes = [
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        component: DashboardHome,
        roles: ['all'],
        title: 'Dashboard - Smart-S',
      },
      {
        path: 'profile',
        component: ProfilePage,
        roles: ['all'],
        title: 'Profile - Smart-S',
      },
    ],
  },

  // User Management Routes
  {
    path: '/users',
    component: UserLayout,
    roles: ['Admin', 'ICT_administrator', 'Principal', 'Proprietor'],
    children: [
      {
        path: '',
        component: UserListPage,
        title: 'Users - Smart-S',
      },
      {
        path: 'create',
        component: CreateUserPage,
        roles: ['Admin', 'ICT_administrator'],
        title: 'Create User - Smart-S',
      },
      {
        path: ':id',
        component: UserDetailPage,
        title: 'User Details - Smart-S',
      },
      {
        path: ':id/edit',
        component: EditUserPage,
        title: 'Edit User - Smart-S',
      },
    ],
  },

  // School Management Routes
  {
    path: '/schools',
    component: SchoolLayout,
    roles: ['Admin', 'ICT_administrator', 'Proprietor'],
    children: [
      {
        path: '',
        component: SchoolListPage,
        title: 'Schools - Smart-S',
      },
      {
        path: 'create',
        component: CreateSchoolPage,
        roles: ['Admin'],
        title: 'Create School - Smart-S',
      },
      {
        path: ':id',
        component: SchoolDetailPage,
        title: 'School Details - Smart-S',
      },
      {
        path: ':id/edit',
        component: EditSchoolPage,
        title: 'Edit School - Smart-S',
      },
      {
        path: ':id/sessions',
        component: SessionManagementPage,
        title: 'Academic Sessions - Smart-S',
      },
      {
        path: ':id/classes',
        component: ClassManagementPage,
        title: 'Class Management - Smart-S',
      },
    ],
  },

  // Fee Management Routes
  {
    path: '/fees',
    component: FeeLayout,
    roles: ['Admin', 'ICT_administrator', 'Principal', 'Bursar'],
    children: [
      {
        path: '',
        component: FeeListPage,
        title: 'Fees - Smart-S',
      },
      {
        path: 'create',
        component: CreateFeePage,
        roles: ['Admin', 'ICT_administrator', 'Principal'],
        title: 'Create Fee - Smart-S',
      },
      {
        path: ':id',
        component: FeeDetailPage,
        title: 'Fee Details - Smart-S',
      },
      {
        path: ':id/edit',
        component: EditFeePage,
        title: 'Edit Fee - Smart-S',
      },
      {
        path: 'approvals',
        component: FeeApprovalsPage,
        roles: ['Principal', 'Admin'],
        title: 'Fee Approvals - Smart-S',
      },
    ],
  },

  // Payment Routes
  {
    path: '/payments',
    component: PaymentLayout,
    roles: [
      'Admin',
      'ICT_administrator',
      'Principal',
      'Bursar',
      'Student',
      'Parent',
    ],
    children: [
      {
        path: '',
        component: PaymentListPage,
        title: 'Payments - Smart-S',
      },
      {
        path: 'make-payment',
        component: MakePaymentPage,
        roles: ['Student', 'Parent'],
        title: 'Make Payment - Smart-S',
      },
      {
        path: 'history',
        component: PaymentHistoryPage,
        title: 'Payment History - Smart-S',
      },
      {
        path: ':id',
        component: PaymentDetailPage,
        title: 'Payment Details - Smart-S',
      },
      {
        path: 'cash-payments',
        component: CashPaymentPage,
        roles: ['Admin', 'Bursar'],
        title: 'Cash Payments - Smart-S',
      },
    ],
  },

  // Reports Routes
  {
    path: '/reports',
    component: ReportLayout,
    roles: ['Admin', 'ICT_administrator', 'Principal', 'Bursar', 'Auditor'],
    children: [
      {
        path: '',
        component: ReportDashboardPage,
        title: 'Reports - Smart-S',
      },
      {
        path: 'financial',
        component: FinancialReportsPage,
        title: 'Financial Reports - Smart-S',
      },
      {
        path: 'students',
        component: StudentReportsPage,
        title: 'Student Reports - Smart-S',
      },
      {
        path: 'audit',
        component: AuditReportsPage,
        roles: ['Admin', 'Auditor'],
        title: 'Audit Reports - Smart-S',
      },
    ],
  },

  // Settings Routes
  {
    path: '/settings',
    component: SettingsLayout,
    roles: ['Admin', 'ICT_administrator', 'Principal'],
    children: [
      {
        path: '',
        component: GeneralSettingsPage,
        title: 'Settings - Smart-S',
      },
      {
        path: 'payment-config',
        component: PaymentConfigPage,
        roles: ['Admin', 'ICT_administrator'],
        title: 'Payment Configuration - Smart-S',
      },
      {
        path: 'system',
        component: SystemSettingsPage,
        roles: ['Admin', 'ICT_administrator'],
        title: 'System Settings - Smart-S',
      },
    ],
  },
];
```

## Navigation Menu Structure

### Role-Based Menu Items

```typescript
// src/constants/navigation.ts
export const navigationItems: Record<UserRole, NavigationItem[]> = {
  Admin: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: false,
    },
    {
      name: 'Schools',
      href: '/schools',
      icon: BuildingOfficeIcon,
      current: false,
      children: [
        { name: 'All Schools', href: '/schools' },
        { name: 'Create School', href: '/schools/create' },
        { name: 'Group Schools', href: '/schools/groups' },
      ],
    },
    {
      name: 'Users',
      href: '/users',
      icon: UsersIcon,
      current: false,
      children: [
        { name: 'All Users', href: '/users' },
        { name: 'Create User', href: '/users/create' },
        { name: 'Roles & Permissions', href: '/users/roles' },
      ],
    },
    {
      name: 'Fees',
      href: '/fees',
      icon: CurrencyDollarIcon,
      current: false,
      children: [
        { name: 'All Fees', href: '/fees' },
        { name: 'Create Fee', href: '/fees/create' },
        { name: 'Approvals', href: '/fees/approvals' },
      ],
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCardIcon,
      current: false,
      children: [
        { name: 'All Payments', href: '/payments' },
        { name: 'Cash Payments', href: '/payments/cash-payments' },
        { name: 'Payment Config', href: '/settings/payment-config' },
      ],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      current: false,
      children: [
        { name: 'Financial Reports', href: '/reports/financial' },
        { name: 'Student Reports', href: '/reports/students' },
        { name: 'Audit Reports', href: '/reports/audit' },
      ],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      current: false,
    },
  ],

  Principal: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: false,
    },
    {
      name: 'Students',
      href: '/users?role=Student',
      icon: AcademicCapIcon,
      current: false,
      children: [
        { name: 'All Students', href: '/users?role=Student' },
        { name: 'Add Student', href: '/users/create?role=Student' },
        { name: 'Class Management', href: '/schools/classes' },
      ],
    },
    {
      name: 'Staff',
      href: '/users?role=Staff',
      icon: UsersIcon,
      current: false,
      children: [
        { name: 'All Staff', href: '/users?role=Staff' },
        { name: 'Add Staff', href: '/users/create?role=Staff' },
      ],
    },
    {
      name: 'Fees',
      href: '/fees',
      icon: CurrencyDollarIcon,
      current: false,
      children: [
        { name: 'All Fees', href: '/fees' },
        { name: 'Create Fee', href: '/fees/create' },
        { name: 'Approvals', href: '/fees/approvals' },
      ],
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCardIcon,
      current: false,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      current: false,
    },
  ],

  Student: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: false,
    },
    {
      name: 'My Fees',
      href: '/fees/my-fees',
      icon: CurrencyDollarIcon,
      current: false,
    },
    {
      name: 'Make Payment',
      href: '/payments/make-payment',
      icon: CreditCardIcon,
      current: false,
    },
    {
      name: 'Payment History',
      href: '/payments/history',
      icon: ClockIcon,
      current: false,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      current: false,
    },
  ],

  Parent: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: false,
    },
    {
      name: 'My Children',
      href: '/students/my-children',
      icon: UsersIcon,
      current: false,
    },
    {
      name: 'Fees & Payments',
      href: '/payments',
      icon: CurrencyDollarIcon,
      current: false,
      children: [
        { name: 'Outstanding Fees', href: '/fees/outstanding' },
        { name: 'Make Payment', href: '/payments/make-payment' },
        { name: 'Payment History', href: '/payments/history' },
      ],
    },
    {
      name: 'Reports',
      href: '/reports/student',
      icon: DocumentTextIcon,
      current: false,
    },
  ],

  Bursar: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: false,
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCardIcon,
      current: false,
      children: [
        { name: 'All Payments', href: '/payments' },
        { name: 'Cash Payments', href: '/payments/cash-payments' },
        { name: 'Outstanding Fees', href: '/fees/outstanding' },
      ],
    },
    {
      name: 'Financial Reports',
      href: '/reports/financial',
      icon: ChartBarIcon,
      current: false,
    },
    {
      name: 'Fee Management',
      href: '/fees',
      icon: CurrencyDollarIcon,
      current: false,
    },
  ],

  // Add other roles...
};
```

## Route Protection Implementation

### Protected Route Component

```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback = <UnauthorizedPage />,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role =>
      user.roles.includes(role)
    );

    if (!hasRequiredRole) {
      return fallback;
    }
  }

  return <>{children}</>;
};
```

### Route Configuration

```typescript
// src/routes/index.tsx
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/*"
        element={
          <ProtectedRoute requiredRoles={['Admin', 'ICT_administrator', 'Principal']}>
            <UserRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/schools/*"
        element={
          <ProtectedRoute requiredRoles={['Admin', 'ICT_administrator', 'Proprietor']}>
            <SchoolRoutes />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
```

## Breadcrumb Navigation

### Breadcrumb Configuration

```typescript
// src/utils/breadcrumbs.ts
export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
  ];

  let currentPath = '';

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    const breadcrumbConfig = breadcrumbMap[segment];
    if (breadcrumbConfig) {
      breadcrumbs.push({
        name: breadcrumbConfig.name,
        href: currentPath,
        current: index === pathSegments.length - 1,
      });
    }
  });

  return breadcrumbs;
};

const breadcrumbMap: Record<string, { name: string }> = {
  users: { name: 'Users' },
  schools: { name: 'Schools' },
  fees: { name: 'Fees' },
  payments: { name: 'Payments' },
  reports: { name: 'Reports' },
  settings: { name: 'Settings' },
  create: { name: 'Create' },
  edit: { name: 'Edit' },
};
```

This routing structure provides a comprehensive navigation system with role-based access control, ensuring users only see and can access the features appropriate for their role in the Ledgrio school management system.

# Smart-S Frontend Component Architecture

## Component Hierarchy & Structure

### 1. Layout Components

#### AppLayout
```typescript
// src/components/layout/AppLayout.tsx
interface AppLayoutProps {
  children: React.ReactNode;
}

// Features:
// - Responsive sidebar navigation
// - Header with user profile
// - Main content area
// - Mobile menu toggle
// - Breadcrumb navigation
```

#### Sidebar
```typescript
// src/components/layout/Sidebar.tsx
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Features:
// - Role-based menu items
// - Collapsible sections
// - Active route highlighting
// - Mobile responsive
// - School/session switcher
```

#### Header
```typescript
// src/components/layout/Header.tsx
interface HeaderProps {
  onMenuToggle: () => void;
}

// Features:
// - User profile dropdown
// - Notifications bell
// - Search functionality
// - School/session display
// - Logout option
```

### 2. Authentication Components

#### LoginForm
```typescript
// src/components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess: (user: User) => void;
  onError: (error: string) => void;
}

// Features:
// - Email/password validation
// - Remember me checkbox
// - Loading states
// - Error handling
// - Forgot password link
```

#### ProtectedRoute
```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

// Features:
// - Role-based access control
// - Authentication check
// - Redirect to login
// - Loading states
```

### 3. Form Components

#### FormField
```typescript
// src/components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}
```

#### SelectField
```typescript
// src/components/forms/SelectField.tsx
interface SelectFieldProps {
  label: string;
  name: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  multiple?: boolean;
}
```

#### FileUpload
```typescript
// src/components/forms/FileUpload.tsx
interface FileUploadProps {
  label: string;
  name: string;
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => void;
  preview?: boolean;
  error?: string;
}
```

### 4. Data Display Components

#### DataTable
```typescript
// src/components/ui/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilterConfig;
  actions?: ActionConfig<T>[];
}
```

#### StatsCard
```typescript
// src/components/ui/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ComponentType;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}
```

#### Chart
```typescript
// src/components/charts/Chart.tsx
interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData;
  options?: ChartOptions;
  height?: number;
  title?: string;
}
```

### 5. User Management Components

#### UserList
```typescript
// src/components/users/UserList.tsx
interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  loading?: boolean;
}
```

#### UserForm
```typescript
// src/components/users/UserForm.tsx
interface UserFormProps {
  user?: User;
  onSubmit: (userData: CreateUserData) => void;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}
```

#### RoleSelector
```typescript
// src/components/users/RoleSelector.tsx
interface RoleSelectorProps {
  selectedRoles: UserRole[];
  onChange: (roles: UserRole[]) => void;
  availableRoles: UserRole[];
  multiple?: boolean;
}
```

### 6. School Management Components

#### SchoolCard
```typescript
// src/components/schools/SchoolCard.tsx
interface SchoolCardProps {
  school: School;
  onEdit: () => void;
  onView: () => void;
  onManageUsers: () => void;
}
```

#### SessionManager
```typescript
// src/components/schools/SessionManager.tsx
interface SessionManagerProps {
  schoolId: string;
  currentSession?: Session;
  onSessionChange: (session: Session) => void;
}
```

#### ClassArmManager
```typescript
// src/components/schools/ClassArmManager.tsx
interface ClassArmManagerProps {
  schoolId: string;
  classArms: ClassArm[];
  onAdd: (classArm: CreateClassArmData) => void;
  onEdit: (classArm: ClassArm) => void;
  onDelete: (classArmId: string) => void;
}
```

### 7. Fee Management Components

#### FeeList
```typescript
// src/components/fees/FeeList.tsx
interface FeeListProps {
  fees: Fee[];
  onEdit: (fee: Fee) => void;
  onApprove: (feeId: string) => void;
  onDelete: (feeId: string) => void;
  showApprovalActions?: boolean;
}
```

#### FeeForm
```typescript
// src/components/fees/FeeForm.tsx
interface FeeFormProps {
  fee?: Fee;
  onSubmit: (feeData: CreateFeeData) => void;
  onCancel: () => void;
  schools: School[];
  terms: Term[];
  loading?: boolean;
}
```

#### FeeApprovalCard
```typescript
// src/components/fees/FeeApprovalCard.tsx
interface FeeApprovalCardProps {
  fee: Fee;
  onApprove: () => void;
  onReject: (reason: string) => void;
  loading?: boolean;
}
```

### 8. Payment Components

#### PaymentForm
```typescript
// src/components/payments/PaymentForm.tsx
interface PaymentFormProps {
  fee: Fee;
  user: User;
  onSuccess: (payment: Payment) => void;
  onError: (error: string) => void;
  paymentMethods: PaymentMethod[];
}
```

#### PaymentHistory
```typescript
// src/components/payments/PaymentHistory.tsx
interface PaymentHistoryProps {
  payments: Payment[];
  loading?: boolean;
  onViewReceipt: (paymentId: string) => void;
  showUserInfo?: boolean;
}
```

#### PaystackButton
```typescript
// src/components/payments/PaystackButton.tsx
interface PaystackButtonProps {
  amount: number;
  email: string;
  reference: string;
  onSuccess: (response: PaystackResponse) => void;
  onClose: () => void;
  publicKey: string;
}
```

### 9. Dashboard Components

#### DashboardStats
```typescript
// src/components/dashboard/DashboardStats.tsx
interface DashboardStatsProps {
  userRole: UserRole;
  schoolId?: string;
  dateRange?: DateRange;
}
```

#### RecentActivities
```typescript
// src/components/dashboard/RecentActivities.tsx
interface RecentActivitiesProps {
  activities: Activity[];
  loading?: boolean;
  maxItems?: number;
}
```

#### QuickActions
```typescript
// src/components/dashboard/QuickActions.tsx
interface QuickActionsProps {
  userRole: UserRole;
  onAction: (action: string) => void;
}
```

### 10. Report Components

#### ReportBuilder
```typescript
// src/components/reports/ReportBuilder.tsx
interface ReportBuilderProps {
  reportType: ReportType;
  onGenerate: (config: ReportConfig) => void;
  loading?: boolean;
}
```

#### ReportViewer
```typescript
// src/components/reports/ReportViewer.tsx
interface ReportViewerProps {
  report: Report;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
  onPrint: () => void;
}
```

### 11. Common UI Components

#### Button
```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Modal
```typescript
// src/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}
```

#### LoadingSpinner
```typescript
// src/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}
```

#### EmptyState
```typescript
// src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## Component Organization Principles

### 1. Atomic Design
- **Atoms**: Basic UI elements (Button, Input, Icon)
- **Molecules**: Simple combinations (FormField, SearchBox)
- **Organisms**: Complex components (DataTable, UserForm)
- **Templates**: Page layouts (DashboardLayout, AuthLayout)
- **Pages**: Complete views (Dashboard, UserManagement)

### 2. Feature-Based Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form-related components
│   ├── layout/       # Layout components
│   └── common/       # Shared components
├── features/
│   ├── auth/         # Authentication components
│   ├── users/        # User management components
│   ├── schools/      # School management components
│   ├── fees/         # Fee management components
│   ├── payments/     # Payment components
│   └── reports/      # Reporting components
```

### 3. Component Best Practices
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Use composition for flexibility
- **Props Interface**: Clear TypeScript interfaces for all props
- **Error Boundaries**: Wrap components in error boundaries
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Memoization and lazy loading where appropriate

This architecture ensures maintainable, scalable, and reusable components throughout the Smart-S frontend application.

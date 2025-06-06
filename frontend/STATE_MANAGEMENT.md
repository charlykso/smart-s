# State Management & API Integration Guide

## State Management Architecture

### 1. Zustand Store Structure

#### Authentication Store
```typescript
// src/store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;
```

#### School Store
```typescript
// src/store/schoolStore.ts
interface SchoolState {
  schools: School[];
  currentSchool: School | null;
  sessions: Session[];
  currentSession: Session | null;
  terms: Term[];
  currentTerm: Term | null;
  classArms: ClassArm[];
  isLoading: boolean;
  error: string | null;
}

interface SchoolActions {
  fetchSchools: () => Promise<void>;
  setCurrentSchool: (school: School) => void;
  fetchSessions: (schoolId: string) => Promise<void>;
  setCurrentSession: (session: Session) => void;
  fetchTerms: (sessionId: string) => Promise<void>;
  setCurrentTerm: (term: Term) => void;
  fetchClassArms: (schoolId: string) => Promise<void>;
  createSchool: (schoolData: CreateSchoolData) => Promise<void>;
  updateSchool: (schoolId: string, schoolData: UpdateSchoolData) => Promise<void>;
}
```

#### User Store
```typescript
// src/store/userStore.ts
interface UserState {
  users: User[];
  selectedUser: User | null;
  filters: UserFilters;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<void>;
  updateUser: (userId: string, userData: UpdateUserData) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  setFilters: (filters: UserFilters) => void;
  setPagination: (pagination: PaginationState) => void;
}
```

#### Fee Store
```typescript
// src/store/feeStore.ts
interface FeeState {
  fees: Fee[];
  pendingApprovals: Fee[];
  selectedFee: Fee | null;
  isLoading: boolean;
  error: string | null;
}

interface FeeActions {
  fetchFees: (schoolId?: string, termId?: string) => Promise<void>;
  fetchPendingApprovals: () => Promise<void>;
  createFee: (feeData: CreateFeeData) => Promise<void>;
  updateFee: (feeId: string, feeData: UpdateFeeData) => Promise<void>;
  approveFee: (feeId: string) => Promise<void>;
  rejectFee: (feeId: string, reason: string) => Promise<void>;
  deleteFee: (feeId: string) => Promise<void>;
}
```

#### Payment Store
```typescript
// src/store/paymentStore.ts
interface PaymentState {
  payments: Payment[];
  userPayments: Payment[];
  paymentStats: PaymentStats;
  selectedPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

interface PaymentActions {
  fetchPayments: (filters?: PaymentFilters) => Promise<void>;
  fetchUserPayments: (userId: string) => Promise<void>;
  fetchPaymentStats: (dateRange?: DateRange) => Promise<void>;
  initiatePayment: (paymentData: InitiatePaymentData) => Promise<string>;
  recordCashPayment: (paymentData: CashPaymentData) => Promise<void>;
  verifyPayment: (reference: string) => Promise<void>;
}
```

### 2. React Query Integration

#### Query Keys
```typescript
// src/services/queryKeys.ts
export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    refresh: ['auth', 'refresh'] as const,
  },
  schools: {
    all: ['schools'] as const,
    detail: (id: string) => ['schools', id] as const,
    sessions: (schoolId: string) => ['schools', schoolId, 'sessions'] as const,
    terms: (sessionId: string) => ['sessions', sessionId, 'terms'] as const,
    classArms: (schoolId: string) => ['schools', schoolId, 'classArms'] as const,
  },
  users: {
    all: (filters?: UserFilters) => ['users', filters] as const,
    detail: (id: string) => ['users', id] as const,
    byRole: (role: UserRole) => ['users', 'role', role] as const,
  },
  fees: {
    all: (schoolId?: string, termId?: string) => ['fees', schoolId, termId] as const,
    detail: (id: string) => ['fees', id] as const,
    pending: ['fees', 'pending'] as const,
  },
  payments: {
    all: (filters?: PaymentFilters) => ['payments', filters] as const,
    user: (userId: string) => ['payments', 'user', userId] as const,
    stats: (dateRange?: DateRange) => ['payments', 'stats', dateRange] as const,
  },
} as const;
```

#### Custom Hooks
```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const authStore = useAuthStore();
  
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      authStore.setUser(data.user);
      authStore.setToken(data.token);
    },
    onError: (error) => {
      authStore.setError(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      authStore.logout();
      queryClient.clear();
    },
  });

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading: loginMutation.isLoading || logoutMutation.isLoading,
  };
};
```

```typescript
// src/hooks/useSchools.ts
export const useSchools = () => {
  const schoolStore = useSchoolStore();

  const schoolsQuery = useQuery({
    queryKey: queryKeys.schools.all,
    queryFn: schoolService.getAll,
    onSuccess: (data) => {
      schoolStore.setSchools(data);
    },
  });

  const createSchoolMutation = useMutation({
    mutationFn: schoolService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.schools.all);
    },
  });

  return {
    schools: schoolStore.schools,
    currentSchool: schoolStore.currentSchool,
    isLoading: schoolsQuery.isLoading,
    createSchool: createSchoolMutation.mutate,
    setCurrentSchool: schoolStore.setCurrentSchool,
  };
};
```

### 3. API Service Layer

#### Base API Client
```typescript
// src/services/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Service Classes
```typescript
// src/services/authService.ts
class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
}

export const authService = new AuthService();
```

```typescript
// src/services/userService.ts
class UserService {
  async getAll(filters?: UserFilters): Promise<User[]> {
    const response = await apiClient.get('/user/all', { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<User> {
    const response = await apiClient.get(`/user/${id}`);
    return response.data;
  }

  async create(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post('/user/create', userData);
    return response.data;
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put(`/user/${id}/update`, userData);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/user/${id}/delete`);
  }

  async createStudent(studentData: CreateStudentData): Promise<User> {
    const response = await apiClient.post('/user/student/create', studentData);
    return response.data;
  }
}

export const userService = new UserService();
```

### 4. Error Handling

#### Error Types
```typescript
// src/types/errors.ts
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public field?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

#### Error Boundary
```typescript
// src/components/common/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

### 5. Data Synchronization

#### Optimistic Updates
```typescript
// src/hooks/useOptimisticUpdate.ts
export const useOptimisticUpdate = <T>(
  queryKey: QueryKey,
  updateFn: (oldData: T[], newItem: T) => T[]
) => {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async (newItem: T) => {
      await queryClient.cancelQueries(queryKey);
      const previousData = queryClient.getQueryData<T[]>(queryKey);
      
      if (previousData) {
        queryClient.setQueryData(queryKey, updateFn(previousData, newItem));
      }
      
      return { previousData };
    },
    onError: (err, newItem, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });
};
```

#### Real-time Updates
```typescript
// src/hooks/useWebSocket.ts
export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };
    
    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  return { socket, isConnected, sendMessage };
};
```

This state management architecture provides a robust foundation for handling data flow, API integration, and real-time updates in the Smart-S frontend application.

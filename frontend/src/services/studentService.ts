import { apiService } from './api';

export interface StudentDashboardData {
  student: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    regNo: string;
    school?: any;
    classArm?: any;
    profile?: any;
  };
  financial: {
    totalOutstanding: number;
    totalPaid: number;
    outstandingFees: Array<{
      _id: string;
      name: string;
      amount: number;
      type: string;
      dueDate?: string;
    }>;
    recentPayments: Array<{
      _id: string;
      amount: number;
      fee: any;
      status: string;
      mode: string;
      date: string;
      reference: string;
    }>;
  };
  academic: {
    currentAverage: number;
    attendanceRate: number;
    completedAssignments: number;
    totalAssignments: number;
  };
  currentTerm?: {
    _id: string;
    name: string;
    session: any;
  };
}

export interface StudentPayment {
  _id: string;
  amount: number;
  fee: {
    _id: string;
    name: string;
    amount: number;
    type: string;
    term?: any;
  };
  status: string;
  mode_of_payment: string;
  trans_date: string;
  trx_ref: string;
}

export interface OutstandingFee {
  _id: string;
  name: string;
  amount: number;
  type: string;
  term: {
    _id: string;
    name: string;
  };
  dueDate?: string;
}

export interface AcademicSummary {
  currentTerm: {
    average: number;
    position: number;
    totalStudents: number;
    subjects: Array<{
      name: string;
      score: number;
      grade: string;
    }>;
  };
  attendance: {
    rate: number;
    daysPresent: number;
    totalDays: number;
    lateArrivals: number;
  };
  assignments: {
    completed: number;
    total: number;
    pending: number;
    overdue: number;
  };
}

class StudentService {
  /**
   * Get student dashboard data
   */
  async getDashboardData(): Promise<StudentDashboardData> {
    try {
      const response = await apiService.get('/student/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
      // Return mock data as fallback
      return this.getMockDashboardData();
    }
  }

  /**
   * Get student payments history
   */
  async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    term?: string;
  }): Promise<{
    payments: StudentPayment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const response = await apiService.get('/student/payments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student payments:', error);
      return {
        payments: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      };
    }
  }

  /**
   * Get student outstanding fees
   */
  async getOutstandingFees(): Promise<{
    outstandingFees: OutstandingFee[];
    totalAmount: number;
    currentTerm?: any;
  }> {
    try {
      const response = await apiService.get('/student/outstanding-fees');
      return response.data;
    } catch (error) {
      console.error('Error fetching outstanding fees:', error);
      return {
        outstandingFees: [],
        totalAmount: 0
      };
    }
  }

  /**
   * Get student academic summary
   */
  async getAcademicSummary(): Promise<AcademicSummary> {
    try {
      const response = await apiService.get('/student/academic-summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching academic summary:', error);
      return this.getMockAcademicSummary();
    }
  }

  /**
   * Mock dashboard data for fallback
   */
  private getMockDashboardData(): StudentDashboardData {
    return {
      student: {
        _id: 'mock-student-id',
        firstname: 'John',
        lastname: 'Student',
        email: 'student@smart-s.com',
        regNo: 'STU001'
      },
      financial: {
        totalOutstanding: 45000,
        totalPaid: 125000,
        outstandingFees: [
          {
            _id: '1',
            name: 'School Fees',
            amount: 35000,
            type: 'tuition'
          },
          {
            _id: '2',
            name: 'Development Levy',
            amount: 10000,
            type: 'levy'
          }
        ],
        recentPayments: [
          {
            _id: '1',
            amount: 25000,
            fee: { name: 'School Fees', amount: 25000 },
            status: 'success',
            mode: 'bank_transfer',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            reference: 'TXN001'
          }
        ]
      },
      academic: {
        currentAverage: 85,
        attendanceRate: 92,
        completedAssignments: 8,
        totalAssignments: 10
      }
    };
  }

  /**
   * Mock academic summary for fallback
   */
  private getMockAcademicSummary(): AcademicSummary {
    return {
      currentTerm: {
        average: 85,
        position: 5,
        totalStudents: 45,
        subjects: [
          { name: 'Mathematics', score: 88, grade: 'A' },
          { name: 'English', score: 82, grade: 'B+' },
          { name: 'Physics', score: 90, grade: 'A+' },
          { name: 'Chemistry', score: 85, grade: 'A' },
          { name: 'Biology', score: 78, grade: 'B' }
        ]
      },
      attendance: {
        rate: 92,
        daysPresent: 46,
        totalDays: 50,
        lateArrivals: 3
      },
      assignments: {
        completed: 8,
        total: 10,
        pending: 2,
        overdue: 0
      }
    };
  }
}

export const studentService = new StudentService();

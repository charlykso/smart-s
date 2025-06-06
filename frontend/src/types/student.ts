import type { User, School, ClassArm, Address, Profile } from './index';

// Student-specific types
export interface Student extends User {
  regNo: string;
  classArm: ClassArm | string;
  type: 'day' | 'boarding';
  DOB: string;
  gender: 'Male' | 'Female';
  profile: StudentProfile | string;
  parent?: User | string;
  academicInfo?: AcademicInfo;
  enrollmentInfo?: EnrollmentInfo;
}

export interface StudentProfile extends Profile {
  img?: string;
  graduationYear?: number;
  dateOfAdmission?: string;
  emergencyContact?: EmergencyContact;
  medicalInfo?: MedicalInfo;
  guardianInfo?: GuardianInfo;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface MedicalInfo {
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  doctorName?: string;
  doctorPhone?: string;
  hospitalName?: string;
}

export interface GuardianInfo {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  occupation?: string;
  workAddress?: string;
  isEmergencyContact: boolean;
}

export interface AcademicInfo {
  currentGPA?: number;
  currentGrade?: string;
  academicStatus: 'active' | 'suspended' | 'graduated' | 'transferred' | 'dropped';
  enrollmentDate: string;
  expectedGraduationYear: number;
  previousSchool?: string;
  subjects?: StudentSubject[];
  attendance?: AttendanceRecord;
}

export interface StudentSubject {
  _id: string;
  name: string;
  code: string;
  teacher: User | string;
  currentGrade?: string;
  currentScore?: number;
  assignments?: Assignment[];
  tests?: Test[];
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  submittedDate?: string;
  score?: number;
  maxScore: number;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  feedback?: string;
}

export interface Test {
  _id: string;
  title: string;
  date: string;
  score?: number;
  maxScore: number;
  grade?: string;
  type: 'quiz' | 'midterm' | 'final' | 'practical';
}

export interface AttendanceRecord {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  lastUpdated: string;
}

export interface EnrollmentInfo {
  admissionNumber: string;
  enrollmentDate: string;
  academicYear: string;
  entryClass: string;
  currentClass: string;
  promotionHistory?: PromotionRecord[];
  disciplinaryRecords?: DisciplinaryRecord[];
}

export interface PromotionRecord {
  _id: string;
  fromClass: string;
  toClass: string;
  academicYear: string;
  date: string;
  reason: string;
  approvedBy: User | string;
}

export interface DisciplinaryRecord {
  _id: string;
  date: string;
  offense: string;
  description: string;
  action: string;
  reportedBy: User | string;
  handledBy: User | string;
  status: 'pending' | 'resolved' | 'appealed';
}

// Form data types
export interface CreateStudentData {
  // Personal Information
  firstname: string;
  middlename?: string;
  lastname: string;
  email: string;
  phone: string;
  DOB: string;
  gender: 'Male' | 'Female';
  regNo: string;
  
  // Academic Information
  school_id: string;
  classArm_id: string;
  type: 'day' | 'boarding';
  expectedGraduationYear: number;
  previousSchool?: string;
  
  // Address Information
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  
  // Guardian Information
  guardian: GuardianInfo;
  
  // Emergency Contact
  emergencyContact: EmergencyContact;
  
  // Medical Information (optional)
  medicalInfo?: MedicalInfo;
  
  // Profile Image (optional)
  profileImage?: File;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  _id: string;
}

export interface StudentFilters {
  school?: string;
  classArm?: string;
  academicYear?: string;
  gender?: 'Male' | 'Female';
  type?: 'day' | 'boarding';
  academicStatus?: 'active' | 'suspended' | 'graduated' | 'transferred' | 'dropped';
  search?: string;
  page?: number;
  limit?: number;
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  maleStudents: number;
  femaleStudents: number;
  dayStudents: number;
  boardingStudents: number;
  newEnrollments: number;
  graduatedStudents: number;
  averageAttendance: number;
  averageGPA: number;
  studentsByClass: {
    className: string;
    count: number;
  }[];
  enrollmentTrends: {
    month: string;
    enrollments: number;
  }[];
}

// Component props types
export interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onView?: (student: Student) => void;
  showActions?: boolean;
}

export interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  schools: School[];
  classArms: ClassArm[];
  onSubmit: (data: CreateStudentData | UpdateStudentData) => Promise<void>;
}

export interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onUpdate: (data: Partial<StudentProfile>) => Promise<void>;
}

// Store types
export interface StudentManagementState {
  students: Student[];
  selectedStudent: Student | null;
  studentStats: StudentStats | null;
  isLoading: boolean;
  error: string | null;
  filters: StudentFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentManagementActions {
  // Student CRUD operations
  loadStudents: (filters?: StudentFilters) => Promise<void>;
  loadStudentById: (id: string) => Promise<Student>;
  createStudent: (data: CreateStudentData) => Promise<Student>;
  updateStudent: (data: UpdateStudentData) => Promise<Student>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Bulk operations
  bulkCreateStudents: (students: CreateStudentData[]) => Promise<void>;
  bulkUpdateStudents: (updates: { id: string; data: Partial<UpdateStudentData> }[]) => Promise<void>;
  bulkDeleteStudents: (ids: string[]) => Promise<void>;
  
  // Academic operations
  updateAcademicInfo: (studentId: string, data: Partial<AcademicInfo>) => Promise<void>;
  promoteStudent: (studentId: string, data: PromotionRecord) => Promise<void>;
  addDisciplinaryRecord: (studentId: string, data: DisciplinaryRecord) => Promise<void>;
  
  // Statistics and analytics
  loadStudentStats: (schoolId?: string, classId?: string) => Promise<void>;
  
  // Utility actions
  setSelectedStudent: (student: Student | null) => void;
  setFilters: (filters: Partial<StudentFilters>) => void;
  clearError: () => void;
  reset: () => void;
}

// Export/Import types
export interface StudentExportData {
  students: Student[];
  exportDate: string;
  exportedBy: string;
  filters: StudentFilters;
  totalRecords: number;
}

export interface StudentImportData {
  students: CreateStudentData[];
  importDate: string;
  importedBy: string;
  validationErrors?: {
    row: number;
    field: string;
    error: string;
  }[];
}

// Academic performance types
export interface StudentPerformance {
  student: Student;
  currentTerm: {
    average: number;
    position: number;
    totalStudents: number;
    subjects: {
      name: string;
      score: number;
      grade: string;
    }[];
  };
  previousTerms: {
    term: string;
    average: number;
    position: number;
  }[];
  attendance: AttendanceRecord;
  assignments: {
    completed: number;
    total: number;
    pending: number;
    overdue: number;
  };
}

// Constants
export const STUDENT_TYPES = {
  DAY: 'day',
  BOARDING: 'boarding',
} as const;

export const ACADEMIC_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
  DROPPED: 'dropped',
} as const;

export const GENDER_OPTIONS = {
  MALE: 'Male',
  FEMALE: 'Female',
} as const;

export type StudentType = typeof STUDENT_TYPES[keyof typeof STUDENT_TYPES];
export type AcademicStatus = typeof ACADEMIC_STATUS[keyof typeof ACADEMIC_STATUS];
export type Gender = typeof GENDER_OPTIONS[keyof typeof GENDER_OPTIONS];

// School Management Types

export interface Address {
  _id: string;
  country: string;
  state: string;
  town: string;
  street: string;
  street_no: string;
  zip_code: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupSchool {
  _id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  _id: string;
  groupSchool: GroupSchool | string;
  name: string;
  address: Address | string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  _id: string;
  school: School | string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Term {
  _id: string;
  session: Session | string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassArm {
  _id: string;
  school: School | string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Form Types for Creating/Updating
export interface CreateGroupSchoolData {
  name: string;
  description: string;
  logo: string;
}

export interface UpdateGroupSchoolData extends Partial<CreateGroupSchoolData> {
  _id: string;
}

export interface CreateSchoolData {
  groupSchool_id: string;
  name: string;
  email: string;
  phoneNumber: string;
  // Address fields
  country: string;
  state: string;
  town: string;
  street: string;
  street_no: string;
  zip_code: string;
  // Optional existing address
  address_id?: string;
}

export interface UpdateSchoolData extends Partial<CreateSchoolData> {
  _id: string;
}

export interface CreateSessionData {
  school_id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSessionData extends Partial<CreateSessionData> {
  _id: string;
}

export interface CreateTermData {
  session: string; // session_id
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTermData extends Partial<CreateTermData> {
  _id: string;
}

export interface CreateClassArmData {
  school_id: string;
  name: string;
}

export interface UpdateClassArmData extends Partial<CreateClassArmData> {
  _id: string;
}

export interface CreateAddressData {
  country: string;
  state: string;
  town: string;
  street: string;
  street_no: string;
  zip_code: string;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {
  _id: string;
}

// Filter and Search Types
export interface SchoolFilters {
  groupSchool?: string;
  isActive?: boolean;
  search?: string;
}

export interface SessionFilters {
  school?: string;
  year?: string;
  search?: string;
}

export interface TermFilters {
  session?: string;
  search?: string;
}

export interface ClassArmFilters {
  school?: string;
  search?: string;
}

// Dashboard and Statistics Types
export interface SchoolStats {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  totalClasses: number;
  totalSessions: number;
  currentSession?: Session;
  currentTerm?: Term;
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'session' | 'term' | 'holiday' | 'exam' | 'event';
  school?: string;
  description?: string;
  color?: string;
}

// School Management Context Types
export interface SchoolManagementState {
  selectedSchool: School | null;
  selectedSession: Session | null;
  selectedTerm: Term | null;
  schools: School[];
  sessions: Session[];
  terms: Term[];
  classArms: ClassArm[];
  isLoading: boolean;
  error: string | null;
}

export interface SchoolManagementActions {
  setSelectedSchool: (school: School | null) => void;
  setSelectedSession: (session: Session | null) => void;
  setSelectedTerm: (term: Term | null) => void;
  loadSchools: () => Promise<void>;
  loadSessions: (schoolId?: string) => Promise<void>;
  loadTerms: (sessionId?: string) => Promise<void>;
  loadClassArms: (schoolId?: string) => Promise<void>;
  createSchool: (data: CreateSchoolData) => Promise<School>;
  updateSchool: (data: UpdateSchoolData) => Promise<School>;
  deleteSchool: (id: string) => Promise<void>;
  createSession: (data: CreateSessionData) => Promise<Session>;
  updateSession: (data: UpdateSessionData) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  createTerm: (data: CreateTermData) => Promise<Term>;
  updateTerm: (data: UpdateTermData) => Promise<Term>;
  deleteTerm: (id: string) => Promise<void>;
  createClassArm: (data: CreateClassArmData) => Promise<ClassArm>;
  updateClassArm: (data: UpdateClassArmData) => Promise<ClassArm>;
  deleteClassArm: (id: string) => Promise<void>;
}

// Component Props Types
export interface SchoolCardProps {
  school: School;
  onEdit?: (school: School) => void;
  onDelete?: (school: School) => void;
  onSelect?: (school: School) => void;
  isSelected?: boolean;
}

export interface SessionCardProps {
  session: Session;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
  onSelect?: (session: Session) => void;
  isSelected?: boolean;
}

export interface TermCardProps {
  term: Term;
  onEdit?: (term: Term) => void;
  onDelete?: (term: Term) => void;
  onSelect?: (term: Term) => void;
  isSelected?: boolean;
}

export interface ClassArmCardProps {
  classArm: ClassArm;
  onEdit?: (classArm: ClassArm) => void;
  onDelete?: (classArm: ClassArm) => void;
  onSelect?: (classArm: ClassArm) => void;
  isSelected?: boolean;
}

// Modal Props Types
export interface SchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  school?: School;
  groupSchools: GroupSchool[];
  onSubmit: (data: CreateSchoolData | UpdateSchoolData) => Promise<void>;
}

export interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: Session;
  schools: School[];
  onSubmit: (data: CreateSessionData | UpdateSessionData) => Promise<void>;
}

export interface TermModalProps {
  isOpen: boolean;
  onClose: () => void;
  term?: Term;
  sessions: Session[];
  onSubmit: (data: CreateTermData | UpdateTermData) => Promise<void>;
}

export interface ClassArmModalProps {
  isOpen: boolean;
  onClose: () => void;
  classArm?: ClassArm;
  schools: School[];
  onSubmit: (data: CreateClassArmData | UpdateClassArmData) => Promise<void>;
}

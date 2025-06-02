import { ApiService } from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse } from '../types';
import type { 
  Student, 
  CreateStudentData, 
  UpdateStudentData, 
  StudentFilters, 
  StudentStats,
  StudentPerformance,
  AcademicInfo,
  PromotionRecord,
  DisciplinaryRecord,
  StudentExportData,
  StudentImportData
} from '../types/student';

export class StudentManagementService {
  // Student CRUD Operations
  static async getStudents(filters?: StudentFilters): Promise<{
    students: Student[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await ApiService.get<ApiResponse<{
      students: Student[];
      pagination: any;
    }>>(`${API_ENDPOINTS.USERS.ALL}?${params.toString()}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch students');
    }
    
    return response.data!;
  }

  static async getStudentById(id: string): Promise<Student> {
    const response = await ApiService.get<ApiResponse<Student>>(
      `${API_ENDPOINTS.USERS.BY_ID.replace(':id', id)}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch student');
    }
    
    return response.data!;
  }

  static async createStudent(data: CreateStudentData): Promise<Student> {
    // First create the address
    const addressResponse = await ApiService.post<ApiResponse<any>>(
      API_ENDPOINTS.ADDRESSES.CREATE,
      data.address
    );

    if (!addressResponse.success) {
      throw new Error('Failed to create student address');
    }

    // Prepare student data
    const studentData = {
      school_id: data.school_id,
      firstname: data.firstname,
      middlename: data.middlename,
      lastname: data.lastname,
      regNo: data.regNo,
      email: data.email,
      phone: data.phone,
      address_id: addressResponse.data!._id,
      DOB: data.DOB,
      gender: data.gender,
      classArm_id: data.classArm_id,
      type: data.type,
      roles: ['Student'],
      password: `${data.firstname.toLowerCase()}${data.regNo}`, // Default password
    };

    const response = await ApiService.post<ApiResponse<Student>>(
      API_ENDPOINTS.USERS.CREATE_STUDENT,
      studentData
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create student');
    }
    
    return response.data!;
  }

  static async updateStudent(data: UpdateStudentData): Promise<Student> {
    const response = await ApiService.put<ApiResponse<Student>>(
      API_ENDPOINTS.USERS.UPDATE_STUDENT.replace(':id', data._id),
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update student');
    }
    
    return response.data!;
  }

  static async deleteStudent(id: string): Promise<void> {
    const response = await ApiService.delete<ApiResponse<void>>(
      API_ENDPOINTS.USERS.DELETE.replace(':id', id)
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete student');
    }
  }

  // Bulk Operations
  static async bulkCreateStudents(students: CreateStudentData[]): Promise<{
    successful: Student[];
    failed: { student: CreateStudentData; error: string }[];
  }> {
    const results = {
      successful: [] as Student[],
      failed: [] as { student: CreateStudentData; error: string }[]
    };

    for (const studentData of students) {
      try {
        const student = await this.createStudent(studentData);
        results.successful.push(student);
      } catch (error) {
        results.failed.push({
          student: studentData,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  static async bulkDeleteStudents(ids: string[]): Promise<{
    successful: string[];
    failed: { id: string; error: string }[];
  }> {
    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[]
    };

    for (const id of ids) {
      try {
        await this.deleteStudent(id);
        results.successful.push(id);
      } catch (error) {
        results.failed.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Academic Operations
  static async updateAcademicInfo(studentId: string, data: Partial<AcademicInfo>): Promise<void> {
    const response = await ApiService.put<ApiResponse<void>>(
      `/students/${studentId}/academic`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update academic information');
    }
  }

  static async promoteStudent(studentId: string, data: PromotionRecord): Promise<void> {
    const response = await ApiService.post<ApiResponse<void>>(
      `/students/${studentId}/promote`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to promote student');
    }
  }

  static async addDisciplinaryRecord(studentId: string, data: DisciplinaryRecord): Promise<void> {
    const response = await ApiService.post<ApiResponse<void>>(
      `/students/${studentId}/disciplinary`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to add disciplinary record');
    }
  }

  // Statistics and Analytics
  static async getStudentStats(schoolId?: string, classId?: string): Promise<StudentStats> {
    const params = new URLSearchParams();
    if (schoolId) params.append('school', schoolId);
    if (classId) params.append('class', classId);

    const response = await ApiService.get<ApiResponse<StudentStats>>(
      `/students/stats?${params.toString()}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch student statistics');
    }
    
    return response.data!;
  }

  static async getStudentPerformance(studentId: string): Promise<StudentPerformance> {
    const response = await ApiService.get<ApiResponse<StudentPerformance>>(
      `/students/${studentId}/performance`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch student performance');
    }
    
    return response.data!;
  }

  // Search and Filter
  static async searchStudents(query: string, filters?: Partial<StudentFilters>): Promise<Student[]> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await ApiService.get<ApiResponse<Student[]>>(
      `/students/search?${params.toString()}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to search students');
    }
    
    return response.data!;
  }

  // Export and Import
  static async exportStudents(filters?: StudentFilters): Promise<StudentExportData> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await ApiService.get<ApiResponse<StudentExportData>>(
      `/students/export?${params.toString()}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to export students');
    }
    
    return response.data!;
  }

  static async importStudents(data: StudentImportData): Promise<{
    successful: number;
    failed: number;
    errors: { row: number; field: string; error: string }[];
  }> {
    const response = await ApiService.post<ApiResponse<{
      successful: number;
      failed: number;
      errors: { row: number; field: string; error: string }[];
    }>>('/students/import', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to import students');
    }
    
    return response.data!;
  }

  // Parent-Student Linking
  static async linkParent(studentId: string, parentId: string): Promise<void> {
    const response = await ApiService.post<ApiResponse<void>>(
      `/students/${studentId}/link-parent`,
      { parentId }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to link parent');
    }
  }

  static async unlinkParent(studentId: string): Promise<void> {
    const response = await ApiService.delete<ApiResponse<void>>(
      `/students/${studentId}/unlink-parent`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to unlink parent');
    }
  }

  // Profile Management
  static async uploadProfileImage(studentId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await ApiService.post<ApiResponse<{ imageUrl: string }>>(
      `/students/${studentId}/profile-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to upload profile image');
    }
    
    return response.data!.imageUrl;
  }

  static async updateProfile(studentId: string, data: Partial<any>): Promise<void> {
    const response = await ApiService.put<ApiResponse<void>>(
      `/students/${studentId}/profile`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update profile');
    }
  }
}

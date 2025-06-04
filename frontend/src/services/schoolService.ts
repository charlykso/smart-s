import { ApiService } from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse } from '../types';
import type {
  School,
  GroupSchool,
  Session,
  Term,
  ClassArm,
  Address,
  CreateSchoolData,
  UpdateSchoolData,
  CreateGroupSchoolData,
  UpdateGroupSchoolData,
  CreateSessionData,
  UpdateSessionData,
  CreateTermData,
  UpdateTermData,
  CreateClassArmData,
  UpdateClassArmData,
  CreateAddressData,
  UpdateAddressData,
} from '../types/school';

export class SchoolService {
  // Group School Management
  static async getGroupSchools(): Promise<GroupSchool[]> {
    try {
      const response = await ApiService.get<any>(API_ENDPOINTS.GROUP_SCHOOLS.ALL);

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.success && response.data) {
        return response.data;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching group schools:', error);
      throw error;
    }
  }

  static async getGroupSchool(id: string): Promise<GroupSchool> {
    const response = await ApiService.get<ApiResponse<GroupSchool>>(
      `${API_ENDPOINTS.GROUP_SCHOOLS.BY_ID}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch group school');
    }
    
    return response.data!;
  }

  static async createGroupSchool(data: CreateGroupSchoolData): Promise<GroupSchool> {
    const response = await ApiService.post<ApiResponse<GroupSchool>>(
      API_ENDPOINTS.GROUP_SCHOOLS.CREATE,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create group school');
    }
    
    return response.data!;
  }

  static async updateGroupSchool(data: UpdateGroupSchoolData): Promise<GroupSchool> {
    const response = await ApiService.put<ApiResponse<GroupSchool>>(
      `${API_ENDPOINTS.GROUP_SCHOOLS.UPDATE}/${data._id}`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update group school');
    }
    
    return response.data!;
  }

  static async deleteGroupSchool(id: string): Promise<void> {
    const response = await ApiService.delete<ApiResponse>(
      `${API_ENDPOINTS.GROUP_SCHOOLS.DELETE}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete group school');
    }
  }

  static async uploadGroupSchoolLogo(id: string, file: File): Promise<string> {
    const response = await ApiService.uploadFile<ApiResponse<{ url: string }>>(
      `${API_ENDPOINTS.GROUP_SCHOOLS.UPLOAD_LOGO}/${id}`,
      file
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to upload logo');
    }
    
    return response.data!.url;
  }

  // School Management
  static async getSchools(): Promise<School[]> {
    try {
      const response = await ApiService.get<any>(API_ENDPOINTS.SCHOOLS.ALL);

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.success && response.data) {
        return response.data;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  }

  static async getSchool(id: string): Promise<School> {
    const response = await ApiService.get<ApiResponse<School>>(
      `${API_ENDPOINTS.SCHOOLS.BY_ID}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch school');
    }
    
    return response.data!;
  }

  static async getSchoolsByGroup(groupId: string): Promise<School[]> {
    const response = await ApiService.get<ApiResponse<School[]>>(
      `${API_ENDPOINTS.SCHOOLS.BY_GROUP}/${groupId}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch schools by group');
    }
    
    return response.data || [];
  }

  static async createSchool(data: CreateSchoolData): Promise<School> {
    const response = await ApiService.post<ApiResponse<School>>(
      API_ENDPOINTS.SCHOOLS.CREATE,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create school');
    }
    
    return response.data!;
  }

  static async updateSchool(data: UpdateSchoolData): Promise<School> {
    const response = await ApiService.put<ApiResponse<School>>(
      `${API_ENDPOINTS.SCHOOLS.UPDATE}/${data._id}`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update school');
    }
    
    return response.data!;
  }

  static async deleteSchool(id: string): Promise<void> {
    const response = await ApiService.delete<ApiResponse>(
      `${API_ENDPOINTS.SCHOOLS.DELETE}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete school');
    }
  }

  // Session Management
  static async getSessions(): Promise<Session[]> {
    try {
      const response = await ApiService.get<any>(API_ENDPOINTS.SESSIONS.ALL);

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.success && response.data) {
        return response.data;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  static async getSession(id: string): Promise<Session> {
    const response = await ApiService.get<ApiResponse<Session>>(
      `${API_ENDPOINTS.SESSIONS.BY_ID}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch session');
    }
    
    return response.data!;
  }

  static async createSession(data: CreateSessionData): Promise<Session> {
    const response = await ApiService.post<ApiResponse<Session>>(
      API_ENDPOINTS.SESSIONS.CREATE,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create session');
    }
    
    return response.data!;
  }

  static async updateSession(data: UpdateSessionData): Promise<Session> {
    const response = await ApiService.put<ApiResponse<Session>>(
      `${API_ENDPOINTS.SESSIONS.UPDATE}/${data._id}`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update session');
    }
    
    return response.data!;
  }

  static async deleteSession(id: string): Promise<void> {
    const response = await ApiService.delete<ApiResponse>(
      `${API_ENDPOINTS.SESSIONS.DELETE}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete session');
    }
  }

  // Term Management
  static async getTerms(): Promise<Term[]> {
    try {
      const response = await ApiService.get<any>(API_ENDPOINTS.TERMS.ALL);

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.success && response.data) {
        return response.data;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching terms:', error);
      throw error;
    }
  }

  static async getTerm(id: string): Promise<Term> {
    const response = await ApiService.get<ApiResponse<Term>>(
      `${API_ENDPOINTS.TERMS.BY_ID}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch term');
    }
    
    return response.data!;
  }

  static async createTerm(data: CreateTermData): Promise<Term> {
    const response = await ApiService.post<ApiResponse<Term>>(
      API_ENDPOINTS.TERMS.CREATE,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create term');
    }
    
    return response.data!;
  }

  static async updateTerm(data: UpdateTermData): Promise<Term> {
    const response = await ApiService.put<ApiResponse<Term>>(
      `${API_ENDPOINTS.TERMS.UPDATE}/${data._id}`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update term');
    }
    
    return response.data!;
  }

  static async deleteTerm(id: string): Promise<void> {
    const response = await ApiService.delete<ApiResponse>(
      `${API_ENDPOINTS.TERMS.DELETE}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete term');
    }
  }

  // Class Arm Management
  static async getClassArms(): Promise<ClassArm[]> {
    try {
      const response = await ApiService.get<any>(API_ENDPOINTS.CLASS_ARMS.ALL);

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.success && response.data) {
        return response.data;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching class arms:', error);
      throw error;
    }
  }

  static async getClassArm(id: string): Promise<ClassArm> {
    const response = await ApiService.get<ApiResponse<ClassArm>>(
      `${API_ENDPOINTS.CLASS_ARMS.BY_ID}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch class arm');
    }
    
    return response.data!;
  }

  static async createClassArm(data: CreateClassArmData): Promise<ClassArm> {
    const response = await ApiService.post<ApiResponse<ClassArm>>(
      API_ENDPOINTS.CLASS_ARMS.CREATE,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create class arm');
    }
    
    return response.data!;
  }

  static async updateClassArm(data: UpdateClassArmData): Promise<ClassArm> {
    const response = await ApiService.put<ApiResponse<ClassArm>>(
      `${API_ENDPOINTS.CLASS_ARMS.UPDATE}/${data._id}`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update class arm');
    }
    
    return response.data!;
  }

  static async deleteClassArm(id: string): Promise<void> {
    const response = await ApiService.delete<ApiResponse>(
      `${API_ENDPOINTS.CLASS_ARMS.DELETE}/${id}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete class arm');
    }
  }
}

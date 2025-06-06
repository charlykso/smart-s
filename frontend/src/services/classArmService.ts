import api from './api';

export interface ClassArmStudentCount {
  _id: string;
  name: string;
  school: {
    _id: string;
    name: string;
  };
  currentStudentCount: number;
  students?: Array<{
    _id: string;
    firstname: string;
    lastname: string;
    regNo: string;
    email: string;
    phone: string;
  }>;
}

export interface UpdateStudentCountResponse {
  success: boolean;
  message: string;
  data?: {
    classArmId: string;
    studentCount: number;
    classArm: any;
  };
  error?: string;
}

export interface UpdateAllStudentCountsResponse {
  success: boolean;
  message: string;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: Array<{
    success: boolean;
    classArmId?: string;
    studentCount?: number;
    error?: string;
  }>;
}

class ClassArmService {
  /**
   * Update student count for a specific classArm
   */
  async updateClassArmStudentCount(classArmId: string): Promise<UpdateStudentCountResponse> {
    try {
      const response = await api.put(`/classarm/${classArmId}/update-student-count`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update student count');
    }
  }

  /**
   * Update student counts for all classArms
   */
  async updateAllClassArmsStudentCount(): Promise<UpdateAllStudentCountsResponse> {
    try {
      const response = await api.put('/classarm/update-all-student-counts');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update all student counts');
    }
  }

  /**
   * Get classArm with current student count and student list
   */
  async getClassArmWithStudentCount(classArmId: string): Promise<{
    success: boolean;
    data: ClassArmStudentCount;
  }> {
    try {
      const response = await api.get(`/classarm/${classArmId}/student-count`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get classArm student count');
    }
  }

  /**
   * Get all classArms (existing endpoint)
   */
  async getAllClassArms(): Promise<any> {
    try {
      const response = await api.get('/classarm');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get classArms');
    }
  }

  /**
   * Create a new classArm (existing endpoint)
   */
  async createClassArm(classArmData: any): Promise<any> {
    try {
      const response = await api.post('/classarm', classArmData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create classArm');
    }
  }

  /**
   * Update a classArm (existing endpoint)
   */
  async updateClassArm(classArmId: string, classArmData: any): Promise<any> {
    try {
      const response = await api.put(`/classarm/${classArmId}`, classArmData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update classArm');
    }
  }

  /**
   * Delete a classArm (existing endpoint)
   */
  async deleteClassArm(classArmId: string): Promise<any> {
    try {
      const response = await api.delete(`/classarm/${classArmId}/delete`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete classArm');
    }
  }
}

export default new ClassArmService();

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { StudentManagementService } from '../services/studentManagementService';
import type { 
  Student, 
  CreateStudentData, 
  UpdateStudentData, 
  StudentFilters, 
  StudentStats,
  StudentManagementState,
  StudentManagementActions
} from '../types/student';
import toast from 'react-hot-toast';

interface StudentManagementStore extends StudentManagementState, StudentManagementActions {}

export const useStudentManagementStore = create<StudentManagementStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      students: [],
      selectedStudent: null,
      studentStats: null,
      isLoading: false,
      error: null,
      filters: {
        page: 1,
        limit: 10,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },

      // Student CRUD operations
      loadStudents: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const currentFilters = filters || get().filters;
          const response = await StudentManagementService.getStudents(currentFilters);
          
          set({
            students: response.students,
            pagination: response.pagination,
            filters: currentFilters,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load students';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      loadStudentById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const student = await StudentManagementService.getStudentById(id);
          set({ selectedStudent: student, isLoading: false });
          return student;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load student';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      createStudent: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const student = await StudentManagementService.createStudent(data);
          
          // Add to current students list
          const currentStudents = get().students;
          set({
            students: [student, ...currentStudents],
            isLoading: false,
          });
          
          toast.success('Student created successfully!');
          
          // Reload students to get updated pagination
          await get().loadStudents();
          
          return student;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create student';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateStudent: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedStudent = await StudentManagementService.updateStudent(data);
          
          // Update in current students list
          const currentStudents = get().students;
          const updatedStudents = currentStudents.map(student =>
            student._id === data._id ? updatedStudent : student
          );
          
          set({
            students: updatedStudents,
            selectedStudent: get().selectedStudent?._id === data._id ? updatedStudent : get().selectedStudent,
            isLoading: false,
          });
          
          toast.success('Student updated successfully!');
          return updatedStudent;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update student';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteStudent: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await StudentManagementService.deleteStudent(id);
          
          // Remove from current students list
          const currentStudents = get().students;
          const filteredStudents = currentStudents.filter(student => student._id !== id);
          
          set({
            students: filteredStudents,
            selectedStudent: get().selectedStudent?._id === id ? null : get().selectedStudent,
            isLoading: false,
          });
          
          toast.success('Student deleted successfully!');
          
          // Reload students to get updated pagination
          await get().loadStudents();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete student';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Bulk operations
      bulkCreateStudents: async (students) => {
        set({ isLoading: true, error: null });
        try {
          const results = await StudentManagementService.bulkCreateStudents(students);
          
          if (results.successful.length > 0) {
            toast.success(`Successfully created ${results.successful.length} students`);
          }
          
          if (results.failed.length > 0) {
            toast.error(`Failed to create ${results.failed.length} students`);
          }
          
          // Reload students
          await get().loadStudents();
          
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create students';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      bulkUpdateStudents: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          // Process updates sequentially
          const results = { successful: 0, failed: 0 };
          
          for (const update of updates) {
            try {
              await StudentManagementService.updateStudent({ _id: update.id, ...update.data });
              results.successful++;
            } catch {
              results.failed++;
            }
          }
          
          if (results.successful > 0) {
            toast.success(`Successfully updated ${results.successful} students`);
          }
          
          if (results.failed > 0) {
            toast.error(`Failed to update ${results.failed} students`);
          }
          
          // Reload students
          await get().loadStudents();
          
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update students';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      bulkDeleteStudents: async (ids) => {
        set({ isLoading: true, error: null });
        try {
          const results = await StudentManagementService.bulkDeleteStudents(ids);
          
          if (results.successful.length > 0) {
            toast.success(`Successfully deleted ${results.successful.length} students`);
          }
          
          if (results.failed.length > 0) {
            toast.error(`Failed to delete ${results.failed.length} students`);
          }
          
          // Reload students
          await get().loadStudents();
          
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete students';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Academic operations
      updateAcademicInfo: async (studentId, data) => {
        set({ isLoading: true, error: null });
        try {
          await StudentManagementService.updateAcademicInfo(studentId, data);
          
          // Update selected student if it's the same one
          if (get().selectedStudent?._id === studentId) {
            const updatedStudent = await StudentManagementService.getStudentById(studentId);
            set({ selectedStudent: updatedStudent });
          }
          
          toast.success('Academic information updated successfully!');
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update academic information';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      promoteStudent: async (studentId, data) => {
        set({ isLoading: true, error: null });
        try {
          await StudentManagementService.promoteStudent(studentId, data);
          
          // Reload student data
          if (get().selectedStudent?._id === studentId) {
            const updatedStudent = await StudentManagementService.getStudentById(studentId);
            set({ selectedStudent: updatedStudent });
          }
          
          toast.success('Student promoted successfully!');
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to promote student';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      addDisciplinaryRecord: async (studentId, data) => {
        set({ isLoading: true, error: null });
        try {
          await StudentManagementService.addDisciplinaryRecord(studentId, data);
          
          // Reload student data
          if (get().selectedStudent?._id === studentId) {
            const updatedStudent = await StudentManagementService.getStudentById(studentId);
            set({ selectedStudent: updatedStudent });
          }
          
          toast.success('Disciplinary record added successfully!');
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add disciplinary record';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Statistics and analytics
      loadStudentStats: async (schoolId, classId) => {
        set({ isLoading: true, error: null });
        try {
          const stats = await StudentManagementService.getStudentStats(schoolId, classId);
          set({ studentStats: stats, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load student statistics';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Utility actions
      setSelectedStudent: (student) => {
        set({ selectedStudent: student });
      },

      setFilters: (filters) => {
        const currentFilters = get().filters;
        const newFilters = { ...currentFilters, ...filters };
        set({ filters: newFilters });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          students: [],
          selectedStudent: null,
          studentStats: null,
          isLoading: false,
          error: null,
          filters: { page: 1, limit: 10 },
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
      },
    }),
    {
      name: 'student-management-store',
    }
  )
);

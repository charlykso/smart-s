import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SchoolService } from '../services/schoolService';
import toast from 'react-hot-toast';
import type {
  School,
  GroupSchool,
  Session,
  Term,
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
  SchoolManagementState,
  SchoolManagementActions,
} from '../types/school';

interface SchoolStore extends SchoolManagementState, SchoolManagementActions {
  // Additional store-specific properties
  groupSchools: GroupSchool[];
  
  // Additional actions
  loadGroupSchools: () => Promise<void>;
  createGroupSchool: (data: CreateGroupSchoolData) => Promise<GroupSchool>;
  updateGroupSchool: (data: UpdateGroupSchoolData) => Promise<GroupSchool>;
  deleteGroupSchool: (id: string) => Promise<void>;
  uploadGroupSchoolLogo: (id: string, file: File) => Promise<string>;
  
  // Role-based loading
  loadDataByUserRole: (userRoles: string[]) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState: SchoolManagementState & { groupSchools: GroupSchool[] } = {
  selectedSchool: null,
  selectedSession: null,
  selectedTerm: null,
  schools: [],
  groupSchools: [],
  sessions: [],
  terms: [],
  classArms: [],
  isLoading: false,
  error: null,
};

export const useSchoolStore = create<SchoolStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Group School Actions
      loadGroupSchools: async () => {
        set({ isLoading: true, error: null });
        try {
          const groupSchools = await SchoolService.getGroupSchools();
          set({ groupSchools, isLoading: false });
        } catch (error) {
          // Check if it's an authentication error (401)
          if (error?.response?.status === 401) {
            console.warn('No permission to access all group schools - this is normal for ICT administrators');
            // Set empty array and clear loading state without showing error
            set({ groupSchools: [], isLoading: false, error: null });
          } else {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load group schools';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        }
      },

      createGroupSchool: async (data: CreateGroupSchoolData) => {
        set({ isLoading: true, error: null });
        try {
          const newGroupSchool = await SchoolService.createGroupSchool(data);
          const { groupSchools } = get();
          set({ 
            groupSchools: [...groupSchools, newGroupSchool], 
            isLoading: false 
          });
          toast.success('Group school created successfully!');
          return newGroupSchool;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create group school';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateGroupSchool: async (data: UpdateGroupSchoolData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedGroupSchool = await SchoolService.updateGroupSchool(data);
          const { groupSchools } = get();
          set({ 
            groupSchools: groupSchools.map(gs => 
              gs._id === data._id ? updatedGroupSchool : gs
            ), 
            isLoading: false 
          });
          toast.success('Group school updated successfully!');
          return updatedGroupSchool;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update group school';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteGroupSchool: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await SchoolService.deleteGroupSchool(id);
          const { groupSchools } = get();
          set({ 
            groupSchools: groupSchools.filter(gs => gs._id !== id), 
            isLoading: false 
          });
          toast.success('Group school deleted successfully!');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete group school';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      uploadGroupSchoolLogo: async (id: string, file: File) => {
        set({ isLoading: true, error: null });
        try {
          const logoUrl = await SchoolService.uploadGroupSchoolLogo(id, file);
          const { groupSchools } = get();
          set({ 
            groupSchools: groupSchools.map(gs => 
              gs._id === id ? { ...gs, logo: logoUrl } : gs
            ), 
            isLoading: false 
          });
          toast.success('Logo uploaded successfully!');
          return logoUrl;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // School Actions
      loadSchools: async () => {
        set({ isLoading: true, error: null });
        try {
          const schools = await SchoolService.getSchools();
          set({ schools, isLoading: false });
        } catch (error) {
          // Check if it's an authentication error (401)
          if (error?.response?.status === 401) {
            console.warn('No permission to access schools - this may be normal for some user roles');
            // Set empty array and clear loading state without showing error
            set({ schools: [], isLoading: false, error: null });
          } else {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load schools';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        }
      },

      createSchool: async (data: CreateSchoolData) => {
        set({ isLoading: true, error: null });
        try {
          const newSchool = await SchoolService.createSchool(data);
          const { schools } = get();
          set({ 
            schools: [...schools, newSchool], 
            isLoading: false 
          });
          toast.success('School created successfully!');
          return newSchool;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create school';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateSchool: async (data: UpdateSchoolData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedSchool = await SchoolService.updateSchool(data);
          const { schools } = get();
          set({ 
            schools: schools.map(school => 
              school._id === data._id ? updatedSchool : school
            ), 
            isLoading: false 
          });
          toast.success('School updated successfully!');
          return updatedSchool;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update school';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteSchool: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await SchoolService.deleteSchool(id);
          const { schools } = get();
          set({ 
            schools: schools.filter(school => school._id !== id), 
            isLoading: false 
          });
          toast.success('School deleted successfully!');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete school';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Session Actions
      loadSessions: async (schoolId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const sessions = await SchoolService.getSessions();
          // Filter by school if schoolId is provided
          const filteredSessions = schoolId 
            ? sessions.filter(session => 
                typeof session.school === 'string' 
                  ? session.school === schoolId 
                  : session.school._id === schoolId
              )
            : sessions;
          set({ sessions: filteredSessions, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load sessions';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      createSession: async (data: CreateSessionData) => {
        set({ isLoading: true, error: null });
        try {
          const newSession = await SchoolService.createSession(data);
          const { sessions } = get();
          set({ 
            sessions: [...sessions, newSession], 
            isLoading: false 
          });
          toast.success('Session created successfully!');
          return newSession;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateSession: async (data: UpdateSessionData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedSession = await SchoolService.updateSession(data);
          const { sessions } = get();
          set({ 
            sessions: sessions.map(session => 
              session._id === data._id ? updatedSession : session
            ), 
            isLoading: false 
          });
          toast.success('Session updated successfully!');
          return updatedSession;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update session';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteSession: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await SchoolService.deleteSession(id);
          const { sessions } = get();
          set({ 
            sessions: sessions.filter(session => session._id !== id), 
            isLoading: false 
          });
          toast.success('Session deleted successfully!');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete session';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Term Actions
      loadTerms: async (sessionId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const terms = await SchoolService.getTerms();
          // Filter by session if sessionId is provided
          const filteredTerms = sessionId 
            ? terms.filter(term => 
                typeof term.session === 'string' 
                  ? term.session === sessionId 
                  : term.session._id === sessionId
              )
            : terms;
          set({ terms: filteredTerms, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load terms';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      createTerm: async (data: CreateTermData) => {
        set({ isLoading: true, error: null });
        try {
          const newTerm = await SchoolService.createTerm(data);
          const { terms } = get();
          set({ 
            terms: [...terms, newTerm], 
            isLoading: false 
          });
          toast.success('Term created successfully!');
          return newTerm;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create term';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateTerm: async (data: UpdateTermData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTerm = await SchoolService.updateTerm(data);
          const { terms } = get();
          set({ 
            terms: terms.map(term => 
              term._id === data._id ? updatedTerm : term
            ), 
            isLoading: false 
          });
          toast.success('Term updated successfully!');
          return updatedTerm;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update term';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteTerm: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await SchoolService.deleteTerm(id);
          const { terms } = get();
          set({ 
            terms: terms.filter(term => term._id !== id), 
            isLoading: false 
          });
          toast.success('Term deleted successfully!');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete term';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Class Arm Actions
      loadClassArms: async (schoolId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const classArms = await SchoolService.getClassArms();
          // Filter by school if schoolId is provided
          const filteredClassArms = schoolId 
            ? classArms.filter(classArm => 
                typeof classArm.school === 'string' 
                  ? classArm.school === schoolId 
                  : classArm.school._id === schoolId
              )
            : classArms;
          set({ classArms: filteredClassArms, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load class arms';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      createClassArm: async (data: CreateClassArmData) => {
        set({ isLoading: true, error: null });
        try {
          const newClassArm = await SchoolService.createClassArm(data);
          const { classArms } = get();
          set({ 
            classArms: [...classArms, newClassArm], 
            isLoading: false 
          });
          toast.success('Class arm created successfully!');
          return newClassArm;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create class arm';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateClassArm: async (data: UpdateClassArmData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedClassArm = await SchoolService.updateClassArm(data);
          const { classArms } = get();
          set({ 
            classArms: classArms.map(classArm => 
              classArm._id === data._id ? updatedClassArm : classArm
            ), 
            isLoading: false 
          });
          toast.success('Class arm updated successfully!');
          return updatedClassArm;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update class arm';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteClassArm: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await SchoolService.deleteClassArm(id);
          const { classArms } = get();
          set({ 
            classArms: classArms.filter(classArm => classArm._id !== id), 
            isLoading: false 
          });
          toast.success('Class arm deleted successfully!');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete class arm';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Selection Actions
      setSelectedSchool: (school: School | null) => {
        set({ selectedSchool: school });
        // Clear dependent selections when school changes
        if (school) {
          get().loadSessions(school._id);
          get().loadClassArms(school._id);
        }
        set({ selectedSession: null, selectedTerm: null });
      },

      setSelectedSession: (session: Session | null) => {
        set({ selectedSession: session });
        // Load terms for the selected session
        if (session) {
          get().loadTerms(session._id);
        }
        set({ selectedTerm: null });
      },

      setSelectedTerm: (term: Term | null) => {
        set({ selectedTerm: term });
      },

      // Role-based loading method
      loadDataByUserRole: async (userRoles: string[]) => {
        const promises: Promise<void>[] = [];

        // Always load sessions, terms, and class arms for all authenticated users
        promises.push(get().loadSessions());
        promises.push(get().loadTerms());
        promises.push(get().loadClassArms());

        // Role-specific data loading
        if (userRoles.some(role => ['Admin', 'Proprietor'].includes(role))) {
          // Full admin access - load all data
          promises.push(get().loadGroupSchools());
          promises.push(get().loadSchools());
        } else if (userRoles.includes('ICT_administrator')) {
          // ICT administrators should only see their assigned schools
          // Don't load group schools or all schools - they'll use their own endpoints
          console.log('ICT Administrator detected - skipping full school/group school loading');
        } else if (userRoles.some(role => ['Principal', 'Bursar', 'Teacher'].includes(role))) {
          // School-level users - only load schools (they should see their school)
          promises.push(get().loadSchools());
        }

        // Execute all promises
        try {
          await Promise.allSettled(promises);
        } catch (error) {
          console.error('Error in role-based data loading:', error);
        }
      },

      // Utility Actions
      clearError: () => {
        set({ error: null });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'school-management-store',
      partialize: (state) => ({
        selectedSchool: state.selectedSchool,
        selectedSession: state.selectedSession,
        selectedTerm: state.selectedTerm,
      }),
    }
  )
);

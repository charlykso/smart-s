import type { User } from '../types';

/**
 * School-based access control utilities
 * Ensures users can only access data from their assigned school
 */

export interface SchoolAccessResult {
  canAccess: boolean;
  reason?: string;
}

/**
 * Check if user can access data from a specific school
 */
export const canAccessSchool = (user: User | null, targetSchoolId?: string): SchoolAccessResult => {
  if (!user) {
    return { canAccess: false, reason: 'User not authenticated' };
  }

  // General Admin (not assigned to a school) can access all schools
  if (user.roles?.includes('Admin') && !user.school) {
    return { canAccess: true };
  }

  // All other users (including school-assigned Admins) must have a school
  if (!user.school) {
    return { canAccess: false, reason: 'User must be assigned to a school' };
  }

  // If no target school specified, user can access their own school
  if (!targetSchoolId) {
    return { canAccess: true };
  }

  // Check if user's school matches target school
  const userSchoolId = typeof user.school === 'object' ? user.school._id : user.school;
  if (userSchoolId === targetSchoolId) {
    return { canAccess: true };
  }

  return { canAccess: false, reason: 'Access denied - school mismatch' };
};

/**
 * Check if user can manage users (create, edit, delete)
 */
export const canManageUsers = (user: User | null): boolean => {
  if (!user) return false;
  
  return user.roles?.some(role => 
    ['Admin', 'ICT_administrator', 'Proprietor', 'Principal'].includes(role)
  ) || false;
};

/**
 * Check if user can manage students
 */
export const canManageStudents = (user: User | null): boolean => {
  if (!user) return false;
  
  return user.roles?.some(role => 
    ['Admin', 'ICT_administrator', 'Proprietor', 'Principal'].includes(role)
  ) || false;
};

/**
 * Check if user can manage fees
 */
export const canManageFees = (user: User | null): boolean => {
  if (!user) return false;
  
  return user.roles?.some(role => 
    ['Admin', 'Bursar', 'Principal'].includes(role)
  ) || false;
};

/**
 * Check if user can view payments
 */
export const canViewPayments = (user: User | null): boolean => {
  if (!user) return false;
  
  return user.roles?.some(role => 
    ['Admin', 'Bursar', 'Principal', 'ICT_administrator'].includes(role)
  ) || false;
};

/**
 * Check if user can view audit data
 */
export const canViewAuditData = (user: User | null): boolean => {
  if (!user) return false;
  
  return user.roles?.some(role => 
    ['Admin', 'Auditor', 'Principal', 'Bursar'].includes(role)
  ) || false;
};

/**
 * Check if user is a general admin (can access all schools)
 */
export const isGeneralAdmin = (user: User | null): boolean => {
  if (!user) return false;
  
  return user.roles?.includes('Admin') && !user.school;
};

/**
 * Check if user is school-specific (assigned to a school)
 */
export const isSchoolSpecific = (user: User | null): boolean => {
  if (!user) return false;
  
  return !!user.school;
};

/**
 * Get user's school ID
 */
export const getUserSchoolId = (user: User | null): string | null => {
  if (!user || !user.school) return null;
  
  return typeof user.school === 'object' ? user.school._id : user.school;
};

/**
 * Get user's school name
 */
export const getUserSchoolName = (user: User | null): string | null => {
  if (!user || !user.school) return null;
  
  if (typeof user.school === 'object') {
    return user.school.name || 'Unknown School';
  }
  
  return 'Unknown School';
};

/**
 * Filter data based on user's school access
 */
export const filterByUserSchool = <T extends { school?: any }>(
  data: T[], 
  user: User | null
): T[] => {
  if (!user) return [];
  
  // General Admin can see all data
  if (isGeneralAdmin(user)) {
    return data;
  }
  
  const userSchoolId = getUserSchoolId(user);
  if (!userSchoolId) return [];
  
  return data.filter(item => {
    if (!item.school) return false;
    
    const itemSchoolId = typeof item.school === 'object' ? item.school._id : item.school;
    return itemSchoolId === userSchoolId;
  });
};

/**
 * Check if user should see school filter in UI
 */
export const shouldShowSchoolFilter = (user: User | null): boolean => {
  // Only general admins should see school filter
  return isGeneralAdmin(user);
};

/**
 * Get error message for school access denial
 */
export const getSchoolAccessDeniedMessage = (user: User | null): string => {
  if (!user) {
    return 'Please log in to access this resource.';
  }
  
  if (!user.school) {
    return 'Your account must be assigned to a school to access this resource.';
  }
  
  return 'You can only access data from your assigned school.';
};

import { formatDistanceToNow } from 'date-fns';

/**
 * Utility function to safely create dates from various inputs
 * @param dateValue - The value to convert to a Date
 * @returns A valid Date object, or current date if input is invalid
 */
export const createSafeDate = (dateValue: unknown): Date => {
  if (!dateValue) return new Date();
  
  const date = new Date(dateValue as string | number | Date);
  return isNaN(date.getTime()) ? new Date() : date;
};

/**
 * Utility function to safely format timestamps
 * @param timestamp - The Date object to format
 * @returns A formatted time string or fallback message
 */
export const formatTimestamp = (timestamp: Date): string => {
  if (!timestamp || isNaN(timestamp.getTime())) {
    return 'Unknown time';
  }
  
  try {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Unknown time';
  }
};

/**
 * Checks if a date is valid
 * @param date - The Date object to check
 * @returns true if the date is valid, false otherwise
 */
export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

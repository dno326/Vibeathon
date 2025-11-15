import { User } from '../types/user';

/**
 * Get the full name of a user
 */
export const getFullName = (user: User | null): string => {
  if (!user) return '';
  return `${user.first_name} ${user.last_name}`.trim();
};

/**
 * Get the display name (first name only, or full name if preferred)
 */
export const getDisplayName = (user: User | null, useFullName: boolean = false): string => {
  if (!user) return '';
  return useFullName ? getFullName(user) : user.first_name;
};


import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Re-export formatting utilities for backward compatibility
export { formatDate, formatDateTime, formatRelativeTime, formatFileSize, truncate } from './format';

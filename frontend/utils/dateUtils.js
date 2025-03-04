import {
  format,
  formatDistanceToNow,
  isValid,
  parseISO,
  differenceInDays,
  isSameDay,
} from 'date-fns';

/**
 * Format a date to a standard format
 */
export const formatDate = (date, pattern = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, pattern) : '';
};

/**
 * Format time to 24-hour format
 */
export const formatTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, 'HH:mm') : '';
};

/**
 * Format full date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, 'MMM dd, yyyy HH:mm') : '';
};

/**
 * Format a date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return '';

  if (isSameDay(start, end)) {
    return `${format(start, 'MMM dd, yyyy')} ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  }

  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};

/**
 * Get relative time from now
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : '';
};

/**
 * Format duration in days
 */
export const formatDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return '';

  const days = differenceInDays(end, start);
  if (days === 0) return '1 day';
  return `${days + 1} days`;
};

/**
 * Format class schedule time
 */
export const formatScheduleTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';

  const today = new Date();
  if (isSameDay(dateObj, today)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }

  return formatDateTime(dateObj);
};

/**
 * Check if a date range is active (current date is within range)
 */
export const isDateRangeActive = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const now = new Date();

  if (!isValid(start) || !isValid(end)) return false;

  return now >= start && now <= end;
};
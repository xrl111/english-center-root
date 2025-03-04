import { isAxiosError } from 'axios';

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

export const parseError = (error) => {
  if (isAxiosError(error)) {
    const statusCode = error.response?.status || 500;
    const message = 
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const details = error.response?.data?.details || null;

    return new AppError(message, statusCode, details);
  }

  if (error instanceof AppError) {
    return error;
  }

  return new AppError(
    error.message || 'An unexpected error occurred',
    500
  );
};

export const getErrorMessage = (error) => {
  const parsedError = parseError(error);

  switch (parsedError.statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You are not authenticated. Please log in.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This operation could not be completed due to a conflict.';
    case 422:
      return 'The provided data is invalid.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    default:
      return parsedError.message || 'An unexpected error occurred.';
  }
};

export const handleFormError = (error, formik) => {
  const parsedError = parseError(error);

  if (parsedError.details && typeof parsedError.details === 'object') {
    // Handle validation errors
    Object.keys(parsedError.details).forEach((field) => {
      formik.setFieldError(field, parsedError.details[field]);
    });
  }

  return getErrorMessage(parsedError);
};

export const isNetworkError = (error) => {
  return !error.response && !error.status && error.message === 'Network Error';
};

export const isValidationError = (error) => {
  const parsedError = parseError(error);
  return parsedError.statusCode === 422 && parsedError.details;
};

export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return 'Invalid input';
  }

  return Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join('\n');
};

export const handleApiError = (error, showNotification) => {
  const message = getErrorMessage(error);
  
  if (isNetworkError(error)) {
    showNotification({
      message: 'Unable to connect to the server. Please check your internet connection.',
      severity: 'error',
    });
    return;
  }

  if (isValidationError(error)) {
    showNotification({
      message: formatValidationErrors(error.details),
      severity: 'error',
    });
    return;
  }

  showNotification({
    message,
    severity: 'error',
  });
};
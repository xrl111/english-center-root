import { useState, useCallback } from 'react';
import useNotification from './useNotification';

const useMutation = (mutationFn, {
  onSuccess,
  onError,
  onSettled,
  successMessage,
  errorMessage,
} = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  const mutate = useCallback(async (...args) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await mutationFn(...args);

      if (successMessage) {
        showSuccess(typeof successMessage === 'function' 
          ? successMessage(result)
          : successMessage
        );
      }

      onSuccess?.(result, ...args);
      return result;
    } catch (error) {
      setError(error);

      const message = typeof errorMessage === 'function'
        ? errorMessage(error)
        : errorMessage || error.message;

      showError(message);
      onError?.(error, ...args);
      throw error;
    } finally {
      setIsLoading(false);
      onSettled?.(...args);
    }
  }, [mutationFn, onSuccess, onError, onSettled, successMessage, errorMessage, showSuccess, showError]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    mutateAsync: mutate,
    isLoading,
    error,
    reset,
  };
};

export default useMutation;

// Example usage:
/*
const updateCourse = useMutation(
  (courseId, data) => api.put(`/api/courses/${courseId}`, data),
  {
    successMessage: 'Course updated successfully',
    errorMessage: 'Failed to update course',
    onSuccess: () => {
      // Refetch courses or update cache
      queryClient.invalidateQueries('courses');
    },
  }
);

// In component:
const handleSubmit = async (data) => {
  try {
    await updateCourse.mutate(courseId, data);
    // Handle success
  } catch (error) {
    // Error already handled by hook
  }
};
*/
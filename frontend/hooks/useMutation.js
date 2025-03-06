import { useMutation as useReactQuery } from '@tanstack/react-query';
import useNotification from './useNotification';

const useMutation = (mutationFn, {
  onSuccess,
  onError,
  onSettled,
  successMessage,
  errorMessage,
  ...options
} = {}) => {
  const { showSuccess, showError } = useNotification();

  return useReactQuery(
    mutationFn,
    {
      ...options,
      onSuccess: (data, variables, context) => {
        if (successMessage) {
          showSuccess(
            typeof successMessage === 'function'
              ? successMessage(data)
              : successMessage
          );
        }
        onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        const message = typeof errorMessage === 'function'
          ? errorMessage(error)
          : errorMessage || error.message;
        
        showError(message);
        onError?.(error, variables, context);
      },
      onSettled,
    }
  );
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
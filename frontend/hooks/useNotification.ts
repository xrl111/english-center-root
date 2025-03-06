import { useSnackbar, VariantType } from 'notistack';

interface NotificationUtils {
  showNotification: (message: string, variant?: VariantType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const useNotification = (): NotificationUtils => {
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, { variant });
  };

  const showSuccess = (message: string) => {
    showNotification(message, 'success');
  };

  const showError = (message: string) => {
    showNotification(message, 'error');
  };

  return {
    showNotification,
    showSuccess,
    showError,
  };
};

export default useNotification;
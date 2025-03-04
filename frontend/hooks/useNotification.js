import { useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const useNotification = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [autoHideDuration, setAutoHideDuration] = useState(6000);

  const showNotification = useCallback((
    message,
    severity = 'success',
    duration = 6000
  ) => {
    setMessage(message);
    setSeverity(severity);
    setAutoHideDuration(duration);
    setOpen(true);
  }, []);

  const hideNotification = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }, []);

  const NotificationComponent = useCallback(() => (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        elevation={6}
        variant="filled"
        onClose={hideNotification}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  ), [open, autoHideDuration, message, severity]);

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
    // Convenience methods
    showSuccess: useCallback((message) => 
      showNotification(message, 'success'), [showNotification]),
    showError: useCallback((message) => 
      showNotification(message, 'error'), [showNotification]),
    showWarning: useCallback((message) => 
      showNotification(message, 'warning'), [showNotification]),
    showInfo: useCallback((message) => 
      showNotification(message, 'info'), [showNotification]),
  };
};

export default useNotification;
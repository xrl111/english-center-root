import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const severityIcons = {
  error: <ErrorIcon color="error" fontSize="large" />,
  warning: <WarningIcon color="warning" fontSize="large" />,
  info: <InfoIcon color="info" fontSize="large" />,
};

const severityColors = {
  error: 'error',
  warning: 'warning',
  info: 'primary',
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  severity = 'warning',
  additionalContent,
  maxWidth = 'xs',
}) => {
  const handleCancel = (event) => {
    if (!isLoading) {
      onCancel?.(event);
    }
  };

  const handleConfirm = async (event) => {
    if (!isLoading && onConfirm) {
      await onConfirm(event);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        elevation: 3,
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {severityIcons[severity]}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity={severity} sx={{ mb: 2 }}>
          <DialogContentText>{message}</DialogContentText>
        </Alert>
        {additionalContent}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleCancel}
          color="inherit"
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <LoadingButton
          onClick={handleConfirm}
          color={severityColors[severity]}
          variant="contained"
          loading={isLoading}
        >
          {confirmLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
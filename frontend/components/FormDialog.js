import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const FormDialog = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  fullScreen = false,
  hideActions = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onSubmit,
  isSubmitting = false,
  preventCloseOnSubmit = false,
}) => {
  const theme = useTheme();
  const fullScreenOnMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = (event, reason) => {
    if (isSubmitting && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
      return;
    }
    onClose?.(event, reason);
  };

  const handleSubmit = async (event) => {
    if (onSubmit) {
      await onSubmit(event);
      if (!preventCloseOnSubmit) {
        onClose?.();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen || fullScreenOnMobile}
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={isSubmitting}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {typeof children === 'function' ? children({ onClose: handleClose }) : children}
      </DialogContent>

      {!hideActions && (
        <DialogActions>
          <Button
            onClick={handleClose}
            color="inherit"
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          {onSubmit && (
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : submitLabel}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default FormDialog;
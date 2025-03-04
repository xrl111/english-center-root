import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingOverlay = ({ 
  message = 'Loading...',
  fullScreen = false, 
  minHeight = '400px',
}) => {
  const styles = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  } : {
    position: 'relative',
    minHeight,
  };

  return (
    <Box
      sx={{
        ...styles,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          color: 'text.secondary',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingOverlay;
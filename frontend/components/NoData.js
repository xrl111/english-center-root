import { Box, Typography, Paper } from '@mui/material';
import { SentimentDissatisfied as NoDataIcon } from '@mui/icons-material';

const NoData = ({ 
  message = 'No data found',
  icon: CustomIcon,
  paperProps = {},
  minHeight = '400px',
}) => {
  const Icon = CustomIcon || NoDataIcon;

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        bgcolor: 'background.default',
        p: 3,
        ...paperProps.sx,
      }}
      {...paperProps}
    >
      <Icon
        sx={{
          fontSize: 64,
          color: 'text.disabled',
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        color="text.secondary"
        align="center"
        gutterBottom
      >
        {message}
      </Typography>
    </Paper>
  );
};

export default NoData;
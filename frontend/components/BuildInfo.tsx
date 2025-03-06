import React from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface BuildInfo {
  version: string;
  buildTime: string;
  gitCommit: string;
  gitBranch: string;
  nodeVersion: string;
  buildNumber: string;
  environment: string;
}

export const BuildInfo: React.FC = () => {
  const theme = useTheme();
  const [buildInfo, setBuildInfo] = React.useState<BuildInfo | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    fetch('/build-info.json')
      .then((res) => res.json())
      .then((data) => setBuildInfo(data))
      .catch((error) => console.error('Error loading build info:', error));
  }, []);

  if (!buildInfo) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const buildDetails = [
    { label: 'Version', value: buildInfo.version },
    { label: 'Environment', value: buildInfo.environment },
    { label: 'Build Time', value: formatDate(buildInfo.buildTime) },
    { label: 'Build Number', value: buildInfo.buildNumber },
    { label: 'Git Branch', value: buildInfo.gitBranch },
    { label: 'Git Commit', value: buildInfo.gitCommit.slice(0, 7) },
    { label: 'Node Version', value: buildInfo.nodeVersion },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        zIndex: theme.zIndex.tooltip,
      }}
    >
      <Tooltip
        open={isVisible}
        onClose={() => setIsVisible(false)}
        title={
          <Box sx={{ p: 1 }}>
            {buildDetails.map(({ label, value }) => (
              <Typography
                key={label}
                variant="caption"
                display="block"
                sx={{ mb: 0.5 }}
              >
                <strong>{label}:</strong> {value}
              </Typography>
            ))}
          </Box>
        }
      >
        <IconButton
          size="small"
          onClick={() => setIsVisible(!isVisible)}
          sx={{
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
            '&:hover': {
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default BuildInfo;
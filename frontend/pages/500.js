import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ContactSupport as ContactSupportIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '../components/Layout/MainLayout';
import SEO from '../components/SEO';

export default function Custom500() {
  const router = useRouter();

  const handleRefresh = () => {
    router.reload();
  };

  const actions = [
    {
      title: 'Try Again',
      description: 'Refresh the page',
      icon: <RefreshIcon />,
      action: handleRefresh,
      primary: true,
    },
    {
      title: 'Go to Homepage',
      description: 'Return to main page',
      icon: <HomeIcon />,
      href: '/',
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: <ContactSupportIcon />,
      href: '/contact',
    },
  ];

  return (
    <>
      <SEO
        title="Server Error"
        description="An unexpected error occurred. Please try again later."
        noIndex
      />

      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'error.light',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', sm: '8rem' },
                fontWeight: 700,
                color: 'error.main',
                mb: 2,
              }}
            >
              500
            </Typography>

            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              Server Error
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
              }}
            >
              We apologize, but something went wrong on our end.
              Our team has been notified and is working to fix the issue.
              Please try again later or use one of the following options:
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.primary ? 'contained' : 'outlined'}
                  color={action.primary ? 'error' : 'inherit'}
                  startIcon={action.icon}
                  component={action.href ? Link : 'button'}
                  href={action.href}
                  onClick={action.action}
                  sx={{
                    px: 3,
                    py: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    minWidth: 160,
                  }}
                >
                  <Typography variant="subtitle1" component="span">
                    {action.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={action.primary ? 'inherit' : 'text.secondary'}
                  >
                    {action.description}
                  </Typography>
                </Button>
              ))}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Error ID: {Math.random().toString(36).substr(2, 9)}
              <br />
              If this issue persists, please contact our support team with the Error ID.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </>
  );
}

// Use MainLayout for this page
Custom500.getLayout = function getLayout(page) {
  return <MainLayout>{page}</MainLayout>;
};
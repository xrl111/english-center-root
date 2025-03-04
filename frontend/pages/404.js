import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '../components/Layout/MainLayout';
import SEO from '../components/SEO';

export default function Custom404() {
  const router = useRouter();

  const suggestions = [
    {
      title: 'Go to Homepage',
      description: 'Return to our main page',
      icon: <HomeIcon />,
      href: '/',
    },
    {
      title: 'Browse Courses',
      description: 'Explore our available courses',
      icon: <SearchIcon />,
      href: '/courses',
    },
    {
      title: 'Go Back',
      description: 'Return to previous page',
      icon: <ArrowBackIcon />,
      action: () => router.back(),
    },
  ];

  return (
    <>
      <SEO 
        title="Page Not Found" 
        description="The page you're looking for doesn't exist."
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
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', sm: '8rem' },
                fontWeight: 700,
                color: 'primary.main',
                mb: 2,
              }}
            >
              404
            </Typography>

            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              Page Not Found
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 500,
                mx: 'auto',
                mb: 4,
              }}
            >
              The page you're looking for doesn't exist or has been moved.
              Please check the URL or try one of the following options:
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? 'contained' : 'outlined'}
                  startIcon={suggestion.icon}
                  component={suggestion.href ? Link : 'button'}
                  href={suggestion.href}
                  onClick={suggestion.action}
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
                    {suggestion.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={index === 0 ? 'inherit' : 'text.secondary'}
                  >
                    {suggestion.description}
                  </Typography>
                </Button>
              ))}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              If you believe this is a mistake, please{' '}
              <Link
                href="/contact"
                style={{
                  color: 'inherit',
                  textDecoration: 'underline',
                }}
              >
                contact our support team
              </Link>
              .
            </Typography>
          </Paper>
        </Box>
      </Container>
    </>
  );
}

// Use MainLayout for this page
Custom404.getLayout = function getLayout(page) {
  return <MainLayout>{page}</MainLayout>;
};
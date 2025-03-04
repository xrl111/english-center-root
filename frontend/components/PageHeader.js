import { Box, Typography, Breadcrumbs, Container } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

const PageHeader = ({ title, description }) => {
  const router = useRouter();
  const pathSegments = router.asPath.split('/').filter(Boolean);

  return (
    <Box
      sx={{
        py: 4,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        {pathSegments.length > 0 && (
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link href="/" passHref>
              <Typography
                component="a"
                color="inherit"
                sx={{
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Home
              </Typography>
            </Link>
            {pathSegments.map((segment, index) => {
              const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
              const isLast = index === pathSegments.length - 1;

              return isLast ? (
                <Typography key={path} color="text.primary">
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </Typography>
              ) : (
                <Link key={path} href={path} passHref>
                  <Typography
                    component="a"
                    color="inherit"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                  </Typography>
                </Link>
              );
            })}
          </Breadcrumbs>
        )}

        <Typography variant="h3" component="h1" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="subtitle1" color="text.secondary">
            {description}
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default PageHeader;
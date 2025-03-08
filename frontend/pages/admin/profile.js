import { Box, Container, Typography, Paper } from '@mui/material';
import PageHeader from '../../components/PageHeader';
import SEO from '../../components/SEO';

const ProfilePage = () => {
  return (
    <>
      <SEO title="Profile" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <PageHeader title="Profile" />
        <Paper sx={{ p: 4, mt: 4 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Profile Page
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This page is under construction.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ProfilePage;

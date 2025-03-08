import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Container, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../utils/api/auth';
import SEO from '../../components/SEO';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { returnUrl } = router.query;

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await authApi.login(credentials);
      if (!response?.accessToken || !response?.refreshToken) {
        throw new Error('Invalid response from server');
      }
      await login(response);
      // Redirect to returnUrl if provided, otherwise let the auth hook handle it
      if (returnUrl && typeof returnUrl === 'string') {
        router.push(returnUrl);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Login" />
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography component="h1" variant="h5">
              Sign In
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link href="/auth/register" passHref>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{ textDecoration: 'none', color: 'primary.main' }}
                  >
                    Don't have an account? Sign Up
                  </Typography>
                </Link>
              </Box>
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Link href="/auth/forgot-password" passHref>
                  <Typography
                    component="a"
                    variant="body2"
                    sx={{ textDecoration: 'none', color: 'primary.main' }}
                  >
                    Forgot password?
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
}

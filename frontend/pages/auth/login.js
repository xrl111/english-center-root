import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withPublicOnly } from '../../components/withAuth';
import Link from 'next/link';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import SEO from '../../components/SEO';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be at least 6 characters')
    .required('Password is required'),
});

function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await login(values);
        const returnUrl = router.query.returnUrl || '/';
        router.push(returnUrl);
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
      }
    },
  });

  // Disable layout for auth pages
  Login.useLayout = false;

  return (
    <>
      <SEO title="Login" />
      <Container maxWidth="xs">
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography component="h1" variant="h5" gutterBottom>
              Log In
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                name="email"
                label="Email Address"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />

              <TextField
                fullWidth
                margin="normal"
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />

              <LoadingButton
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                loading={formik.isSubmitting}
              >
                Log In
              </LoadingButton>

              <Box sx={{ textAlign: 'center' }}>
                <Link href="/auth/register" passHref>
                  <Button component="a" color="primary">
                    Don't have an account? Sign up
                  </Button>
                </Link>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </>
  );
}

export default withPublicOnly(Login);
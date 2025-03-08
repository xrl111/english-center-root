import Head from 'next/head';
import AppLayout from '../components/Layout/AppLayout';
import PropTypes from 'prop-types';
import { AuthProvider } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';

// Import global styles
import '../styles/globals.css';
import '../styles/fullcalendar.css';

// Create a client
const queryClient = new QueryClient();

export default function MyApp(props) {
  const { Component, pageProps } = props;
  // Handle per-page layouts
  const getLayout = Component.getLayout || (page => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Information Management System</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AuthProvider>
              <AppLayout>{getLayout(<Component {...pageProps} />)}</AppLayout>
            </AuthProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

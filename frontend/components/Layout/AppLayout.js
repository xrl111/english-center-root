import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import createEmotionCache from '../../utils/createEmotionCache';
import theme from '../../styles/theme';
import ErrorBoundary from '../ErrorBoundary';
import { AuthProvider } from '../../contexts/AuthContext';

// Client-side cache for emotion, shared for the whole session
const clientSideEmotionCache = createEmotionCache();

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppLayout = ({
  children,
  emotionCache = clientSideEmotionCache,
  pageProps,
}) => {
  const getLayout = children?.type?.getLayout || ((page) => page);

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <CssBaseline />
              <ErrorBoundary>
                {getLayout(children, pageProps)}
              </ErrorBoundary>
              {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
            </AuthProvider>
          </QueryClientProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default AppLayout;
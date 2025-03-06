import Head from 'next/head';
import AppLayout from '../components/Layout/AppLayout';
import PropTypes from 'prop-types';

// Import global styles
import '../styles/globals.css';

export default function MyApp(props) {
  const { Component, pageProps } = props;
  // Handle per-page layouts
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Information Management System</title>
        {/* Add FullCalendar CSS from CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@5.11.3/main.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@5.11.3/main.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@5.11.3/main.min.css"
        />
      </Head>
      <AppLayout pageProps={pageProps}>
        {getLayout(<Component {...pageProps} />)}
      </AppLayout>
    </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
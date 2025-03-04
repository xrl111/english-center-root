import Head from 'next/head';
import AppLayout from '../components/Layout/AppLayout';
import PropTypes from 'prop-types';

export default function MyApp(props) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Information Management System</title>
      </Head>
      <AppLayout pageProps={pageProps}>
        <Component {...pageProps} />
      </AppLayout>
    </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
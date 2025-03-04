import Head from 'next/head';
import config from '../config';

const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  noIndex = false,
}) => {
  const siteTitle = title
    ? config.seo.titleTemplate.replace('%s', title)
    : config.seo.siteName;

  const metaDescription = description || config.seo.defaultDescription;
  const canonical = ogUrl || config.api.baseUrl;
  const ogImg = ogImage || `${config.api.baseUrl}/images/og-image.jpg`;

  return (
    <Head>
      {/* Basic meta tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical link */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImg} />
      <meta property="og:site_name" content={config.seo.siteName} />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImg} />

      {/* No index meta tag */}
      {noIndex && (
        <meta name="robots" content="noindex, nofollow" />
      )}

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content={config.theme.primary.main} />
    </Head>
  );
};

export default SEO;
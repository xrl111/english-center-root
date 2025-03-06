import Head from 'next/head';
import { SEOProps } from './types';

export default function SEO({
  title,
  description,
  keywords = [],
  ogImage,
  ogUrl,
  noIndex = false,
}: SEOProps) {
  const titleContent = `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME}`;

  return (
    <Head>
      <title>{titleContent}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={titleContent} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={titleContent} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* No index if specified */}
      {noIndex && <meta name="robots" content="noindex" />}
    </Head>
  );
}
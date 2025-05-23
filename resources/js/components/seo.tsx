import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({
  title,
  description = 'Sky Nature Park - Your perfect getaway in nature',
  image = 'https://skynaturepark.com/images/og-image.jpg',
  url = 'https://skynaturepark.com',
  type = 'website',
}: SEOProps) => {
  const fullTitle = `${title} | Sky Nature Park`;

  return (
    <HelmetProvider>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="Sky Nature Park" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </Helmet>
    </HelmetProvider>
  );
}; 
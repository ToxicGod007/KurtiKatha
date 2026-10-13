import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'KurtiKatha (কুর্টিকথা) — Handcrafted Ethnic Kurtis & Nighties',
  description = "Shop authentic handcrafted Indian kurtis, pure cotton nighties, and festive kurti sets. Handpicked breathable fabrics from Kolkata with Pan-India delivery and COD.",
  keywords = 'kurtis, cotton nighties, indian ethnic wear, kolkata kurtis, women fashion india, kurti sets',
  image = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200',
  url,
  type = 'website',
  jsonLd = null,
}) {
  const siteUrl = 'https://kurtikatha.com';
  const fullUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url}`) : siteUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="KurtiKatha (কুর্টিকথা)" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

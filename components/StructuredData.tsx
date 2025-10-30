import Script from 'next/script'

export default function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EdgeBook',
    url: 'https://edgebook.ai',
    logo: 'https://edgebook.ai/logo.png',
    description: 'The premier sports prediction platform where you can showcase your picks, track performance, build your reputation, and earn from your insights.',
    sameAs: [
      'https://twitter.com/EdgeBook',
      'https://facebook.com/EdgeBook',
      'https://instagram.com/EdgeBook',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@edgebook.ai',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EdgeBook',
    url: 'https://edgebook.ai',
    description: 'Sports prediction platform where you can showcase your picks, track performance, and earn from your insights.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://edgebook.ai/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'EdgeBook',
    url: 'https://edgebook.ai',
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  }

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <Script
        id="web-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
    </>
  )
}

import './globals.css';

export const metadata = {
  title: 'DocsVault — The Smarter Way to Share Pitch Decks & Documents',
  description: 'Boost your conversion rates with DocsVault. The intelligent DocSend alternative for secure document sharing and real-time investor analytics. Know exactly who views your pitch deck and when.',
  keywords: 'pitch deck, document sharing, DocSend alternative, Papermark, secure document tracking, investor analytics, document security, pitch deck conversion',
  openGraph: {
    title: 'DocsVault — The Smarter Way to Share Pitch Decks',
    description: 'Secure document sharing with real-time analytics. The modern alternative to DocSend and Papermark.',
    url: 'https://docvault.zomato.com',
    siteName: 'DocsVault',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'DocsVault',
  'operatingSystem': 'Web',
  'applicationCategory': 'BusinessApplication',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'USD',
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.9',
    'ratingCount': '124',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

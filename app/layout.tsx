import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://liebsmitlinse.de'),
  title: 'Liebs mit Linse — Hochzeitsfotografie',
  description: 'Authentische Hochzeitsfotografie von Katharina & Jonas in Tübingen, Reutlingen, Nürtingen und Sigmaringen.',
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Liebs mit Linse — Hochzeitsfotografie',
    description: 'Echte Momente. Für immer festgehalten.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Liebs mit Linse — Echte Momente. Für immer festgehalten.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liebs mit Linse — Hochzeitsfotografie',
    description: 'Echte Momente. Für immer festgehalten.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Liebs mit Linse — Hochzeitsfotografie',
  description: 'Authentische Hochzeitsfotografie von Katharina & Jonas in Reutlingen, Tübingen und Sigmaringen.',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

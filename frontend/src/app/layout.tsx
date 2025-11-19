import { Metadata } from 'next';
import { Play } from 'next/font/google';

import Footer from '@/components/common/Footer';
import ToastListener from '@/components/common/ToastListener';
import { Toaster } from '@/components/ui/sonner';
import AuthProvider from '@/providers/Auth';
import './globals.css';

const TITLE = 'Typrogram';
const DESCRIPTION =
  'Free typing game for programmers. You can import any GitHub repository and practice typing through real code.';
const BASE_URL = 'https://www.Typrogram.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${TITLE} | Practice Typing through Real Code`,
    template: '%s | Typrogram',
  },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: BASE_URL,
    images: [
      {
        url: '/ogp.png',
        alt: 'Typrogram',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/ogp.png',
        alt: 'Typrogram',
      },
    ],
  },
};

const play = Play({
  variable: '--font-play',
  subsets: ['latin'],
  weight: ['400'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          antialiased
          ${play.variable}
          flex min-h-screen flex-col font-sans
        `}
      >
        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>
        <Footer />
        <ToastListener />
        <Toaster />
      </body>
    </html>
  );
}

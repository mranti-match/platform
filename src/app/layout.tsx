import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Malaysian R&D Commercialisation Portal',
  description: 'Connecting innovations with real-world problems through AI-powered matching.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

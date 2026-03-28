import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Memescope Monday | The Memecoin Directory',
  description:
    'Discover and submit memecoins for Memescope Monday. Solana, Base, and BNB Chain projects — all in one place. Every Monday, we ride together.',
  openGraph: {
    title: 'Memescope Monday',
    description: 'The memecoin directory for Memescope Monday. Submit your picks, discover new gems.',
    url: 'https://memescope.monday.directory',
    siteName: 'Memescope Monday',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Memescope Monday',
    description: 'The memecoin directory for Memescope Monday. Submit your picks, discover new gems.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

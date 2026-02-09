import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://docs-theta-mocha.vercel.app'),
  title: {
    template: '%s | Dispatch Docs',
    default: 'Dispatch Docs — AI Compute Network with x402 + ERC-8004',
  },
  description:
    'Technical documentation for Dispatch — the compute layer where AI agents buy inference from idle hardware. x402 micropayments, ERC-8004 reputation, Monad + Solana.',
  keywords: [
    'Dispatch',
    'AI compute',
    'x402',
    'ERC-8004',
    'Monad',
    'Solana',
    'decentralized compute',
    'DePIN',
    'documentation',
  ],
  alternates: {
    canonical: 'https://docs-theta-mocha.vercel.app',
  },
  openGraph: {
    title: 'Dispatch Docs — AI Compute Network',
    description:
      'Technical docs for Dispatch. x402 micropayments, ERC-8004 reputation on Monad, dual-chain architecture.',
    type: 'website',
    siteName: 'Dispatch Docs',
    url: 'https://docs-theta-mocha.vercel.app',
  },
  twitter: {
    card: 'summary',
    title: 'Dispatch Docs — AI Compute Network',
    description:
      'Technical docs for Dispatch. x402 micropayments, ERC-8004 reputation on Monad, dual-chain architecture.',
    creator: '@pranit',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          theme={{
            defaultTheme: 'dark',
            forcedTheme: 'dark',
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}

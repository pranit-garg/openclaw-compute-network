import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://landing-pi-ashen-62.vercel.app"),
  title: "Dispatch — Idle Compute for AI Agents | x402 + ERC-8004",
  description:
    "Dispatch routes AI jobs to idle phones and desktops. Workers earn USDC via x402 micropayments and build on-chain reputation through ERC-8004 on Monad. Live on Monad and Solana testnet.",
  keywords: [
    "Dispatch",
    "AI compute network",
    "x402 micropayments",
    "ERC-8004",
    "agent compute",
    "idle hardware",
    "USDC payments",
    "Monad",
    "Solana",
    "decentralized compute",
    "AI inference",
    "on-chain reputation",
    "DePIN",
    "Solana Seeker",
    "distributed computing",
  ],
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  alternates: {
    canonical: "https://landing-pi-ashen-62.vercel.app",
  },
  openGraph: {
    title: "Dispatch — Dispatch Idle Compute to AI Agents",
    description:
      "Your hardware processes AI jobs while idle. Agents pay in USDC over x402. Workers build on-chain reputation via ERC-8004. Live on Monad and Solana testnet.",
    type: "website",
    siteName: "Dispatch",
    url: "https://landing-pi-ashen-62.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dispatch — Dispatch Idle Compute to AI Agents",
    description:
      "Your hardware processes AI jobs while idle. Agents pay in USDC over x402. Workers build on-chain reputation via ERC-8004. Live on Monad and Solana testnet.",
    creator: "@pranit",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dispatch",
  alternateName: "Dispatch Compute Network",
  description:
    "The dispatch layer where AI agents buy compute from idle hardware — paid in USDC over x402, verified with ERC-8004 reputation on Monad and Solana.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  url: "https://landing-pi-ashen-62.vercel.app",
  author: {
    "@type": "Person",
    name: "Pranit Garg",
    url: "https://x.com/pranit",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Open source — testnet MVP",
  },
  keywords: "AI compute, x402, ERC-8004, Monad, Solana, DePIN, idle hardware, USDC micropayments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-grid bg-noise min-h-screen">{children}</body>
    </html>
  );
}

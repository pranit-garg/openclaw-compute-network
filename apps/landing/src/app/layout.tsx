import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://landing-pi-ashen-62.vercel.app"),
  title: "Dispatch — Decentralized Compute with x402 Micropayments",
  description:
    "Decentralized compute network with x402 stablecoin micropayments, mobile seekers, and trust-paired privacy routing. Built on Monad and Solana.",
  keywords: [
    "decentralized compute",
    "x402",
    "micropayments",
    "stablecoin",
    "Monad",
    "Solana",
    "distributed computing",
    "pay-per-job",
    "crypto compute",
    "Dispatch",
  ],
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  openGraph: {
    title: "Dispatch — Decentralized Compute with x402 Micropayments",
    description:
      "Pay-per-job compute, settled in stablecoins over HTTP. Mobile seekers, desktop workers, trust-paired privacy.",
    type: "website",
    siteName: "Dispatch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dispatch — Decentralized Compute with x402 Micropayments",
    description:
      "Pay-per-job compute, settled in stablecoins over HTTP. Mobile seekers, desktop workers, trust-paired privacy.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dispatch Compute Network",
  description:
    "Decentralized compute network with x402 stablecoin micropayments",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-grid min-h-screen">{children}</body>
    </html>
  );
}

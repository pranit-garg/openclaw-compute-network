import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dispatch.computer"),
  title: "Dispatch: Cheap AI Compute for Agents, Passive Income for Workers",
  description:
    "Dispatch is a compute service where AI agents submit jobs over HTTP and workers earn USDC from idle hardware. Ed25519 verified results. Live on Monad and Solana testnet.",
  keywords: [
    "Dispatch",
    "AI compute network",
    "agent compute",
    "x402 micropayments",
    "ERC-8004",
    "idle hardware",
    "DePIN",
    "Monad",
    "Solana",
    "decentralized compute",
    "AI inference",
    "onchain reputation",
    "Solana Seeker",
    "distributed computing",
    "BOLT token",
  ],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://www.dispatch.computer",
  },
  openGraph: {
    title: "Dispatch: Cheap AI Compute for Agents",
    description:
      "Dispatch is a compute service where AI agents submit jobs over HTTP and workers earn USDC from idle hardware. Ed25519 verified results. Live on Monad and Solana testnet.",
    type: "website",
    siteName: "Dispatch",
    url: "https://www.dispatch.computer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dispatch: Cheap AI Compute for Agents",
    description:
      "Dispatch is a compute service where AI agents submit jobs over HTTP and workers earn USDC from idle hardware. Ed25519 verified results. Live on Monad and Solana testnet.",
    creator: "@pranit",
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dispatch",
  alternateName: "Dispatch Compute Network",
  description:
    "Dispatch is a compute service where AI agents submit jobs over HTTP and workers earn USDC from idle hardware. Ed25519 verified results. Live on Monad and Solana testnet.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  url: "https://www.dispatch.computer",
  author: {
    "@type": "Person",
    name: "Pranit Garg",
    url: "https://x.com/pranit",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Open source, testnet MVP",
  },
  keywords: "AI compute, x402, ERC-8004, Monad, Solana, DePIN, idle hardware, agent compute, BOLT token",
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How it works",
  description: "Three steps from request to verified result.",
  url: "https://www.dispatch.computer/#how",
  step: [
    {
      "@type": "HowToStep",
      name: "Submit",
      text: "Agent sends one HTTP request with the job payload. Or runs `dispatch agent run` from the CLI.",
    },
    {
      "@type": "HowToStep",
      name: "Process",
      text: "Coordinator matches the best available worker by reputation score and routing policy. Worker executes on idle hardware.",
    },
    {
      "@type": "HowToStep",
      name: "Verify",
      text: "Result returned with an ed25519 signed receipt. Cryptographic proof of who computed what, when.",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What Dispatch is",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dispatch is a decentralized compute network where mobile devices and desktops run AI tasks for agents. Workers earn BOLT for completing jobs. The protocol uses ed25519 signed receipts to prove work and x402 micropayments for settlement.",
      },
    },
    {
      "@type": "Question",
      name: "How it works",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Three steps from request to verified result.",
      },
    },
    {
      "@type": "Question",
      name: "How data is stored",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Earnings history and job logs are stored locally on your device using AsyncStorage. Your ed25519 keypair is stored in the device's secure enclave via expo-secure-store. The coordinator server stores only the public key and job metadata needed to route work and verify receipts.",
      },
    },
    {
      "@type": "Question",
      name: "Current Status",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Today: Workers earn USDC for each completed job via x402 micropayments. No token required to participate.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="AwpOhyGmyBeMIhUiazfBs4NTelU2Rb-mp9h4MWtH9Y0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} bg-grid bg-noise min-h-screen`}
      >
        {children}

        {/* Google Analytics. TODO: Pranit needs to set NEXT_PUBLIC_GA_ID env var on Vercel */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('consent', 'default', {
                  analytics_storage: 'granted'
                });
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

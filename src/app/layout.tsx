import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TechTribe Blog — Learn, Build, Get Hired",
  description: "Learn digital skills, find freelance work, share progress, and stay updated with tech news. TechTribe combines learning, freelancing, and social networking for developers.",
  metadataBase: new URL("https://techtribe.online"),
  icons: {
    icon: [
      { url: "/ttlg.png", type: "image/png" },
    ],
    apple: [
      { url: "/ttlg.png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TechTribe",
    title: "TechTribe Blog — Learn, Build, Get Hired",
    description: "Learn digital skills, find freelance work, share progress, and stay updated with tech news.",
    images: [{ url: "/ttlg.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechTribe Blog",
    description: "Learn digital skills, find freelance work, share progress, and stay updated with tech news.",
    images: ["/ttlg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techtribe.online";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TechTribe",
  url: siteUrl,
  logo: `${siteUrl}/ttlg.png`,
  description:
    "Learn digital skills, find freelance work, share progress, and stay updated with tech news.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TechTribe",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/blog/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolageGrotesque.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden flex flex-col bg-background text-foreground font-sans">
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}

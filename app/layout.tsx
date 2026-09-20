import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";

import {
  absoluteSiteAsset,
  buildVerificationMetadata,
  SITE,
  withBasePath,
} from "./lib/site";
import "./globals.css";
import "./styles/shell.css";
import "./styles/observatory.css";
import "./styles/labs.css";
import "./styles/atlas.css";
import "./styles/responsive.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const verification = buildVerificationMetadata(process.env);

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  applicationName: SITE.name,
  authors: [{ name: SITE.owner.legalName }],
  creator: SITE.owner.legalName,
  publisher: SITE.owner.legalName,
  referrer: "origin-when-cross-origin",
  icons: {
    icon: [
      { url: absoluteSiteAsset("favicon.ico"), sizes: "any" },
      {
        url: absoluteSiteAsset("favicon-32x32.png"),
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: absoluteSiteAsset("favicon-16x16.png"),
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: absoluteSiteAsset("favicon.ico"),
    apple: [
      {
        url: absoluteSiteAsset("apple-touch-icon.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: withBasePath("/manifest.webmanifest"),
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  other: {
    "msapplication-config": withBasePath("/browserconfig.xml"),
    "msapplication-TileColor": "#07111f",
  },
  ...(verification ? { verification } : {}),
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#07111f" },
  ],
  width: "device-width",
  initialScale: 1,
};

const globalStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE.owner.organizationId,
      name: SITE.owner.name,
      legalName: SITE.owner.legalName,
      slogan: SITE.owner.slogan,
      description: SITE.owner.description,
      url: SITE.owner.url,
      logo: SITE.owner.logo,
      image: SITE.owner.image,
      sameAs: [SITE.owner.github],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}#website`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      image: SITE.socialImage,
      publisher: { "@id": SITE.owner.organizationId },
      inLanguage: "en-US",
    },
  ],
};

const serializedGlobalStructuredData = JSON.stringify(
  globalStructuredData,
).replace(/</g, "\\u003c");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializedGlobalStructuredData }}
        />
        {children}
      </body>
    </html>
  );
}

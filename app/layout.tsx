import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/SessionProvider";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://smart-landing-analyzer.vercel.app";

const description =
  "AI-powered landing page audits with CRO findings, scan history, shareable reports, and PDF exports.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "PageDoctor AI - AI Landing Page Conversion Audits",
    template: "%s | PageDoctor AI",
  },
  description,
  applicationName: "PageDoctor AI",
  authors: [{ name: "Lionel", url: "https://github.com/Lionel559" }],
  creator: "Lionel",
  keywords: [
    "landing page audit",
    "conversion rate optimization",
    "AI CRO",
    "website audit",
    "SaaS landing page analysis",
  ],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "PageDoctor AI - AI Landing Page Conversion Audits",
    description,
    url: "/",
    siteName: "PageDoctor AI",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "PageDoctor AI app icon",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PageDoctor AI - AI Landing Page Conversion Audits",
    description,
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}

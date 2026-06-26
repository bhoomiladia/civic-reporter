import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CIVIC Reporter — Report Civic Issues",
    template: "%s | CIVIC Reporter",
  },
  description:
    "Report and track civic issues in your community. From potholes to broken streetlights, make your neighborhood better.",
  keywords: ["civic", "reporter", "city", "issues", "community", "government"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

import { AppProviders } from "@/contexts/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

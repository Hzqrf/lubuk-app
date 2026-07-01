import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lubuk - Community Fishing Map",
  description: "Find and log your best fishing spots with Lubuk.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lubuk",
  },
};

export const viewport = {
  themeColor: "#228be6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { BottomNav } from "@/components/ui/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body className="h-screen flex flex-col m-0 p-0 overflow-hidden">
        <MantineProvider defaultColorScheme="auto">
          <div style={{ flex: 1, overflow: 'hidden', height: 'calc(100vh - 60px)' }}>
            {children}
          </div>
          <BottomNav />
        </MantineProvider>
      </body>
    </html>
  );
}

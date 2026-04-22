import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SoftphoneClientProvider from "@/components/SoftphoneClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloudPhone - Professional Cloud Phone Platform",
  description: "Make and receive calls from anywhere. Manage your team, track analytics, and provide exceptional customer service.",
};

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
        <SoftphoneClientProvider>
          {children}
        </SoftphoneClientProvider>
      </body>
    </html>
  );
}

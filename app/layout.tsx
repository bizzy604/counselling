import type { Metadata } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  display: "swap",
  fallback: ["Georgia", "serif"],
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  subsets: ["latin"],
  variable: "--font-body",
});

const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  fallback: ["Courier New", "monospace"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  description:
    "Counselling and Wellness Ecosystem for confidential, role-based support across the public service.",
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "CWE Platform",
    template: "%s | Counselling and Wellness Ecosystem",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${dmSans.variable} ${jetBrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

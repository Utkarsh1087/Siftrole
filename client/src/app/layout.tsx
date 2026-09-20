import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { TopProgressBar } from "@/components/TopProgressBar";
import { PageTransition } from "@/components/PageTransition";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Siftrole | Verified Tech Jobs & Internships for Builders",
  description: "Siftrole connects students and early-career builders with verified tech opportunities directly from trusted company career feeds.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Pochaevsk&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#fff6eb] text-[#02110c] font-sans antialiased">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <SmoothScrollProvider>
          <PageTransition>{children}</PageTransition>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

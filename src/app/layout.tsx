import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mr & Miss Treat Pagentry",
  description: "Mr and Miss Treat Nigeria is a prestigious pageant dedicated to discovering the most vibrant, talented, and outstanding young individuals across the nation, youths who are ready to rise, shine, and make their mark as stars.",
  icons: {
    icon: '/favicon.ico',
  
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        {children}
        <SpeedInsights/>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProviders } from "../providers/AppProviders";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Suspense } from "react";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Ruvéra Couture | Avant-Garde Luxury",
  description: "Experimental luxury fashion brand redefining elegance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${playfair.variable} font-sans bg-beige-bg text-stone-800 antialiased`}>
        <AppProviders>
          <Suspense fallback={<div className="h-20 bg-beige-bg animate-pulse" />}>
            <Navbar />
          </Suspense>
          <main className="min-h-screen pt-20">
            {children}
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}

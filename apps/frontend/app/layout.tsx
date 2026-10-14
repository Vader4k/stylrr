import type { Metadata } from "next";
import { Inter, Jost } from "next/font/google";
import "./globals.css";
import "google-shadcn-translator/styles.css";
import Navbar from "@/shared/ui/navbar/Navbar";
import Footer from "@/shared/ui/Footer";
import PageHeader from "@/shared/ui/PageHeader";
import Providers from "./Provider";
import BottomNav from "@/shared/ui/navbar/BottomNav";
import GoogleTranslatorInit from "@/features/language-selector/utils/GoogleTranslatorInit";
import { Toaster } from "@/components/ui/sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: {
    default: "Stylr | Modern Fashion & Accessories Store",
    template: "%s | Stylr"
  },
  description: "Stylr - Your one-stop shop for high-quality fashion, accessories, and shoes for every occasion. Discover latest trends with worldwide shipping.",
  keywords: [
    'fashion', 'clothing', 'shoes', 'accessories', 'bags', 'jewelry', 'watches',
    'sunglasses', 'hats', 'scarves', 'gloves', 'belts', 'wallets', 'keychains',
    'umbrellas', 'backpacks', 'luggage', 'travel', 'business', 'casual', 'formal',
    'party', 'wedding', 'birthday', 'anniversary', 'graduation', 'new year',
    'christmas', 'cargo', 'gowns', 'shirts', 'gym wears'
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // canonicals are set per page; a root canonical would be inherited by every route
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stylrr.vercel.app",
    siteName: "Stylr",
    title: "Stylr | Modern Fashion & Accessories",
    description: "Stylr - Premium quality fashion and accessories for all genders and occasions.",
    images: [
      {
        url: "https://res.cloudinary.com/dpwljfhgl/image/upload/v1772491120/shop-banner_jmggvz.webp",
        width: 1200,
        height: 630,
        alt: "Stylr | Fashion Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stylr | Modern Fashion & Accessories",
    description: "Your one-stop shop for high-quality fashion, accessories, and shoes.",
    creator: "@stylr",
    site: "@stylr",
    images: [
      "https://res.cloudinary.com/dpwljfhgl/image/upload/v1772491120/shop-banner_jmggvz.webp",
    ],
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://stylrr.vercel.app'),
  category: 'fashion',
  classification: 'Fashion Store',
  other: {
    'theme-color': '#000000',
    'color-scheme': 'light dark',
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({
  children,
  product
}: Readonly<{
  children: React.ReactNode;
  product: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jost.variable} antialiased`}
      >
        <Providers>
          <GoogleTranslatorInit>
            <PageHeader />
            <Navbar />
            {children}
            {product} {/* this is the parallel route for the product page */}
            <div className="xl:hidden">
              <BottomNav />
            </div>
            <Footer />
          </GoogleTranslatorInit>
        </Providers>
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}

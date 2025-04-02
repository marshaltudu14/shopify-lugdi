// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ApolloWrapper from "@/lib/apollo/apollo-wrapper";
import Header from "./components/navbar/Header";
import localFont from "next/font/local";
import Footer from "./components/navbar/Footer";
import { Toaster } from "@/components/ui/sonner";
// Removed headers import
import { countries } from "@/lib/countries";
import { Metadata } from "next";
import { WishlistProvider } from "@/lib/contexts/WishlistContext";
import ThemeApplicator from "@/app/components/ThemeApplicator"; // Import ThemeApplicator
import { cn } from "@/lib/utils"; // Import cn utility
// Removed getActiveTheme and animation component imports

const blippo = localFont({
  src: "/fonts/blippo-blk-bt.ttf",
  variable: "--font-blippo",
  display: "swap",
});

const baumans = localFont({
  src: "/fonts/Baumans-Regular.ttf",
  variable: "--font-baumans",
  display: "swap",
});

interface RootLayoutParams {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({
  params,
}: RootLayoutParams): Promise<Metadata> {
  const { country } = await params;
  // Find country data based on URL parameter
  const currentCountry = countries.find((c) => c.slug === country && c.active);
  const countryName = currentCountry?.name;

  const siteTitle = countryName ? `Lugdi ${countryName}` : "Lugdi";
  const siteDescription = `Discover Lugdi${
    countryName ? ` ${countryName}` : ""
  }, a bold fashion brand merging cultural heritage with modern style. 
  Shop artistic graphic T-shirts, luxury streetwear, and unique designs 
  inspired by mythology, futuristic aesthetics, and abstract art. 
  Elevate your wardrobe with our latest collections today.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const ogImage = `${siteUrl}/opengraph-image.png`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteTitle,
    url: siteUrl,
    logo: `${siteUrl}/LugdiLogoBlack.png`,
    description: siteDescription,
    sameAs: [
      "https://www.instagram.com/lugdi.tudu",
      "https://www.facebook.com/lugdi.tudu",
    ],
  };

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: `%s - ${siteTitle}`,
    },
    description: siteDescription,
    keywords: `fashion, graphic t-shirts, luxury streetwear, cultural heritage, mythology fashion, Lugdi${
      countryName ? `, ${countryName}` : ""
    }`,
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: siteUrl,
      siteName: siteTitle,
      locale: currentCountry?.languageCode?.replace("-", "_") || "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteTitle}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [ogImage],
    },
    other: {
      "application/ld+json": JSON.stringify(structuredData),
    },
  };
}

export default async function RootLayout({
  children,
  params, // Added params back
}: Readonly<{
  children: React.ReactNode;
  params: { country: string }; // Use simple type now
}>) {
  // Keep lang logic for html attribute
  const { country } = params;
  const currentCountry = countries.find((c) => c.slug === country && c.active);
  const lang = currentCountry?.languageCode || "en";

  // Removed server-side theme logic

  return (
    <html lang={lang} suppressHydrationWarning>
      {/* Removed themeClass from body */}
      <body className={cn(blippo.variable, baumans.variable, "antialiased")}>
        <ApolloWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
          >
            <WishlistProvider>
              <ThemeApplicator>
                {" "}
                {/* Wrap content with ThemeApplicator */}
                {/* Removed Header/Footer props */}
                <Header />
                <main>{children}</main>
                <Toaster />
                <Footer />
              </ThemeApplicator>
            </WishlistProvider>{" "}
          </ThemeProvider>
        </ApolloWrapper>
        {/* Animation rendering is now handled inside ThemeApplicator */}
      </body>
    </html>
  );
}

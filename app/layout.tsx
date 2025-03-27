// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ApolloWrapper from "@/lib/apollo/apollo-wrapper";
import Header from "./components/navbar/Header";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";
import Footer from "./components/navbar/Footer";
import { Toaster } from "@/components/ui/sonner";

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

export async function generateMetadata() {
  const cookieStore = await cookies();
  const countryName =
    cookieStore.get(LugdiUtils.location_name_country_cookie)?.value || null;

  const siteTitle = countryName ? `Lugdi ${countryName}` : "Lugdi";
  const siteDescription = `Discover Lugdi ${
    countryName ? countryName : ""
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
    keywords:
      "fashion, graphic t-shirts, luxury streetwear, cultural heritage, mythology fashion, Lugdi",
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: siteUrl,
      siteName: siteTitle,
      locale: "en_US",
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
      image: ogImage,
    },
    alternates: {
      canonical: siteUrl,
    },
    other: {
      "application/ld+json": JSON.stringify(structuredData),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${blippo.variable} ${baumans.variable} antialiased`}>
        <ApolloWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
          >
            <Header />
            <main>{children}</main>
            <Toaster />
            <Footer />
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}

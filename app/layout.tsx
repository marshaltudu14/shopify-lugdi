// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ApolloWrapper from "@/lib/apollo/apollo-wrapper";
import Header from "./components/navbar/Header";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";

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
  const countryName = cookieStore.get(LugdiUtils.location_name_country_cookie)
    ?.value
    ? cookieStore.get(LugdiUtils.location_name_country_cookie)?.value
    : null;

  const siteTitle = countryName ? `Lugdi ${countryName}` : "Lugdi";
  const siteDescription = `Welcome to Lugdi ${
    countryName ? countryName : ""
  }, a revolutionary fashion brand blending cultural heritage with contemporary style. From artistic graphic T-shirts to luxury clothing, Lugdi ${countryName} offers a diverse range of fashion-forward designs crafted for those who dare to stand out. Each collection is inspired by mythology, streetwear, futuristic aesthetics, and abstract art, ensuring a unique and wearable experience. With a 3D browsing experience and global accessibility, Lugdi ${countryName} is set to redefine the future of fashion. Explore our latest drops and elevate your wardrobe today.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteTitle,
    url: siteUrl,
    logo: `${siteUrl}/LugdiTextLogoBlack.png`,
    description: siteDescription,
  };

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: `%s - ${siteTitle}`,
    },
    description: siteDescription,
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: siteUrl,
      siteName: siteTitle,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
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
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}

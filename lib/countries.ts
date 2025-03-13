export interface Country {
  name: string;
  slug: string;
  currency: string;
}

export const countries: Country[] = [
  { name: "India", slug: "in", currency: "₹" },
  { name: "United States", slug: "us", currency: "$" },
  { name: "United Kingdom", slug: "uk", currency: "£" },
  { name: "Canada", slug: "ca", currency: "$" },
  { name: "Australia", slug: "au", currency: "A$" },
  { name: "Germany", slug: "de", currency: "€" },
  { name: "France", slug: "fr", currency: "€" },
  { name: "Japan", slug: "jp", currency: "¥" },
  { name: "China", slug: "cn", currency: "¥" },
  { name: "Brazil", slug: "br", currency: "R$" },
];

export const banners = {
  in: [
    {
      image: "/banners/CountryHeroBanners/in-hero-banner.webp",
      headline: "lugdi",
      subtitle: "Heritage in Every Thread, Luxury in Every Detail",
    },
  ],
};

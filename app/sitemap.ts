import LugdiUtils from "@/utils/LugdiUtils";
import { MetadataRoute } from "next";
import { cookies } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cookieStore = await cookies();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/${countrySlug?.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}

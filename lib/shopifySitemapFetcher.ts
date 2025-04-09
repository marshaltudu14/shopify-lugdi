import { initializeApollo } from "@/lib/apollo/apollo-client";
import { gql } from "@apollo/client";

const SITEMAP_QUERY = gql`
  query ShopifySitemap($country: CountryCode, $type: SitemapType!, $page: Int!) @inContext(country: $country) {
    sitemap(type: $type) {
      resources(page: $page) {
        hasNextPage
        items {
          handle
          updatedAt
        }
      }
    }
  }
`;

export interface ShopifySitemapItem {
  handle: string;
  updatedAt: string;
}

export async function fetchShopifySitemapResources(
  countryCode: string,
  type: string
): Promise<ShopifySitemapItem[]> {
  const apolloClient = initializeApollo();
  const country = countryCode.toUpperCase();

  let page = 1;
  let hasNextPage = true;
  const items: ShopifySitemapItem[] = [];

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: SITEMAP_QUERY,
      variables: { country, type, page },
      fetchPolicy: "no-cache",
    });

    const resources = data?.sitemap?.resources;
    if (!resources) break;

    for (const item of resources.items) {
      items.push({
        handle: item.handle,
        updatedAt: item.updatedAt,
      });
    }

    hasNextPage = resources.hasNextPage;
    page++;
  }

  return items;
}

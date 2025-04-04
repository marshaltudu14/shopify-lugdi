//lib/apollo/apollo-client.ts

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const uri = siteUrl ? `${siteUrl}/api/graphql` : '/api/graphql'; // Keep fallback

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: new HttpLink({
      uri: uri, // Use the derived uri
      // Add fetch options if needed for authentication
      fetchOptions: {
        credentials: "same-origin",
      },
    }),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(
  initialState: NormalizedCacheObject | null = null
): ApolloClient<NormalizedCacheObject> {
  const client = apolloClient ?? createApolloClient();

  if (initialState) {
    const existingCache = client.extract();
    client.cache.restore({ ...existingCache, ...initialState });
  }

  if (typeof window === "undefined") return client;

  if (!apolloClient) apolloClient = client;

  return client;
}

//lib/apollo/apollo-client.ts

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  // Always use mock data - no more Shopify API calls
  const uri = '/api/graphql';

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: new HttpLink({
      uri: uri,
      fetchOptions: {
        credentials: "same-origin",
      },
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Menu: {
          fields: {
            items: {
              merge: false, // Don't merge arrays, replace them
            },
          },
        },
        MenuItem: {
          keyFields: ["title", "url"], // Use title and url as unique identifiers
        },
      },
    }),
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

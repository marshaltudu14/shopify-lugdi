//lib/apollo/apollo-client.ts

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: new HttpLink({
      uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/graphql`,
    }),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(): ApolloClient<NormalizedCacheObject> {
  if (typeof window === "undefined") return createApolloClient();
  if (!apolloClient) apolloClient = createApolloClient();
  return apolloClient;
}

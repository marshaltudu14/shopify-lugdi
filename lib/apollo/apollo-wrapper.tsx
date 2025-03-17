"use client";

import { ApolloProvider } from "@apollo/client";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import { ReactNode } from "react";

export default function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = initializeApollo();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

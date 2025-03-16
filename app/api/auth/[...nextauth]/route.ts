import { initializeApollo } from "@/lib/apollo/apollo-client";
import { CUSTOMER_LOGIN } from "@/lib/queries/auth";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type CustomUser = {
  id: string;
  email?: string | null;
  accessToken: string;
  expiresAt: string;
};

// Define the auth options separately for better reusability
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const client = initializeApollo();

          const { data } = await client.mutate({
            mutation: CUSTOMER_LOGIN,
            variables: {
              input: {
                email: credentials?.email,
                password: credentials?.password,
              },
            },
          });

          const { customerAccessToken, customerUserErrors } =
            data.customerAccessTokenCreate;

          if (customerUserErrors && customerUserErrors.length > 0) {
            // Map Shopify error codes to user-friendly messages
            const errorCode = customerUserErrors[0].code;
            const errorMessage = customerUserErrors[0].message;

            let userFriendlyMessage = errorMessage;

            // Customize error messages based on Shopify error codes
            switch (errorCode) {
              case "UNIDENTIFIED_CUSTOMER":
                userFriendlyMessage =
                  "Email not found. Please check your email or register for an account.";
                break;
              case "INVALID_CREDENTIALS":
                userFriendlyMessage =
                  "Invalid email or password. Please try again.";
                break;
              case "TOO_MANY_ATTEMPTS":
                userFriendlyMessage =
                  "Too many login attempts. Please try again later.";
                break;
              // Add more cases as needed
            }

            throw new Error(userFriendlyMessage);
          }

          if (customerAccessToken) {
            return {
              id: credentials?.email || "",
              email: credentials?.email,
              accessToken: customerAccessToken.accessToken,
              expiresAt: customerAccessToken.expiresAt,
            };
          }

          return null;
        } catch (error: unknown) {
          console.error("Authentication error:", error);

          let errorMessage = "Authentication failed";

          if (error instanceof Error) {
            errorMessage = error.message;
          }

          throw new Error(errorMessage);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as CustomUser).accessToken;
        token.expiresAt = (user as CustomUser).expiresAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.expiresAt = token.expiresAt as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Create the handler using the App Router pattern
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

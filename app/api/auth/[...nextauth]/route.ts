import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { generateCodeChallenge, generateCodeVerifier } from "@/lib/auth-utils";
import { cookies } from "next/headers";

const shopifyAuthUrl = `https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}`;

export const authOptions = {
  providers: [
    {
      id: "shopify",
      name: "Shopify",
      type: "oauth" as const,
      clientId: process.env.SHOPIFY_CLIENT_ID,
      authorization: {
        url: `${shopifyAuthUrl}/oauth/authorize`,
        params: {
          scope: "openid email customer-account-api:full",
          response_type: "code",
          redirect_uri: process.env.SHOPIFY_REDIRECT_URI,
        },
        // Customize authorization to include code_challenge
        async request(context) {
          const verifier = await generateCodeVerifier();
          const challenge = await generateCodeChallenge(verifier);
          // Store code_verifier in an HTTP-only cookie
          cookies().set("shopify_code_verifier", verifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 10, // 10 minutes
          });

          const url = new URL(context.provider.authorization.url);
          const params = {
            ...context.params,
            code_challenge: challenge,
            code_challenge_method: "S256",
          };
          url.search = new URLSearchParams(params).toString();
          return { url: url.toString() };
        },
      },
      token: {
        url: `${shopifyAuthUrl}/oauth/token`,
        async request(context) {
          const { provider, code } = context;
          // Retrieve code_verifier from cookie
          const codeVerifier = cookies().get("shopify_code_verifier")?.value;
          if (!codeVerifier) {
            throw new Error("Code verifier not found in cookies");
          }

          const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: provider.clientId!,
            redirect_uri: process.env.SHOPIFY_REDIRECT_URI!,
            code,
            code_verifier: codeVerifier,
          });

          const response = await fetch(provider.token.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token request failed: ${error}`);
          }

          const tokens = await response.json();
          // Clean up the cookie after successful token exchange
          cookies().delete("shopify_code_verifier");
          return { tokens };
        },
      },
      userinfo: `https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/2025-01/graphql`,
      async profile(profile, tokens) {
        return {
          id: profile.sub,
          email: profile.email,
          accessToken: tokens.access_token,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;
      }
      if (token.expiresAt && Date.now() > token.expiresAt * 1000) {
        const refreshedTokens = await refreshAccessToken(token);
        token.accessToken = refreshedTokens.access_token;
        token.refreshToken =
          refreshedTokens.refresh_token || token.refreshToken;
        token.expiresAt =
          Math.floor(Date.now() / 1000) + refreshedTokens.expires_in;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.idToken = token.idToken as string;
      session.expiresAt = token.expiresAt as number;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("/api/auth/callback") || url.includes("/logout")) {
        return baseUrl + "/account";
      }
      return url;
    },
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
};

// Refresh token function (unchanged)
async function refreshAccessToken(token: any) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.SHOPIFY_CLIENT_ID!,
    refresh_token: token.refreshToken,
  });

  const response = await fetch(`${shopifyAuthUrl}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) throw new Error("Failed to refresh token");

  const tokens = await response.json();
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || token.refreshToken,
    expires_in: tokens.expires_in,
  };
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

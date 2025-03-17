import NextAuth from "next-auth";
import { encode as base64urlEncode } from "crypto-js";
import SHA256 from "crypto-js/sha256";

async function generateCodeVerifier() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return base64urlEncode(Buffer.from(randomBytes).toString("base64"))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function generateCodeChallenge(verifier) {
  const hashed = SHA256(verifier);
  return base64urlEncode(hashed)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function decodeJwt(token) {
  const [, payload] = token.split(".");
  return { payload: JSON.parse(Buffer.from(payload, "base64").toString()) };
}

const authOptions = {
  providers: [
    {
      id: "shopify",
      name: "Shopify",
      type: "oauth",
      clientId: process.env.SHOPIFY_CLIENT_ID,
      authorization: {
        url: `https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}/oauth/authorize`,
        params: {
          scope: "openid email customer-account-api:full",
          response_type: "code",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/shopify`,
          state: Math.random().toString(36).substring(2),
          async params(context) {
            const verifier = await generateCodeVerifier();
            const challenge = await generateCodeChallenge(verifier);
            context.verifier = verifier;
            return { code_challenge: challenge, code_challenge_method: "S256" };
          },
        },
      },
      token: {
        url: `https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}/oauth/token`,
        async request(context) {
          const { code, verifier } = context.params;
          const response = await fetch(context.provider.token.url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: process.env.SHOPIFY_CLIENT_ID,
              redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/shopify`,
              code,
              code_verifier: verifier,
            }),
          });
          const tokens = await response.json();
          if (!response.ok)
            throw new Error(tokens.error_description || "Token request failed");
          return { tokens };
        },
      },
      userinfo: {
        async request(context) {
          const { payload } = decodeJwt(context.tokens.id_token);
          return { id: payload.sub, email: payload.email };
        },
      },
      async refreshAccessToken(token) {
        const response = await fetch(
          `https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}/oauth/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              client_id: process.env.SHOPIFY_CLIENT_ID,
              refresh_token: token.refresh_token,
            }),
          }
        );
        const refreshed = await response.json();
        if (!response.ok)
          throw new Error(refreshed.error_description || "Refresh failed");
        return {
          access_token: refreshed.access_token,
          expires_in: refreshed.expires_in,
          refresh_token: refreshed.refresh_token || token.refresh_token,
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
        token.expiresAt = Date.now() + account.expires_in * 1000;
        token.state = account.providerAccountId;
      }
      if (Date.now() > token.expiresAt) {
        try {
          const refreshed = await this.providers[0].refreshAccessToken(token);
          token.accessToken = refreshed.access_token;
          token.expiresAt = Date.now() + refreshed.expires_in * 1000;
          token.refreshToken = refreshed.refresh_token;
        } catch (error) {
          console.error("Token refresh failed:", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error;
      } else {
        session.accessToken = token.accessToken;
        session.idToken = token.idToken;
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("state=")) {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        const state = urlParams.get("state");
        if (state !== this.providers[0].authorization.params.state) {
          return `${baseUrl}/auth/error?error=CSRF`;
        }
      }
      return url.startsWith(baseUrl) ? url : `${baseUrl}/account`;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  pages: {
    error: "/auth/error",
  },
};

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);

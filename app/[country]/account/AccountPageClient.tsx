"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { silentAuthCheck } from "@/lib/auth-check";

export default function Account() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (status === "unauthenticated") {
        // First, try silent check
        const result = await silentAuthCheck();
        if (!result) {
          // If silent check fails (e.g., login_required), trigger full login
          signIn("shopify", { callbackUrl: "/account" });
        }
      }
    };
    checkAuth();
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;

  if (session) {
    return (
      <div>
        <h1>Account</h1>
        <p>Welcome, {session.user?.email}</p>
        <a
          href={`https://<shop-domain>/checkouts/<checkout_id>?logged_in=true`}
        >
          Go to Checkout
        </a>
        <button
          onClick={() =>
            signOut({
              callbackUrl: `https://shopify.com/authentication/${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID}/logout?id_token_hint=${session.idToken}&post_logout_redirect_uri=${process.env.NEXT_PUBLIC_SHOPIFY_POST_LOGOUT_REDIRECT_URI}`,
            })
          }
        >
          Logout
        </button>
      </div>
    );
  }

  return null;
}

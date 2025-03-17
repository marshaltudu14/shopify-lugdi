"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function SilentAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      fetch("/api/auth/silent").then((res) => {
        if (res.redirected) window.location.href = res.url;
      });
    } else {
      router.push("/account");
    }
  }, [session, status, router]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("code") === "login_required") {
      signIn("shopify", { callbackUrl: "/account" });
    } else if (query.get("code")) {
      router.push("/account");
    }
  }, [router]);

  return <p>Checking authentication...</p>;
}

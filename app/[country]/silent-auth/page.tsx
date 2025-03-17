"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SilentAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "authenticated") {
      router.push("/account");
    }

    if (status === "unauthenticated") {
      fetch("/api/auth/silent").then((res) => {
        if (res.redirected) window.location.href = res.url;
      });
    }
  }, [status, router]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code === "login_required") {
      router.push("/login");
    } else if (code) {
      router.push("/account");
    }
  }, [searchParams, router]);

  return <p>Checking authentication...</p>;
}

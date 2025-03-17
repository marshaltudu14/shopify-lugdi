"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function Account() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated" || session?.error) {
      signIn("shopify", { callbackUrl: "/account" });
    }
  }, [status, session]);

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: session?.idToken }),
    });
    if (response.redirected) window.location.href = response.url;
  };

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated" || session?.error) return null; // Redirecting

  return (
    <div>
      <h1>Account</h1>
      <p>Welcome</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

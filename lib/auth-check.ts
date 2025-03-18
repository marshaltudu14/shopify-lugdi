import { signIn } from "next-auth/react";

export async function silentAuthCheck() {
  await signIn("shopify", {
    callbackUrl: "/account",
    redirect: false,
    prompt: "none", // Silent check
  });
}

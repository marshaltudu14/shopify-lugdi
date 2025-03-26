import { cookies } from "next/headers";
import AccountPageClient from "./AccountPageClient";
import { redirect } from "next/navigation";

export const generateMetadata = async () => ({
  title: "Account",
});

export default async function AccountPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("lugdi_shopify_access_token")?.value;
  const expiresAt = cookieStore.get("lugdi_shopify_expires_at")?.value;

  // Check if authenticated
  if (!accessToken || !expiresAt || Date.now() > parseInt(expiresAt)) {
    redirect("/login");
  }

  return <AccountPageClient />;
}

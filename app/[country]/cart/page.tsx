import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_CART_VARIANTS } from "@/lib/queries/cart";
import LugdiUtils from "@/utils/LugdiUtils";
import { cookies } from "next/headers";
import ClientCartPage from "./ClientCartPage";
import { notFound } from "next/navigation";

export default async function CartPage() {
  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  const client = initializeApollo();

  // Here you would typically get cart items from a server-side store or cookies
  // For this example, we'll assume they're passed somehow or fetched client-side
  // In a real app, you might store cart items in cookies or a database

  return <ClientCartPage countryCode={isoCountryCode} />;
}

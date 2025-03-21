import ClientCartPage from "./ClientCartPage";

export function generateMetadata() {
  return {
    title: "Cart",
    description: "View your cart and checkout",
  };
}

export default function CartPage() {
  return <ClientCartPage />;
}

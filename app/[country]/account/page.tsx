import AccountPageClient from "./AccountPageClient";

export const generateMetadata = async () => ({
  title: "Account",
});

export default function AccountPage() {
  return <AccountPageClient />;
}

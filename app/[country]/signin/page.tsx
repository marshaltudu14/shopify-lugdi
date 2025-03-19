import SignInPageClient from "./SignInPageClient";

export const generateMetadata = () => {
  return { title: "Sign In" };
};

export default async function SignInPage() {
  return <SignInPageClient />;
}

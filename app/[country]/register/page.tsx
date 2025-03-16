import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Create an Account",
  description: "Register a new account to start shopping.",
};

export default async function RegisterPage() {
  return <RegisterForm />;
}

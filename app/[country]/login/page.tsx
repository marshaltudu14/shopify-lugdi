import React from "react";
import LoginForm from "./LoginForm";

export async function generateMetadata() {
  return {
    title: "Login",
    descripton: "Login to your account",
  };
}

export default async function LoginPage() {
  return <LoginForm />;
}

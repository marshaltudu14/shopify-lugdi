"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ErrorType =
  | "missing_params"
  | "state_mismatch"
  | "token_fetch_failed"
  | "default";

type ErrorMessage = {
  title: string;
  description: string;
};

export default function SignInPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  // Error message mapping
  const errorMessages: Record<ErrorType, ErrorMessage> = {
    missing_params: {
      title: "Missing Information",
      description:
        "Some required information was missing from your login attempt.",
    },
    state_mismatch: {
      title: "Security Verification Failed",
      description: "We couldn't verify the security of your login request.",
    },
    token_fetch_failed: {
      title: "Authentication Failed",
      description:
        "We couldn't complete the authentication process with Shopify.",
    },
    default: {
      title: "Sign In Error",
      description: "An unexpected error occurred during sign in.",
    },
  };

  // Get appropriate error message or default
  const errorInfo: ErrorMessage = errorParam
    ? Object.keys(errorMessages).includes(errorParam)
      ? errorMessages[errorParam as ErrorType]
      : errorMessages.default
    : errorMessages.default;

  // Retry login function
  const handleRetryLogin = () => {
    setLoading(true);
    router.push("/api/auth/signin");
  };

  // Auto redirect if no error
  useEffect(() => {
    if (!errorParam) {
      setLoading(true);
      router.push("/api/auth/signin");
    }
  }, [errorParam, router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="animate-spin" />
          </div>
        ) : errorParam ? (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <AlertCircle className="h-5 w-5 text-red-500" />
                {errorInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Sign In Failed</AlertTitle>
                <AlertDescription>{errorInfo.description}</AlertDescription>
              </Alert>
              <p className="text-muted-foreground mt-2">
                This might be due to an expired session or connection issue.
                Please try signing in again.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleRetryLogin}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {loading ? "Loading..." : "Try Again"}
              </Button>
            </CardFooter>
          </Card>
        ) : null}
      </motion.div>
    </div>
  );
}

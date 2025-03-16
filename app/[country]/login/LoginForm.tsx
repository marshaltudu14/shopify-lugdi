"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useAnimationControls } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Shadcn/UI imports
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Icons
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Custom animations
import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

// Enhanced Zod validation schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  acceptsMarketing: z.boolean().default(false),
  agreeToPolicies: z.boolean().refine((val) => val === true, {
    message: "You must agree to the policies",
  }),
});

const otpSchema = z.object({
  otpCode: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits"),
});

export default function AuthPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<"email" | "otp" | "registered">("email");
  const [email, setEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const router = useRouter();
  const urlParams = useSearchParams();
  const redirectTo = urlParams.get("redirect") || "/account";

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      acceptsMarketing: false,
      agreeToPolicies: false,
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: "" },
  });

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initiate",
          email: values.email,
          acceptsMarketing: values.acceptsMarketing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setEmail(values.email);
      if (data.action === "otp") {
        setStage("otp");
      } else if (data.action === "register") {
        setStage("registered");
        setSuccessMessage(data.message);
      }
    } catch (error: any) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    if (!email) return;
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          email,
          otpCode: values.otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      router.push(redirectTo);
    } catch (error: any) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate parallax values
  const parallaxX = mousePosition.x * 20 - 10; // Move -10px to +10px
  const parallaxY = mousePosition.y * 20 - 10; // Move -10px to +10px

  return (
    <main
      ref={containerRef}
      className="relative flex items-center justify-center min-h-screen w-full overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 w-full h-full scale-110" // Scale up slightly to prevent edges from showing
        animate={{
          x: parallaxX,
          y: parallaxY,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 30,
        }}
      >
        <Image
          src="/auth/Login Page.webp"
          fill
          alt="Lugdi Login Page Banner"
          className="object-cover"
          priority
        />
        {/* Dark overlay to improve card readability */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Login Card */}
      <div className="relative z-10 px-4">
        <AnimatedSection delay={0.15}>
          <Card
            className="
            w-[300px] 
            md:w-[400px]
            max-w-full
            shadow-xl 
            rounded-lg 
            border 
            border-gray-200/20
            dark:border-gray-800/20
            transition-colors 
            bg-white/90
            backdrop-blur-md
            dark:bg-gray-900/80
          "
          >
            <CardHeader className="text-center">
              <motion.div variants={itemVariants}>
                <CardTitle className="text-2xl font-bold tracking-wide">
                  Login / Register
                </CardTitle>
                <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">
                  Enter your email to login or register
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="p-6">
              {stage === "email" && (
                <Form {...emailForm}>
                  <form
                    onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                    className="flex flex-col space-y-4"
                  >
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="acceptsMarketing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-gray-600">
                              I want to receive marketing emails and promotions
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="agreeToPolicies"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-gray-600">
                              I agree to the{" "}
                              <Link
                                href="/terms"
                                className="underline text-blue-600"
                              >
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link
                                href="/privacy"
                                className="underline text-blue-600"
                              >
                                Privacy Policy
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    {serverError && (
                      <div className="text-red-600 text-sm">{serverError}</div>
                    )}
                    <motion.div
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          "Continue"
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              )}
              {stage === "otp" && (
                <Form {...otpForm}>
                  <form
                    onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
                    className="flex flex-col space-y-4"
                  >
                    <div className="text-sm text-gray-600">
                      Check your email for the OTP.
                    </div>
                    <FormField
                      control={otpForm.control}
                      name="otpCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter OTP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 6-digit code"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {serverError && (
                      <div className="text-red-600 text-sm">{serverError}</div>
                    )}
                    <motion.div
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </div>
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </motion.div>
                    <Button
                      variant="link"
                      onClick={() => setStage("email")}
                      className="text-sm"
                    >
                      Use a different email
                    </Button>
                  </form>
                </Form>
              )}
              {stage === "registered" && (
                <div className="flex flex-col space-y-4">
                  <div className="text-sm text-green-600">{successMessage}</div>
                  <motion.div
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      onClick={() => setStage("email")}
                      className="w-full"
                    >
                      Continue to Sign In
                    </Button>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </main>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
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
import Link from "next/link";
import LugdiUtils from "@/utils/LugdiUtils";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address."),
  password: z
    .string({ required_error: "Password is required." })
    .min(
      LugdiUtils.password_min_char,
      `Password must be at least ${LugdiUtils.password_min_char} characters`
    ),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLElement | null>(null);

  const router = useRouter();
  const urlParams = useSearchParams();
  const redirectTo = urlParams.get("redirect") || "/account";

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      setIsLoading(false);

      if (result?.error) {
        // Handle specific error messages from NextAuth
        if (result.error === "CredentialsSignin") {
          // This is the default NextAuth error when credentials are invalid
          // We should never see this if our backend is properly passing error messages
          setError("Invalid email or password. Please try again.");
        } else {
          // Display the specific error message from our backend
          setError(result.error);
        }
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
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
          className="object-cover object-top"
          priority
        />
        {/* Dark overlay to improve card readability */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Login Card */}
      <div className="relative z-10 px-4">
        <AnimatedSection delay={0.2}>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
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
                    Login
                  </CardTitle>
                  <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">
                    Enter your email & password to login
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent className="p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
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
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                              <span className="sr-only">
                                {showPassword ? "Hide" : "Show"} password
                              </span>
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                    <motion.div
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                      initial="initial"
                    >
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Logging in...
                          </div>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>

                {/* Separator with "OR" */}
                <div className="flex items-center mt-4">
                  <span className="flex-1 border-t border-gray-300 dark:border-gray-700" />
                  <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
                    OR
                  </span>
                  <span className="flex-1 border-t border-gray-300 dark:border-gray-700" />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-2 items-center">
                {/* Register Button */}
                <motion.div
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full" asChild>
                    <Link
                      href={`/register?redirect=${encodeURIComponent(
                        redirectTo
                      )}`}
                    >
                      Register
                    </Link>
                  </Button>
                </motion.div>

                {/* Reset Password Button */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5 mb-2">
                  Don&apos;t Remember your Password?
                </p>
                <motion.div
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full" asChild>
                    <Link
                      href={`/forgot-password?redirect=${encodeURIComponent(
                        redirectTo
                      )}`}
                      /* href={`/forgot-password${
                      email ? `?email=${encodeURIComponent(email)}` : ""
                    }`} */
                    >
                      Reset Password
                    </Link>
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatedSection>
      </div>
    </main>
  );
}

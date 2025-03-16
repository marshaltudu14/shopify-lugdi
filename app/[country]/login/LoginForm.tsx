"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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

// Enhanced Zod validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

export default function LoginPage() {
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const urlParams = useSearchParams();
  const redirectTo = urlParams.get("redirect") || "/account";

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values) => {
    /* setServerError(null);
    setIsLoading(true);

    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
      });

      if (response.error) {
        setServerError(response.message);
      } else {
        router.push(redirectTo);
      }
    } catch (error) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    } */
  };

  const email = form.getValues("email");

  return (
    <main className="grid lg:grid-cols-2 min-h-screen">
      {/*Right Section*/}
      <div
        className="
        flex 
        items-center 
        justify-center 
        min-h-screen
        px-4
      "
      >
        <AnimatedSection delay={0.15}>
          <Card
            className="
            w-[300px] 
            md:w-[400px]
            max-w-full
            shadow-lg 
            rounded-lg 
            border 
            border-gray-200 
            dark:border-gray-800
            transition-colors 
            bg-gradient-to-b 
            from-white 
            to-gray-50 
            dark:from-gray-900
            dark:to-black
          "
          >
            <CardHeader className="text-center">
              <motion.div variants={itemVariants}>
                <CardTitle className="text-2xl font-bold tracking-wide">
                  Welcome Back
                </CardTitle>
                <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">
                  Please sign in to continue
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="flex flex-col space-y-4"
                >
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="you@example.com"
                            className="
                            focus:ring-2 
                            focus:ring-blue-500 
                            dark:focus:ring-blue-400
                          "
                          />
                        </FormControl>
                        <FormMessage className="text-sm mt-1 text-red-600 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="
                              focus:ring-2 
                              focus:ring-blue-500 
                              dark:focus:ring-blue-400
                            "
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-3 flex items-center"
                            >
                              {showPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-sm mt-1 text-red-600 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Server Error */}
                  {serverError && (
                    <div className="text-red-600 dark:text-red-400 text-sm mt-2">
                      {serverError}
                    </div>
                  )}

                  {/* Submit Button */}
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
                          Signing In...
                        </div>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </motion.div>

                  {/* Or Google Sign In */}
                  <motion.div
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {/* <GoogleSignin /> */}
                  </motion.div>
                </form>
              </Form>

              {/* Separator with "OR" */}
              <div className="flex items-center my-4">
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
                    href={`/forgot-password${
                      email ? `?email=${encodeURIComponent(email)}` : ""
                    }`}
                  >
                    Reset Password
                  </Link>
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </AnimatedSection>
      </div>

      {/*Right Section*/}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/auth/Login Page.webp"
          fill
          alt="Lugdi Login Page Banner"
          className="object-cover"
        />
      </div>
    </main>
  );
}

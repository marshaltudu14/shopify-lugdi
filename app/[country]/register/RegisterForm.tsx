"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Framer Motion animation utils
import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";

import Image from "next/image";

// 1. Refined password match schema
const passwordMatchSchema = z
  .object({
    password: z
      .string({ required_error: "A password is required." })
      .min(6, "Your password must be at least 6 characters long.")
      .regex(/[0-9]/, "Your password must include at least one digit.")
      .regex(
        /[A-Z]/,
        "Your password must include at least one uppercase letter."
      )
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Your password must include at least one special character."
      ),
    passwordConfirm: z
      .string({ required_error: "Please confirm your password." })
      .min(1, "Please confirm your password."),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: "The two passwords do not match. Please try again.",
    path: ["passwordConfirm"],
  });

// 2. Combine with an email field for the final form schema
const formSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required." })
      .email("Please enter a valid email address."),
  })
  .and(passwordMatchSchema);

export default function RegisterForm() {
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // This state controls whether our success dialog is shown
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Toggle states for showing/hiding passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const urlParams = useSearchParams();
  const redirectTo = urlParams.get("redirect") || "/account";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const handleSubmit = async (data) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await registerUser({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });

      if (response.error) {
        // If Supabase registration fails or user already exists
        setServerError(response.message);
      } else {
        // Show success dialog instead of redirecting to confirmation
        setShowSuccessDialog(true);
      }
    } catch (error) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid lg:grid-cols-2 min-h-screen">
      {/*Left Section*/}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="absolute inset-0 pointer-events-none -z-10" />
        <AnimatedSection delay={0.2}>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            <Card className="w-[300px] md:w-[400px] shadow-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
              <CardHeader className="text-center space-y-2">
                <motion.div variants={itemVariants}>
                  <CardTitle className="text-2xl font-bold">
                    Create an Account
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Sign up to start shopping today
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-4"
                  >
                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., johndoe@gmail.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password Field */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password Field */}
                    <FormField
                      control={form.control}
                      name="passwordConfirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-3 flex items-center"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Server-side Error */}
                    {serverError && (
                      <p className="text-red-500 text-sm mt-1">{serverError}</p>
                    )}

                    {/* Submit Button */}
                    <motion.div
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                      initial="initial"
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full font-semibold"
                      >
                        {isLoading ? (
                          <div className="flex gap-2 items-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Please wait...
                          </div>
                        ) : (
                          "Sign Up"
                        )}
                      </Button>
                    </motion.div>

                    {/* Google OAuth Button */}
                    {/* <GoogleSignup /> */}
                  </form>
                </Form>
              </CardContent>

              {/* Use a button for login */}
              <CardFooter className="flex flex-col gap-2 items-center">
                <div className="text-sm text-muted-foreground">
                  Already have an account?
                </div>
                <motion.div
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial="initial"
                  className="w-full"
                >
                  <Button
                    asChild
                    variant="outline"
                    className="w-full font-semibold"
                  >
                    <Link href={`/login?redirect=${redirectTo}`}>Login</Link>
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatedSection>

        {/* Registration Success Dialog */}
        <AlertDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registration Successful</AlertDialogTitle>
              <AlertDialogDescription>
                We&apos;ve sent a confirmation link to your email. Please follow
                the instructions to complete your registration.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  // Close dialog on OK
                  setShowSuccessDialog(false);
                }}
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/*Right Section*/}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/auth/Register Page.webp"
          fill
          alt="Lugdi Login Page Banner"
          className="object-cover"
        />
      </div>
    </main>
  );
}

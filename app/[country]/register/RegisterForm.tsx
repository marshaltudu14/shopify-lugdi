"use client";

import { useEffect, useRef, useState } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Framer Motion animation utils
import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";

import Image from "next/image";
import LugdiUtils from "@/utils/LugdiUtils";
import { useMutation } from "@apollo/client";
import { CUSTOMER_CREATE } from "@/lib/queries/auth";

// 1. Refined password match schema
const passwordMatchSchema = z
  .object({
    password: z
      .string({ required_error: "A password is required." })
      .min(
        LugdiUtils.password_min_char,
        `Your password must be at least ${LugdiUtils.password_min_char} characters long.`
      )
      .regex(/[0-9]/, "Your password must include at least one digit.")
      .regex(
        /[A-Z]/,
        "Your password must include at least one uppercase letter."
      ),
    passwordConfirm: z
      .string({ required_error: "Please confirm your password." })
      .min(1, "Please confirm your password."),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: "The two passwords do not match. Please try again.",
    path: ["passwordConfirm"],
  });

// 2. Combine with email field and checkboxes for the final form schema
const registerSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required." })
      .email("Please enter a valid email address."),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    acceptsMarketing: z.boolean().optional(),
    acceptsTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to our terms and policies to register.",
    }),
  })
  .and(passwordMatchSchema);

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Toggle states for showing/hiding passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLElement | null>(null);

  const router = useRouter();
  const urlParams = useSearchParams();
  const redirectTo = urlParams.get("redirect") || "/account";

  const [customerCreate] = useMutation(CUSTOMER_CREATE);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      firstName: "",
      lastName: "",
      acceptsMarketing: false,
      acceptsTerms: false,
    },
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Only pass password (not passwordConfirm) to the mutation
      const { data } = await customerCreate({
        variables: {
          input: {
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            acceptsMarketing: values.acceptsMarketing,
          },
        },
      });

      console.log("Customer:", data);

      const { customerUserErrors } = data.customerCreate;

      if (customerUserErrors.length > 0) {
        throw new Error(customerUserErrors[0].message);
      }

      setSuccess("Registration successful! Please log in.");
      setTimeout(() => router.push(redirectTo), 2000);
    } catch (err: unknown) {
      setError(err.message);
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
          src="/auth/Register Page.webp"
          fill
          alt="Lugdi Register Page Banner"
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
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                  >
                    {/* Name Fields */}
                    <div className="flex space-x-3 justify-between items-center">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Marshal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Tudu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., marshaltudu@gmail.com"
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
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2"
                                onClick={toggleConfirmPasswordVisibility}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="sr-only">
                                  {showConfirmPassword ? "Hide" : "Show"}{" "}
                                  password
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Marketing Checkbox */}
                    <FormField
                      control={form.control}
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
                            <FormLabel>Marketing emails</FormLabel>
                            <FormDescription className="text-xs">
                              I agree to receive marketing emails with offers
                              and updates.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Terms Checkbox (Required) */}
                    <FormField
                      control={form.control}
                      name="acceptsTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              required
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Terms and Policies</FormLabel>
                            <FormDescription className="text-xs">
                              I agree to the{" "}
                              <Link
                                href="/terms"
                                className="text-primary hover:underline"
                              >
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link
                                href="/privacy"
                                className="text-primary hover:underline"
                              >
                                Privacy Policy
                              </Link>
                              .
                            </FormDescription>
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
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm"
                      >
                        {success}
                      </motion.div>
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
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Registering...
                          </div>
                        ) : (
                          "Register"
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
                    <Link
                      href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                    >
                      Login
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

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
// Removed unused imports
import { useQuery } from "@apollo/client";
import { GET_MENU } from "@/lib/queries/menu";
import { MenuItem } from "@/lib/types/menu";
// Removed useContext, ThemeContext, cn imports
// Removed Image and useTheme imports

// Removed FooterProps interface

const Footer = () => {
  // Removed props from signature
  // Removed logoDecorationClass from context
  // Removed params and country extraction

  // TODO: Implement proper loading and error states
  const { data: policiesData } = useQuery(GET_MENU, {
    variables: { handle: "policies" },
  });
  const policyItems: MenuItem[] = policiesData?.menu?.items || [];

  // Removed unused ensureStartWith function

  // No longer need Shopify domain for demo mode

  const socialLinks = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/lugdi.tudu",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground" // Use themed color
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    // Removed Twitter
    {
      name: "Facebook",
      url: "https://www.facebook.com/lugdi.tudu",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground" // Use themed color
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    // Removed YouTube
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-background via-secondary/20 to-background dark:from-background dark:via-secondary/10 dark:to-background pt-16 border-t border-border mb-16 md:mb-0 pb-8">
      {/* Added mb-16 md:mb-0 and restored pb-8 */}
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center">
        {/* Centered Logo */}
        {/* Removed logoDecorationClass from cn() */}
        <div className="mb-8">
          {/* Reverted to simple text logo, added class */}
          {/* Removed gradient classes, applied text-foreground */}
          <h1 className="logo-text relative text-4xl text-center md:text-5xl text-foreground">
            lugdi
          </h1>
        </div>

        {/* Policies Section - Centered */}
        {policyItems.length > 0 && (
          <div className="mb-8">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {policyItems.map((item) => (
                <motion.li
                  key={item.title}
                  whileHover={{ scale: 1.05 }} // Simple hover effect
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {(() => {
                    // Use URL as-is from mock data (already relative)
                    const href = item.url || "#"; // Fallback to # if URL is empty

                    return (
                      <Link
                        href={href}
                        className="text-muted-foreground hover:text-foreground text-sm"
                      >
                        {item.title}
                      </Link>
                    );
                  })()}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Separator */}
        <Separator className="my-8 bg-border w-full max-w-4xl" />

        {/* Bottom section with copyright and social links */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }} // Shorter delay
            className="mb-4 md:mb-0" // Margin bottom on mobile
          >
            © {new Date().getFullYear()} lugdi. All rights
            reserved.
          </motion.p>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map(
              (
                social // Use social.name as key
              ) => (
                <motion.a
                  key={social.name}
                  href={social.url} // Use the URL from the array
                  whileHover={{ y: -3 }} // Slightly less hover effect
                  className="p-2 rounded-full bg-secondary dark:bg-secondary/50 hover:bg-accent dark:hover:bg-accent/50"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.svg}
                </motion.a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { getCookie } from "@/utils/CookieUtils";
import LugdiUtils from "@/utils/LugdiUtils";

const Footer = () => {
  const footerSections = [
    {
      title: "Shop",
      links: ["New Arrivals", "Collections", "Accessories", "Sale"],
    },
    {
      title: "Help",
      links: ["Contact Us", "Shipping & Returns", "Size Guide", "FAQs"],
    },
    {
      title: "About",
      links: ["Our Story", "Sustainability", "Careers", "Press"],
    },
  ];

  const socialLinks = [
    {
      name: "Instagram",
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
    {
      name: "Twitter",
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
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
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
    {
      name: "Youtube",
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
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
      ),
    },
  ];

  return (
    // Use themed background gradient and border
    <footer className="w-full bg-gradient-to-b from-background via-secondary/20 to-background dark:from-background dark:via-secondary/10 dark:to-background pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top section with brand name and description */}
        <div className="flex flex-col mb-12 gap-8">
          <div className="w-full">
            {/* Use themed text color */}
            <h1 className="text-4xl text-center md:text-5xl mb-4 text-foreground">
              lugdi
            </h1>
            {/* Use themed text color */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-muted-foreground mb-6"
            >
              Crafting an exclusive experience with designs that embody elegance
              and sophistication.
            </motion.p>
          </div>
        </div>

        {/* Use themed separator color */}
        <Separator className="my-8 bg-border" />

        {/* Middle section with links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section, index) => (
            <div key={index}>
              {/* Use themed text color */}
              <h3 className="text-sm font-medium uppercase tracking-wider mb-4 text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Use themed text colors */}
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      {link}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            {/* Use themed text color */}
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4 text-foreground">
              Connect
            </h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -5 }}
                  // Use themed background and hover colors
                  className="p-2 rounded-full bg-secondary dark:bg-secondary/50 hover:bg-accent dark:hover:bg-accent/50"
                  aria-label={social.name}
                >
                  {social.svg}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section with copyright and policies */}
        {/* Use themed border and text colors */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-border text-sm text-muted-foreground">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            © {new Date().getFullYear()} lugdi{" "}
            {getCookie(LugdiUtils.location_name_country_cookie)}. All rights
            reserved.
          </motion.p>

          <div className="flex flex-wrap gap-6 mt-4 md:mt-0">
            {/* Use themed hover text color */}
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

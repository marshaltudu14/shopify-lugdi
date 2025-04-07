"use client";

import React from "react";
import { ShopPolicyData } from "@/lib/queries/shopPolicies"; // Import the correct type
import { motion } from "framer-motion"; // For potential animations

// Update props interface to expect 'policy' of type 'ShopPolicyData'
interface ClientPolicyPageProps {
  policy: ShopPolicyData;
}

export default function ClientPolicyPage({ policy }: ClientPolicyPageProps) { // Destructure 'policy'
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="prose dark:prose-invert max-w-4xl mx-auto" // Apply prose styling for readability
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {policy.title} {/* Use policy.title */}
        </h1>
        {/* Render HTML content from Shopify */}
        <div dangerouslySetInnerHTML={{ __html: policy.body }} /> {/* Use policy.body */}
      </motion.div>
    </div>
  );
}

import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import { Button } from "@/components/ui/button";
import {
  GetSingleProductRecommendationResponse,
  GetSingleProductResponse,
} from "@/lib/types/product";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

export default function ClientProductPage({
  productData,
  recommendationsData,
}: {
  productData: GetSingleProductResponse;
  recommendationsData?: GetSingleProductRecommendationResponse;
}) {
  if (!productData.product) {
    {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <motion.p
                variants={itemVariants}
                className="text-2xl font-bold mb-2"
              >
                This product is currently not available in your region.
              </motion.p>
              <motion.p variants={itemVariants} className="max-w-md">
                Meanwhile, you can check out our other available products in
                your region.
              </motion.p>
              <motion.div
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="mt-6"
              >
                <Link href="/" passHref>
                  <Button className="px-4 py-2 rounded-md">Go to Home</Button>
                </Link>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      );
    }
  }
  return <>{JSON.stringify(productData)}</>;
}

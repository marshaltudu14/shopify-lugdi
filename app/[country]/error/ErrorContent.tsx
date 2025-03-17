"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { buttonHoverVariants } from "@/app/components/FramerMotion";
import Link from "next/link";

export default function ErrorContent() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="max-w-lg text-center"
      >
        <h1 className="text-5xl sm:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          OOPS!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-8">
          Sorry, something went wrong
        </p>
        <motion.div
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
          initial="initial"
        >
          <Link href={`/`}>
            <Button className="px-5 py-5 text-base sm:text-lg font-semibold">
              Go to Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

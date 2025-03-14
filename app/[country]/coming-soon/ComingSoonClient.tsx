"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Country } from "@/lib/countries";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonClientProps {
  country: Country;
}

export default function ComingSoonClient({ country }: ComingSoonClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 flex flex-col items-center justify-center px-4 py-16"
      >
        {/* Logo Placeholder */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="text-4xl md:text-5xl font-extralight text-gray-900 dark:text-white tracking-wider">
            <h1>lugdi</h1>
          </div>
          <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mt-2" />
        </motion.div>

        {/* Coming Soon Text */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-5xl md:text-7xl font-light text-gray-900 dark:text-white mb-8 tracking-tight">
            <span className="font-extrabold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Dropping Soon
            </span>{" "}
            in {country.name}
          </h1>

          <motion.div
            className="w-32 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-10"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />

          <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 max-w-2xl mx-auto mb-12 font-light tracking-wide">
            Get ready, {country.name}! We&apos;re bringing you the freshest
            designs and boldest fashion vibes—crafted for everyone with a
            passion for style.
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-lg bg-white/20 dark:bg-black/20 border border-gray-200 dark:border-white/10 max-w-md mx-auto hover:border-amber-500/30 transition-colors duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <motion.div
                  variants={pulseVariants}
                  animate="animate"
                  className="w-3 h-3 rounded-full bg-amber-500"
                />
                <p className="text-gray-900 dark:text-white font-medium text-lg tracking-wide">
                  Status
                </p>
              </div>
              <p className="text-gray-700 dark:text-white/70 text-center font-light leading-relaxed">
                We&apos;re designing the next wave of fashion for {country.name}
                . Top-tier style, made for all—coming your way soon!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Futuristic accent lines */}
        <motion.div
          className="absolute top-0 left-1/2 w-0.5 h-24 bg-gradient-to-b from-amber-500 to-transparent"
          initial={{ height: 0 }}
          animate={{ height: 96 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-0.5 h-24 bg-gradient-to-t from-amber-500 to-transparent"
          initial={{ height: 0 }}
          animate={{ height: 96 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
      </motion.div>
    </div>
  );
}

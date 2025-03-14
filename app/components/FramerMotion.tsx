"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

// Slide-up container variants for wrapping sections
export const containerVariantsSlideUp = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.2,
    },
  },
};

// Simple button hover states
export const buttonHoverVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 500, damping: 10 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

// Basic item fade-in for child elements
export const itemVariants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// An icon animation example (e.g., small bounce)
export const iconVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
      delay: 0.5,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

// Props interface for AnimatedSection
interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

// Wrap each animated section
export const AnimatedSection = ({
  children,
  delay = 0,
  className,
}: AnimatedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariantsSlideUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Props interface for AnimatedItem
interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
}

// A wrapper for each item you want to animate
export const AnimatedItem = ({
  children,
  className,
  ...props
}: AnimatedItemProps) => {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Card hover animation
export const cardHoverVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.3 },
  },
};

// Slide down/up animation
export const slideDownUp = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

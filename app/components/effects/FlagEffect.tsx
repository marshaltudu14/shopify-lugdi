"use client";

import React from "react";
import Image from "next/image"; // Using next/image for SVG
import styles from "./FlagEffect.module.css"; // CSS module for styling

const FlagEffect: React.FC = () => {
  // Could add multiple flags or position them differently if needed
  return (
    <div className={styles.flagContainer}>
      <div className={styles.flag}>
        <Image
          src="/icons/india-flag-icon.svg" // Path to the flag SVG
          alt="Flag Animation"
          width={50} // Adjust size as needed
          height={30} // Adjust size as needed
          priority
        />
      </div>
      {/* Add more flag elements here for multiple flags */}
    </div>
  );
};

export default FlagEffect;

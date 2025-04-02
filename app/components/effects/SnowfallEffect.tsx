"use client";

import React from "react";
import styles from "./SnowfallEffect.module.css"; // We'll create this CSS module next

const SnowfallEffect: React.FC = () => {
  // Generate multiple snowflake divs for a denser effect
  const snowflakes = Array.from({ length: 50 }).map((_, i) => {
    const depth = Math.random(); // Random depth value (0-1)
    return (
      <div
        key={i}
        className={styles.snowflake}
        style={
          {
            "--flake-left": `${Math.random() * 100}vw`, // Random horizontal start
            "--flake-opacity": `${Math.random()}`, // Random opacity
            "--flake-duration": `${Math.random() * 3 + 5}s`, // Random duration (5-8s)
            "--flake-delay": `${Math.random() * 5}s`, // Random delay
            "--flake-size": `${Math.random() * 3 + 2}px`, // Random size (2-5px)
            "--flake-depth": depth, // Pass depth as CSS variable
          } as React.CSSProperties // Type assertion for custom properties
        }
      />
    );
  });

  return <div className={styles.snowfallContainer}>{snowflakes}</div>;
};

export default SnowfallEffect;

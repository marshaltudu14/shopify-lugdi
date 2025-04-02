"use client";

import React from "react";
import styles from "./RainEffect.module.css"; // CSS module for styling

const RainEffect: React.FC = () => {
  // Generate multiple raindrop divs
  const raindrops = Array.from({ length: 70 }).map((_, i) => {
    const duration = Math.random() * 0.5 + 0.3; // Faster duration (0.3-0.8s)
    const delay = Math.random() * 5; // Random delay (0-5s)
    const startX = Math.random() * 100; // Random horizontal start position (vw)
    const scaleY = Math.random() * 0.5 + 1; // Random vertical scale (1 - 1.5) for streak length
    const opacity = Math.random() * 0.3 + 0.4; // Random opacity (0.4 - 0.7)

    return (
      <div
        key={i}
        className={styles.raindrop}
        style={
          {
            "--drop-start-x": `${startX}vw`,
            "--drop-duration": `${duration}s`,
            "--drop-delay": `${delay}s`,
            "--drop-scale-y": scaleY,
            "--drop-opacity": opacity,
          } as React.CSSProperties // Type assertion for custom properties
        }
      />
    );
  });

  return <div className={styles.rainContainer}>{raindrops}</div>;
};

export default RainEffect;

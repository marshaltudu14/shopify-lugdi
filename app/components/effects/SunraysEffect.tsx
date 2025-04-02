"use client";

import React from "react";
import styles from "./SunraysEffect.module.css"; // CSS module for styling

const SunraysEffect: React.FC = () => {
  // Generate multiple sunray divs
  const rays = Array.from({ length: 10 }).map((_, i) => {
    const duration = Math.random() * 4 + 6; // Random duration (6-10s)
    const delay = Math.random() * 5; // Random delay (0-5s)
    const rotation = Math.random() * 60 - 30; // Random angle (-30 to 30 deg from center)
    const scaleY = Math.random() * 0.5 + 0.8; // Random vertical scale (0.8 - 1.3)
    const originX = 50 + Math.random() * 40 - 20; // Random horizontal origin (30% to 70%)

    return (
      <div
        key={i}
        className={styles.sunray}
        style={
          {
            "--ray-duration": `${duration}s`,
            "--ray-delay": `${delay}s`,
            "--ray-rotation": `${rotation}deg`,
            "--ray-scale-y": scaleY,
            "--ray-origin-x": `${originX}%`,
          } as React.CSSProperties // Type assertion for custom properties
        }
      />
    );
  });

  return <div className={styles.sunraysContainer}>{rays}</div>;
};

export default SunraysEffect;

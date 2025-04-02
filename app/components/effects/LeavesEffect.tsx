"use client";

import React from "react";
import styles from "./LeavesEffect.module.css"; // CSS module for styling

const LeavesEffect: React.FC = () => {
  // Generate multiple leaf divs
  const leaves = Array.from({ length: 30 }).map((_, i) => {
    const duration = Math.random() * 5 + 7; // Random duration (7-12s)
    const delay = Math.random() * 10; // Random delay (0-10s)
    const startX = Math.random() * 100; // Random horizontal start position (vw)
    const swayDuration = Math.random() * 2 + 2; // Random sway duration (2-4s)
    const swayIntensity = Math.random() * 15 + 10; // Random sway intensity (10-25px)
    const rotation = Math.random() * 360; // Random initial rotation
    const scale = Math.random() * 0.5 + 0.5; // Random scale (0.5 - 1.0)

    // Add different leaf styles (optional, can use :nth-child in CSS too)
    const leafType = Math.floor(Math.random() * 3) + 1; // Example: 3 leaf types

    return (
      <div
        key={i}
        className={`${styles.leaf} ${styles[`leaf${leafType}`]}`}
        style={
          {
            "--leaf-start-x": `${startX}vw`,
            "--leaf-duration": `${duration}s`,
            "--leaf-delay": `${delay}s`,
            "--leaf-sway-duration": `${swayDuration}s`,
            "--leaf-sway-intensity": `${swayIntensity}px`,
            "--leaf-rotation": `${rotation}deg`,
            "--leaf-scale": scale,
          } as React.CSSProperties // Type assertion for custom properties
        }
      />
    );
  });

  return <div className={styles.leavesContainer}>{leaves}</div>;
};

export default LeavesEffect;

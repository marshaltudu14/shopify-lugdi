"use client";

import React from "react";
import styles from "./FireworksEffect.module.css"; // CSS module for styling

const FireworksEffect: React.FC = () => {
  // Generate multiple firework divs
  const fireworks = Array.from({ length: 15 }).map((_, i) => {
    const duration = Math.random() * 1 + 0.8; // Random duration (0.8-1.8s)
    const delay = Math.random() * 3; // Random delay (0-3s)
    const x = Math.random() * 80 + 10; // Random horizontal position (10vw-90vw)
    const y = Math.random() * 50 + 20; // Random vertical position (20vh-70vh)
    const scale = Math.random() * 0.5 + 0.7; // Random scale (0.7 - 1.2)
    // Random color - could also use theme variables if desired
    const color = `oklch(${Math.random() * 0.4 + 0.5} ${
      Math.random() * 0.2 + 0.1
    } ${Math.random() * 360})`;

    return (
      <div
        key={i}
        className={styles.particle}
        style={
          {
            "--x": `${x}vw`,
            "--y": `${y}vh`,
            "--duration": `${duration}s`,
            "--delay": `${delay}s`,
            "--scale": scale,
            "--color": color,
          } as React.CSSProperties
        }
      />
    );
  });

  return <div className={styles.fireworksContainer}>{fireworks}</div>;
};

export default FireworksEffect;

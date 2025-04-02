"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { useParams } from "next/navigation";
import { getActiveTheme } from "@/lib/theme-utils";
import { ThemeEntry } from "@/lib/theme-config";
// Removed unused cn import

// Import animation components (adjust paths if necessary)
import SnowfallEffect from "./effects/SnowfallEffect";
import LeavesEffect from "./effects/LeavesEffect";
import SunraysEffect from "./effects/SunraysEffect";
import RainEffect from "./effects/RainEffect";
import FireworksEffect from "./effects/FireworksEffect"; // Import Fireworks
import FlagEffect from "./effects/FlagEffect"; // Import Flag
// Import DiyasEffect when created

// Define the shape of the context data
interface ThemeContextProps {
  logoDecorationClass: string | null;
  activeTheme: ThemeEntry | null; // Also provide the full theme object if needed elsewhere
}

// Create the context (we'll export this)
export const ThemeContext = React.createContext<ThemeContextProps>({
  logoDecorationClass: null,
  activeTheme: null,
});

interface ThemeApplicatorProps {
  children: ReactNode;
}

const ThemeApplicator: React.FC<ThemeApplicatorProps> = ({ children }) => {
  const params = useParams();
  const country = params.country as string | undefined; // Get country slug

  const [activeTheme, setActiveTheme] = useState<ThemeEntry | null>(null);
  const [logoDecorationClass, setLogoDecorationClass] = useState<string | null>(
    null
  );
  const [currentThemeClass, setCurrentThemeClass] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (country) {
      const theme = getActiveTheme(country);
      setActiveTheme(theme);
      const newThemeClass = theme?.themeClass || null;
      const newLogoDecoClass = theme?.logoDecorationClass || null;

      // Update body class
      if (newThemeClass !== currentThemeClass) {
        if (currentThemeClass) {
          document.body.classList.remove(currentThemeClass);
        }
        if (newThemeClass) {
          document.body.classList.add(newThemeClass);
        }
        setCurrentThemeClass(newThemeClass);
      }

      // Update logo decoration class state for context
      setLogoDecorationClass(newLogoDecoClass);
    } else {
      // Handle case where country param is not available (e.g., root page?)
      // Reset theme if needed
      if (currentThemeClass) {
        document.body.classList.remove(currentThemeClass);
        setCurrentThemeClass(null);
      }
      setActiveTheme(null);
      setLogoDecorationClass(null);
    }
    // Dependency array includes country to re-run when URL changes
  }, [country, currentThemeClass]);

  // Conditionally render animation based on active theme state
  const renderAnimation = () => {
    switch (activeTheme?.animation) {
      case "snowfall":
        return <SnowfallEffect />;
      case "leaves":
        return <LeavesEffect />;
      case "sunrays":
        return <SunraysEffect />;
      case "rain":
        return <RainEffect />;
      case "fireworks":
        return <FireworksEffect />;
      case "flag":
        return <FlagEffect />;
      // Add case for "diyas" when component exists
      default:
        return null;
    }
  };

  return (
    <ThemeContext.Provider value={{ logoDecorationClass, activeTheme }}>
      {children}
      {renderAnimation()}
    </ThemeContext.Provider>
  );
};

export default ThemeApplicator;

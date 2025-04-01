// lib/theme-utils.ts
import { themeConfig, ThemeEntry, ThemeConfig } from "./theme-config";
// Removed unused import: import { countries } from "./countries";

/**
 * Determines the active theme based on current date and country code.
 *
 * @param countryCode - The lowercase country code slug (e.g., "in", "us").
 * @param config - The theme configuration object (defaults to imported themeConfig).
 * @returns The active ThemeEntry object or null if no theme is active.
 */
export function getActiveTheme(
  countryCode: string,
  config: ThemeConfig = themeConfig
): ThemeEntry | null {
  const currentDate = new Date();
  // Set hours to 0 to compare dates only, ignoring time
  currentDate.setHours(0, 0, 0, 0);

  // Iterate through themes - the first match based on order in config wins
  for (const theme of config.themes) {
    try {
      const startDate = new Date(theme.startDate);
      startDate.setHours(0, 0, 0, 0); // Compare date part only
      const endDate = new Date(theme.endDate);
      endDate.setHours(23, 59, 59, 999); // End date is inclusive

      // 1. Check Date Range
      if (currentDate >= startDate && currentDate <= endDate) {
        // 2. Check Country Targeting
        let countryMatch = false;
        if (theme.targetCountries === "global") {
          // Check if country is NOT excluded
          if (
            !theme.excludeCountries ||
            !theme.excludeCountries.includes(countryCode)
          ) {
            countryMatch = true;
          }
        } else if (
          Array.isArray(theme.targetCountries) &&
          theme.targetCountries.includes(countryCode)
        ) {
          // Check if country is included in the target list
          countryMatch = true;
        }
        // TODO: Add Hemisphere logic here if needed in the future
        // else if (theme.targetHemisphere) { ... }

        if (countryMatch) {
          // Found the first active and matching theme for this country
          return theme;
        }
      }
    } catch (e) {
      console.error(`Error processing theme "${theme.id}":`, e);
      // Skip this theme if dates are invalid
      continue;
    }
  }

  // No active theme found for this date and country
  return null;
}

// Example Usage (can be removed or kept for testing):
// const today = new Date();
// const currentCountry = 'in'; // Example
// const activeTheme = getActiveTheme(currentCountry);
// console.log(`Active theme for ${currentCountry} on ${today.toDateString()}:`, activeTheme?.name || 'None');

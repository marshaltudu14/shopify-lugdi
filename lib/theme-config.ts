// lib/theme-config.ts

// Define the structure for a single theme entry
export interface ThemeEntry {
  id: string; // Unique identifier (e.g., "diwali-2025")
  type: "festival" | "national_day" | "season" | "promotion"; // Type of theme
  name: string; // Display name (e.g., "Diwali")
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format (inclusive)
  targetCountries?: string[] | "global"; // Array of country slugs (lowercase) or "global"
  excludeCountries?: string[]; // Optional: Array of country slugs to exclude
  // targetHemisphere?: "north" | "south"; // Optional: For seasons - Not currently used in logic
  themeClass: string; // CSS class to apply (e.g., "theme-diwali")
  // headerMessage removed
  bannerAsset?: string; // Optional: Path to a specific banner image
  animation?:
    | "snowfall"
    | "fireworks"
    | "leaves"
    | "diyas"
    | "flag"
    | "sunrays"
    | "rain";
  // Removed logoAsset props
  logoDecorationClass?: string | null; // Optional class for logo decoration
}

// Define the structure for the overall configuration
export interface ThemeConfig {
  year: number;
  themes: ThemeEntry[];
}

// --- Lists of Countries by Hemisphere (Approximate) ---
const northernHemisphereCountries: string[] = [
  "in",
  "af",
  "ax",
  "al",
  "dz",
  "ad",
  "ai",
  "ag",
  "am",
  "aw",
  "at",
  "az",
  "bs",
  "bh",
  "bd",
  "bb",
  "by",
  "be",
  "bz",
  "bj",
  "bm",
  "bt",
  "ba",
  "vg",
  "bn",
  "bg",
  "bf",
  "kh",
  "cm",
  "ca",
  "cv",
  "bq",
  "ky",
  "cf",
  "td",
  "cn",
  "co",
  "ci",
  "hr",
  "cu",
  "cw",
  "cy",
  "cz",
  "dk",
  "dj",
  "dm",
  "do",
  "eg",
  "sv",
  "gq",
  "er",
  "ee",
  "et",
  "fo",
  "fi",
  "fr",
  "gf",
  "gm",
  "ge",
  "de",
  "gh",
  "gi",
  "gr",
  "gl",
  "gd",
  "gp",
  "gt",
  "gg",
  "gn",
  "gw",
  "gy",
  "ht",
  "hn",
  "hk",
  "hu",
  "is",
  "id",
  "ir",
  "iq",
  "ie",
  "im",
  "il",
  "it",
  "jm",
  "jp",
  "je",
  "jo",
  "kz",
  "ke",
  "kp",
  "xk",
  "kw",
  "kg",
  "la",
  "lv",
  "lb",
  "lr",
  "ly",
  "li",
  "lt",
  "lu",
  "mo",
  "my",
  "mv",
  "ml",
  "mt",
  "mq",
  "mr",
  "mx",
  "md",
  "mc",
  "mn",
  "me",
  "ms",
  "ma",
  "mm",
  "np",
  "nl",
  "ni",
  "ne",
  "ng",
  "mk",
  "no",
  "om",
  "pk",
  "ps",
  "pa",
  "ph",
  "pl",
  "pt",
  "qa",
  "re",
  "ro",
  "ru",
  "rw",
  "sm",
  "st",
  "sa",
  "sn",
  "rs",
  "sl",
  "sg",
  "sx",
  "sk",
  "si",
  "so",
  "kr",
  "ss",
  "es",
  "lk",
  "bl",
  "sh",
  "kn",
  "lc",
  "mf",
  "pm",
  "vc",
  "sd",
  "sr",
  "sj",
  "se",
  "ch",
  "sy",
  "tw",
  "tj",
  "th",
  "tl",
  "tg",
  "tt",
  "ta",
  "tn",
  "tr",
  "tm",
  "tc",
  "ug",
  "ua",
  "ae",
  "gb",
  "us",
  "um",
  "uz",
  "va",
  "ve",
  "vn",
  "eh",
  "ye",
  "zz",
];

const southernHemisphereCountries: string[] = [
  "au",
  "ao",
  "ar",
  "ac",
  "bo",
  "bw",
  "bv",
  "br",
  "io",
  "cl",
  "cx",
  "cc",
  "km",
  "cg",
  "cd",
  "ck",
  "ec",
  "sz",
  "fk",
  "fj",
  "pf",
  "tf",
  "ga",
  "hm",
  "ki",
  "ls",
  "mg",
  "mw",
  "mu",
  "yt",
  "mz",
  "na",
  "nr",
  "nc",
  "nz",
  "nu",
  "nf",
  "pg",
  "py",
  "pe",
  "pn",
  "ws",
  "sc",
  "za",
  "gs",
  "tz",
  "tk",
  "to",
  "tv",
  "uy",
  "vu",
  "wf",
  "zm",
  "zw",
];

// --- Main Theme Configuration ---
// Remember to update dates annually for variable festivals!
export const themeConfig: ThemeConfig = {
  year: 2025, // Update this year as needed
  themes: [
    // --- Festivals ---
    {
      id: "diwali-2025",
      type: "festival",
      name: "Diwali",
      startDate: "2025-10-21", // Example date - PLEASE VERIFY FOR 2025
      endDate: "2025-10-25", // Example date - PLEASE VERIFY FOR 2025
      targetCountries: ["in"],
      themeClass: "theme-diwali",
      // headerMessage removed
      bannerAsset: "/banners/diwali_banner.webp", // Example path
      animation: "diyas", // Example animation type
      logoDecorationClass: "logo-decorate-diya",
    },
    {
      id: "holi-2026", // Added Holi
      type: "festival",
      name: "Holi",
      startDate: "2026-03-14", // Placeholder Date - Verify!
      endDate: "2026-03-15", // Placeholder Date - Verify!
      targetCountries: ["in"],
      themeClass: "theme-holi",
      animation: undefined, // Changed null to undefined
      logoDecorationClass: "logo-decorate-holi",
    },
    {
      id: "eid-al-fitr-2026", // Added Eid
      type: "festival",
      name: "Eid al-Fitr",
      startDate: "2026-03-21", // Placeholder Date - Verify!
      endDate: "2026-03-23", // Placeholder Date - Verify!
      targetCountries: ["in"], // Add more countries if applicable
      themeClass: "theme-eid",
      animation: undefined, // Changed null to undefined
      logoDecorationClass: "logo-decorate-eid",
    },
    {
      id: "christmas-2025",
      type: "festival",
      name: "Christmas",
      startDate: "2025-12-20", // Start promo period early
      endDate: "2025-12-26",
      targetCountries: "global", // Apply globally by default
      // excludeCountries: [], // Can exclude specific countries if needed
      themeClass: "theme-christmas",
      // headerMessage removed
      bannerAsset: "/banners/christmas_banner.webp", // Example path
      animation: "snowfall", // Example animation type
      logoDecorationClass: "logo-decorate-snowflake",
    },
    {
      id: "new-year-2026", // Added New Year
      type: "festival",
      name: "New Year",
      startDate: "2025-12-31",
      endDate: "2026-01-01",
      targetCountries: "global",
      themeClass: "theme-new-year",
      animation: "fireworks", // Needs component
      logoDecorationClass: "logo-decorate-firework",
    },
    {
      id: "valentine-2026", // Added Valentine's
      type: "festival",
      name: "Valentine's Day",
      startDate: "2026-02-10",
      endDate: "2026-02-14",
      targetCountries: "global",
      themeClass: "theme-valentine",
      animation: undefined, // Changed null to undefined
      logoDecorationClass: "logo-decorate-heart",
    },
    // --- National Days ---
    {
      id: "india-republic-day-2026", // Added Republic Day
      type: "national_day",
      name: "India Republic Day",
      startDate: "2026-01-26",
      endDate: "2026-01-26",
      targetCountries: ["in"],
      themeClass: "theme-india-republic",
      animation: "flag", // Needs component
      logoDecorationClass: "logo-decorate-flag-in",
    },
    {
      id: "india-independence-2025",
      type: "national_day",
      name: "India Independence Day",
      startDate: "2025-08-15",
      endDate: "2025-08-15",
      targetCountries: ["in"],
      themeClass: "theme-india-independence",
      // headerMessage removed
      bannerAsset: "/banners/india_independence_banner.webp", // Example path
      animation: "flag", // Example animation type
      logoDecorationClass: "logo-decorate-flag-in", // Added decoration class
    },
    // --- Seasons ---
    // Northern Hemisphere Spring / Southern Hemisphere Autumn (Mar 1 - May 31)
    {
      id: "march-may-north-spring",
      type: "season",
      name: "Spring",
      startDate: "2025-03-01",
      endDate: "2025-05-31",
      targetCountries: northernHemisphereCountries,
      themeClass: "theme-spring",
      // headerMessage removed
      animation: "leaves", // Example: gentle green leaves?
      logoDecorationClass: "logo-decorate-leaf", // Added decoration class
    },
    {
      id: "march-may-south-autumn",
      type: "season",
      name: "Autumn",
      startDate: "2025-03-01",
      endDate: "2025-05-31",
      targetCountries: southernHemisphereCountries,
      themeClass: "theme-autumn",
      // headerMessage removed
      animation: "leaves",
      logoDecorationClass: "logo-decorate-leaf", // Added decoration class
    },
    // Northern Hemisphere Summer / Southern Hemisphere Winter (Jun 1 - Aug 31)
    {
      id: "june-aug-north-summer",
      type: "season",
      name: "Summer",
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      targetCountries: northernHemisphereCountries,
      themeClass: "theme-summer",
      // headerMessage removed
      animation: "sunrays",
      logoDecorationClass: "logo-decorate-sun", // Added decoration class
    },
    {
      id: "june-aug-south-winter",
      type: "season",
      name: "Winter",
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      targetCountries: southernHemisphereCountries,
      themeClass: "theme-winter",
      // headerMessage removed
      animation: "snowfall",
      logoDecorationClass: "logo-decorate-snowflake", // Added decoration class
    },
    // Northern Hemisphere Autumn / Southern Hemisphere Spring (Sep 1 - Nov 30)
    {
      id: "sep-nov-north-autumn",
      type: "season",
      name: "Autumn",
      startDate: "2025-09-01",
      endDate: "2025-11-30",
      targetCountries: northernHemisphereCountries,
      themeClass: "theme-autumn",
      // headerMessage removed
      animation: "leaves",
      logoDecorationClass: "logo-decorate-leaf", // Added decoration class
    },
    {
      id: "sep-nov-south-spring",
      type: "season",
      name: "Spring",
      startDate: "2025-09-01",
      endDate: "2025-11-30",
      targetCountries: southernHemisphereCountries,
      themeClass: "theme-spring",
      // headerMessage removed
      animation: "leaves", // Example: gentle green leaves?
      logoDecorationClass: "logo-decorate-leaf", // Added decoration class
    },
    // Northern Hemisphere Winter / Southern Hemisphere Summer (Dec 1 - Feb 28/29)
    {
      id: "dec-feb-north-winter",
      type: "season",
      name: "Winter",
      startDate: "2025-12-01",
      endDate: "2026-02-29", // Account for leap year potentially
      targetCountries: northernHemisphereCountries,
      themeClass: "theme-winter",
      // headerMessage removed
      animation: "snowfall",
      logoDecorationClass: "logo-decorate-snowflake", // Added decoration class
    },
    {
      id: "dec-feb-south-summer",
      type: "season",
      name: "Summer",
      startDate: "2025-12-01",
      endDate: "2026-02-29", // Account for leap year potentially
      targetCountries: southernHemisphereCountries,
      themeClass: "theme-summer",
      // headerMessage removed
      animation: "sunrays",
      logoDecorationClass: "logo-decorate-sun", // Added decoration class
    },
    // Remember to verify festival dates annually.
  ],
};

# System Patterns: Lugdi Storefront (April 2025 Update)

## 1. Architecture Overview

- **Frontend Framework:** Next.js App Router architecture. Server Components for data fetching, Client Components for interactivity.
- **Backend:** Headless Shopify via Storefront GraphQL API.
- **API Communication:** GraphQL via Apollo Client. REST APIs for internal routes if needed.
- **Global Context:** `ApolloWrapper`, `ThemeProvider`, `WishlistProvider` in root layout.
- **Theme Management:** `next-themes` library with `ThemeProvider` in root layout, `ThemeSwitcher` component in headers.

## 2. Key Design Patterns

- **Component Model:** Reusable components, Shadcn/ui, some Atomic Design principles.
- **State Management:**
  - **Cart:** React Context, encrypted country-specific localStorage, Shopify GraphQL mutations.
  - **Wishlist:** React Context, unencrypted localStorage.
  - **Global State:** React Context only.
  - **Local State:** React `useState`, `useEffect`.
- **Data Fetching:**
  - **Server Components:** For initial page loads.
  - **Client Components:** Apollo Client for dynamic data.
  - **GraphQL:** Fragments, `@inContext(country: $country)` directive.
- **Routing:** Next.js App Router with dynamic segments for countries, products, collections, search, cart, etc.
- **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`, `class-variance-authority`.
- **Sitemap Generation:** Catch-all API route (`app/sitemap/[[...sitemapSlug]]/route.ts`) proxies Shopify sitemaps, rewrites URLs, adds `/sitemap/` prefix to sub-sitemaps.
- **Internationalization (i18n):**
  - URL-based country detection (`/[country]/`).
  - Dynamic metadata and `lang` attribute based on country.
  - Country code passed in API requests.
  - Country configs in `lib/countries.ts`. **Only India is active.**
  - **Middleware (`middleware.ts`) always forces fallback to India if the detected country is inactive or unknown.**
  - Middleware sets cookies, enforces `/[country]/...` URL structure.
  - Middleware excludes static assets, API routes, and sitemap XML files from processing.

## 3. Important Implementation Paths

- **Product Display:** GraphQL fetch, rendered via `ProductCard`.
- **Collection Pages:** GraphQL fetch, no filtering.
- **Search Pages:** GraphQL fetch, no filtering.
- **Cart Operations:** Managed in `CartContext.tsx`, encrypted localStorage, Shopify GraphQL.
- **Country Selection/Routing:**
  - Middleware detects country via cookie or IP.
  - **Always falls back to India if country is inactive or unknown.**
  - Enforces URL normalization.
  - No longer redirects to `/coming-soon`.
  - `CountriesCombobox.tsx` for manual selection.
- **Authentication:** Middleware protects `/account`, refreshes tokens, redirects to `/login` if invalid.

## 4. Security Considerations

- **Cart Persistence:** Encrypted localStorage with environment key.
- **API Keys:** Managed via environment variables.
- **Authentication:** Shopify Customer Account API tokens in secure cookies, refresh handled in middleware.

## 5. Code Organization

- **App Router:** Features in `app/` directory.
- **Components:** UI in `app/components/` and `components/`.
- **Lib:** API logic, Apollo setup, types, size charts.
- **Size Chart Mapping:**
  - `lib/sizeCharts.ts` for data.
  - `lib/sizeChartProductTypeMap.ts` for mapping.
  - Modal popup with Shadcn UI `Dialog`.
- **Utilities:** In `utils/`.
- **Styling:** Global in `app/globals.css`, Tailwind classes, custom fonts via `next/font/local`.

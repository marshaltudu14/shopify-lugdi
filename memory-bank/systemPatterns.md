# System Patterns: Lugdi Storefront

## 1. Architecture Overview

- **Frontend Framework:** Next.js App Router architecture. Leverages Server Components for data fetching and rendering where possible, and Client Components (`"use client"`) for interactivity (e.g., cart, UI elements).
- **Backend:** Headless Shopify via Storefront GraphQL API. The Next.js app acts as the presentation layer.
- **API Communication:** Primarily GraphQL via Apollo Client (wrapped globally in `ApolloWrapper`). REST APIs might be used for other purposes if needed (e.g., internal API routes).
- **Global Context:** Uses `ApolloWrapper`, `ThemeProvider` (`next-themes`), and `WishlistProvider` in the root layout (`app/layout.tsx`).

## 2. Key Design Patterns

- **Component Model:** Utilizes reusable components, likely following Atomic Design principles to some extent, leveraging Shadcn/ui components.
- **State Management:**
  - **Cart:** Managed via `CartContext` (`app/[country]/cart/CartContext.tsx`). Uses React state and persists to country-specific `localStorage` key after encryption (`CryptoJS.AES`). Interacts directly with Shopify GraphQL mutations via Apollo Client for all operations (create, add, remove, update, fetch, discount codes).
  - **Wishlist:** Managed via `WishlistContext` (`lib/contexts/WishlistContext.tsx`). Uses React state and persists an array of variant IDs directly to `localStorage` (key: `lugdi_wishlist_v1`, no encryption). Provided globally via `WishlistProvider`.
  - **Global State:** Relies solely on React Context (Cart, Wishlist) and local component state.
  - **Local State:** Standard React `useState` and `useEffect` for component-level state.
- **Data Fetching:**
  - **Server Components:** Likely used for initial page loads, fetching data directly on the server (e.g., product details, collection pages).
  - **Client Components:** Apollo Client (`useQuery`, `useMutation`, `useApolloClient`) used for dynamic data fetching and mutations triggered by user interactions (e.g., cart operations).
  - **GraphQL:** Queries utilize fragments (e.g., `ImageFragment`, `MoneyFragment` from `lib/fragments.ts`) for reusability and the `@inContext(country: $country)` directive for fetching country-specific data (likely via Shopify Markets).
- **Routing:** Next.js App Router with dynamic segments for internationalization (`/[country]/...`) and specific resources (`/collections/[collectionSlug]`, `/products/[productSlug]`).
- **Styling:** Utility-first CSS with Tailwind CSS, managed via `clsx`, `tailwind-merge`, and potentially `class-variance-authority`.
- **Sitemap Generation:** A dynamic sitemap proxy is implemented using a catch-all API Route Handler (`app/sitemap/[[...sitemapSlug]]/route.ts`). This handler intercepts requests for any path starting with `/sitemap` and ending with `.xml` (e.g., `/sitemap.xml`, `/sitemap_pages_1.xml`). It fetches the corresponding sitemap file from `https://shop.lugdi.store`, replaces all occurrences of `https://shop.lugdi.store` with the current site's URL (`process.env.NEXT_PUBLIC_SITE_URL`), and **adds a `/sitemap/` prefix only to `<loc>` URLs ending with `.xml`**. This ensures sub-sitemap URLs are correctly routed while product/page URLs remain unchanged. This approach simplifies generation by leveraging the existing Shopify sitemap structure while serving it under the current domain.
- **Internationalization (i18n):**
  - URL-based country detection (`/[country]/`).
  - Dynamic metadata (`generateMetadata` in `app/layout.tsx`) and `lang` attribute generation based on country parameter.
  - Country code passed in API requests (`CartContext.tsx`).
  - Country configuration (including active status, currency, language, banners) managed in `lib/countries.ts`. Currently, only 'in' (India) is active.
  - Middleware (`middleware.ts`) handles country detection (cookie `lugdi_location` or `x-vercel-ip-country` header), sets cookies (`lugdi_location`, `lugdi_location_name`), redirects inactive countries to `/coming-soon`, and enforces `/[country]/...` URL structure based on active countries defined in `lib/countries.ts`. The middleware's `config.matcher` is configured to exclude static assets, API routes, and sitemap XML files (`sitemap*.xml`) from its processing.

## 3. Important Implementation Paths

- **Product Display:** Fetching product data via GraphQL (likely using Server Components) and rendering using components like `ProductCard.tsx`.
- **Collection Pages:** Similar to products, fetching collection data and associated products. Product filtering functionality has been removed from these pages.
- **Search Pages:** Fetching products based on a query term. Product filtering functionality has been removed from these pages.
- **Cart Operations:** Handled entirely within `CartContext.tsx`, including state updates, persistence, and direct interaction with Shopify GraphQL mutations (create, add, remove, update, fetch, discount codes).
- **Country Selection/Routing:** Middleware (`middleware.ts`) handles country detection (cookie/IP), sets cookies, redirects inactive countries to `/coming-soon`, enforces `/[country]/` structure. `CountriesCombobox.tsx` likely allows manual override/selection.

## 4. Security Considerations

- **Cart Persistence:** Client-side cart data stored in a country-specific `localStorage` key. Data is encrypted using `CryptoJS.AES` with a key from environment variables (`NEXT_PUBLIC_CART_ENCRYPTION_KEY`).
- **API Keys:** Shopify Storefront API keys and other secrets should be securely managed via environment variables.
- **Authentication:** Custom implementation in `middleware.ts` protects routes starting with `/account`. It validates Shopify Customer Account API tokens (`lugdi_shopify_access_token`, `lugdi_shopify_refresh_token`, `lugdi_shopify_expires_at` stored in secure, httpOnly cookies), handles token refresh using the refresh token, and redirects to `/login` if authentication fails or tokens are missing/invalid. `next-auth` dependency was removed.

## 5. Code Organization

- **App Router Structure:** Features organized within the `app/` directory, often using route groups or nested folders.
- **Components:** Reusable UI elements in `app/components/` and `components/` (likely Shadcn UI).
- **Lib:** Core logic, utilities, API definitions (`lib/queries`, `lib/mutations`), Apollo setup (`lib/apollo`), type definitions (`lib/types`).
- **Size Chart Mapping:** 
  - `lib/sizeCharts.ts` contains country-specific size chart data.
  - `lib/sizeChartProductTypeMap.ts` maps **multiple product types** to a single size chart key.
  - The product page dynamically determines which size chart to show based on this mapping.
- **Size Chart UI:**
  - The size chart is displayed in a **modal popup** using Shadcn UI `Dialog`.
  - The "Size Chart" button is styled with ghost variant, blue color, and cursor-pointer.
  - The selected size's measurements are always shown inline.
- **Utilities:** Helper functions in `utils/`.
- **Styling:** Global styles in `app/globals.css`, component-level styling via Tailwind classes. Custom fonts loaded via `next/font/local` in `app/layout.tsx`.

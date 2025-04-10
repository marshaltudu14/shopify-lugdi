# Project Progress: Lugdi Storefront (April 2025 Update)

## 1. What Works / Implemented Features

- **Core Setup:** Next.js project with TypeScript, Tailwind CSS, Shadcn/ui.
- **Routing:** App Router with dynamic routes for countries, products, collections, search, cart, etc.
- **Basic Layout:** Global Header, Footer, ThemeProvider, ApolloWrapper. Custom fonts. Dynamic metadata based on country.
- **Theming:** Simplified to standard black & white light/dark modes. Removed seasonal/festival themes.
- **Cart System:** Client-side cart with React Context, encrypted country-specific localStorage. Shopify GraphQL integration. Quantity limits, toasts.
- **Internationalization:** 
  - URL-based routing (`/[country]/`).
  - **Only India (`/in`) is active.**
  - Middleware **forces all visitors to India storefront** if their country is inactive or unknown.
  - Country code used in layout and cart API calls.
  - `CountriesCombobox.tsx` exists.
- **Component Structure:** Shadcn and custom components (`ProductCard`, `BannerCarousel`). Client components for Cart, Product, Collection, Search, Wishlist. Footer uses base theme. Product images standardized. Discount badge updated.
- **API Integration:** Apollo Client with Shopify Storefront API (cart, products, collections, menus, policies, wishlist). `/api/graphql` route exists.
- **Wishlist:** Client-side wishlist with React Context, unencrypted localStorage. Uses `ProductCard`.
- **Sitemap:** Refactored to a catch-all API route (`app/[...sitemap]/route.ts`) proxying Shopify sitemaps. Middleware excludes these paths.

## 2. What's Left to Build / Verify

- **Feature Completeness:** Verify:
  - Collection Pages
  - Search Results Page
  - Homepage content (`app/page.tsx`)
  - Country selection UI (`CountriesCombobox.tsx`)
  - Error handling pages/logic
- **Checkout Flow:** Confirm cart → Shopify checkout transition.
- **Authentication:** Custom Shopify Customer Account API token flow protects `/account`. Token refresh works. `next-auth` removed.
- **Shopify Backend Sync:** Ensure frontend reflects Shopify data (products, inventory, pricing).
- **Footer Links:** Policy links are hardcoded, update or fetch dynamically later.
- **Testing:** Define and implement unit, integration, e2e tests.
- **Deployment:** Configure deployment and CI/CD.
- **Optimization:** Performance tuning (images, code splitting, caching).

## 3. Current Status

- Middleware **simplified**:
  - **Always redirects to India storefront** for all visitors.
  - **"Coming soon" feature and pages removed.**
  - No redirects to `/coming-soon` anymore.
- Internationalization is **India-only** for now.
- Sitemap refactoring complete.
- No known issues with country detection or redirects.
- Ready for further feature development or international expansion in future.

## 4. Known Issues / Blockers

- None identified currently.

## 5. Evolution of Decisions

- Removed dynamic/seasonal themes.
- Simplified cart and wishlist.
- Removed unused dependencies (`next-auth`, `zustand`, etc.).
- Refactored sitemap to catch-all proxy.
- **Removed "coming soon" feature and redirects.**
- Middleware now **forces fallback to India** for all visitors.

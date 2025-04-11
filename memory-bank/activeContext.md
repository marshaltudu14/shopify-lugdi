# Active Context: Lugdi Storefront (Post-Codebase Scan)

## 1. Current Focus

- Refactoring sitemap generation.
- Simplifying internationalization logic to India-only storefront.

## 2. Recent Changes

- **Merchant Listings Structured Data Update (April 2025):**
  - Updated JSON-LD structured data for both product (`app/[country]/products/[productSlug]/page.tsx`) and collection (`app/[country]/collections/[collectionSlug]/page.tsx`) pages to address Google Merchant Center and Search Console warnings.
  - Added `hasMerchantReturnPolicy` (using refund policy) and `shippingDetails` (localized, with policy link) to all offers in both product and collection structured data.
  - Ensured `description` is present for all products in both product and collection structured data.
  - Updated Shopify GraphQL fragments and queries to fetch `description` and `seo` for collection products.
  - Updated TypeScript types to match new data requirements.
  - No breaking changes to other files; changes are isolated to structured data output for SEO and Merchant Center.
- **Product Structured Data Update (April 2025):**
  - Updated JSON-LD structured data for product pages (`app/[country]/products/[productSlug]/page.tsx`) to address Google Search Console warnings.
  - Added `priceValidUntil` (current date + 30 days) to both `AggregateOffer` and each `Offer` in the schema.
  - Confirmed no review or rating fields are present, as Lugdi does not support product reviews.
  - No breaking changes to other files; change is isolated to structured data output for SEO.
- **Dependency Cleanup:** Uninstalled unused libraries (`next-auth`, `zustand`, `google-auth-library`, `nodemailer`). Downgraded React to v18.
- **File Cleanup:** Deleted unused files related to removed themes and features (`lib/types/next-auth.d.ts`, `lib/theme-config.ts`, `lib/theme-utils.ts`, `app/components/ProductFilters.tsx`, `app/components/collection/CollectionFilters.tsx`, `components/theme-switcher.tsx`).
- **Previous Changes (Confirmed by Scan):**
  - Filter logic removed from Collection/Search pages.
  - Seasonal/Festival theme system removed.
  - Styling updates (coupon bar, product image aspect ratio, discount badge) applied.
  - Wishlist page uses `ProductCard`.
- **Sitemap Refactoring:** Replaced complex, multi-file sitemap generation with a catch-all dynamic API route (`app/[...sitemap]/route.ts`) that proxies and modifies any requested sitemap file (`sitemap*.xml`) from the Shopify store (`shop.lugdi.store`). Updated middleware matcher to exclude these files.
- **Country Middleware Update (April 2025):**
  - Middleware now **forces all visitors to India storefront** (`/in`) if their detected country is not active or unknown.
  - The **"coming soon" feature and pages have been fully removed**.
  - All redirects to `/coming-soon` have been eliminated.
  - The storefront is now **India-only** until more countries are activated in the future.

## 3. Next Steps

- Validate product and collection structured data using Google's Rich Results and Merchant Listings Test tools.
- Update `progress.md`.
- Await further instructions.

## Size Chart Feature (April 2025)

- Size charts are country-specific (currently India only).
- Size charts are mapped to product types via an isolated mapping file (`lib/sizeChartProductTypeMap.ts`).
- The mapping supports **multiple product types per size chart**.
- The size chart is displayed **only if** the product type matches the mapping.
- The size chart is shown in a **modal popup** using Shadcn UI `Dialog`.
- The "Size Chart" button is styled with ghost variant, blue color, and cursor-pointer.
- The selected size's measurements are always shown inline below the size options.
- The size chart data itself is isolated in `lib/sizeCharts.ts` for easy updates.
- The implementation is extensible for other countries and product types.

## 4. Active Decisions & Considerations

- **Theme Simplification:** Confirmed removal of dynamic theme system; relies on base light/dark modes.
- **Component Reusability:** Confirmed `ProductCard` usage in Wishlist.
- **State Management:** Confirmed reliance on React Context for Cart (encrypted localStorage, country-specific) and Wishlist (unencrypted localStorage). Zustand removed.
- **Authentication:** Confirmed custom Shopify Customer Account API token implementation in `middleware.ts`. `next-auth` removed.
- **Middleware:** 
  - Handles country detection via cookie or IP.
  - **Always falls back to India if the country is not active or unknown.**
  - Handles authentication token refresh.
  - Excludes sitemap XML files (`sitemap*.xml`) from processing.
- **GraphQL Usage:** Confirmed use of fragments and `@inContext` directive for Shopify API interactions.
- **Sitemap:** Simplified sitemap generation. Now uses a catch-all dynamic API route (`app/[...sitemap]/route.ts`) to proxy and modify any requested sitemap file (`sitemap*.xml`) from the Shopify store (`shop.lugdi.store`), replacing the domain before serving. Removed previous multi-file implementation.

## 5. Important Patterns & Preferences

- **Internationalization:** URL-based routing (`/[country]/`) remains a core pattern, but currently only India is active.
- **Styling:** Heavy reliance on Tailwind CSS and Shadcn/ui components, now simplified to base light/dark themes.
- **API:** GraphQL via Apollo Client for Shopify interaction.
- **Cart State:** Client-side management via React Context with country-specific encrypted `localStorage` persistence.
- **Wishlist State:** Client-side management via React Context with unencrypted `localStorage` persistence.
- **Git Workflow:** **CRITICAL RULE:** NEVER commit to or push to the `master` branch without explicit user approval. Always work on feature branches or `develop`.

## 6. Learnings & Insights

- The codebase reflects recent refactoring (theme removal, filter removal).
- State management is handled consistently via React Context.
- Middleware now simplifies routing by forcing India fallback.
- GraphQL queries are structured using fragments and context directives.

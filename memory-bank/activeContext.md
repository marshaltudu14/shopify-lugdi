# Active Context: Lugdi Storefront (Post-Codebase Scan)

## 1. Current Focus

- Implemented dynamic, country-specific sitemaps using Next.js metadata conventions.

## 2. Recent Changes

- **Dependency Cleanup:** Uninstalled unused libraries (`next-auth`, `zustand`, `google-auth-library`, `nodemailer`). Downgraded React to v18.
- **File Cleanup:** Deleted unused files related to removed themes and features (`lib/types/next-auth.d.ts`, `lib/theme-config.ts`, `lib/theme-utils.ts`, `app/components/ProductFilters.tsx`, `app/components/collection/CollectionFilters.tsx`, `components/theme-switcher.tsx`).
- **Previous Changes (Confirmed by Scan):**
  - Filter logic removed from Collection/Search pages.
  - Seasonal/Festival theme system removed.
  - Styling updates (coupon bar, product image aspect ratio, discount badge) applied.
  - Wishlist page uses `ProductCard`.

## 3. Next Steps

- Commit sitemap changes locally.
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
- **Middleware:** Confirmed logic for country detection/redirection (cookie/IP, active country check, `/coming-soon` redirect) and authentication token handling.
- **GraphQL Usage:** Confirmed use of fragments and `@inContext` directive for Shopify API interactions.
- **Sitemap:** Implemented dynamic, country-specific sitemaps using Next.js metadata conventions (`app/sitemap.ts`, `app/[country]/sitemap.ts`, `app/[country]/[resource]/sitemap.ts`). Removed chunking due to complexity and low item count. Fetches data dynamically from Shopify Storefront API with pagination.

## 5. Important Patterns & Preferences

- **Internationalization:** URL-based routing (`/[country]/`) remains a core pattern.
- **Styling:** Heavy reliance on Tailwind CSS and Shadcn/ui components, now simplified to base light/dark themes.
- **API:** GraphQL via Apollo Client for Shopify interaction.
- **Cart State:** Client-side management via React Context with country-specific encrypted `localStorage` persistence.
- **Wishlist State:** Client-side management via React Context with unencrypted `localStorage` persistence.
- **Git Workflow:** **CRITICAL RULE:** NEVER commit to or push to the `master` branch without explicit user approval. Always work on feature branches or `develop`.

## 6. Learnings & Insights

- The codebase reflects recent refactoring (theme removal, filter removal).
- State management is handled consistently via React Context.
- Middleware effectively manages routing and authentication concerns.
- GraphQL queries are structured using fragments and context directives.

## Sitemap Implementation (April 2025)

- **Structure:** Hierarchical sitemaps generated using Next.js metadata conventions.
  - `app/sitemap.ts`: Main index linking to base URL and active country sitemaps.
  - `app/[country]/sitemap.ts`: Country index linking to resource sitemaps and policy pages for that country.
  - `app/[country]/[resource]/sitemap.ts`: Resource-specific sitemaps (products, collections, blogs, articles, pages, metaobjects) fetching all items for that country.
- **Technology:** Uses `export default function sitemap()` returning `MetadataRoute.Sitemap`.
- **Data Fetching:** Uses `lib/shopifySitemapFetcher.ts` utility to fetch all paginated resources from Shopify Storefront API.
- **Chunking:** Removed due to complexity and low item count. Each resource type generates a single sitemap file per country.
- **Country-Aware:** Explicit country folders (`app/in/`) ensure correct URLs.

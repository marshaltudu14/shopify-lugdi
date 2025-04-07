# Active Context: Lugdi Storefront (Post-Codebase Scan)

## 1. Current Focus

- Completed codebase scan and updated Memory Banks.

## 2. Recent Changes

- **Dependency Cleanup:** Uninstalled unused libraries (`next-auth`, `zustand`, `google-auth-library`, `nodemailer`). Downgraded React to v18.
- **File Cleanup:** Deleted unused files related to removed themes and features (`lib/types/next-auth.d.ts`, `lib/theme-config.ts`, `lib/theme-utils.ts`, `app/components/ProductFilters.tsx`, `app/components/collection/CollectionFilters.tsx`, `components/theme-switcher.tsx`).
- **Previous Changes (Confirmed by Scan):**
  - Filter logic removed from Collection/Search pages.
  - Seasonal/Festival theme system removed.
  - Styling updates (coupon bar, product image aspect ratio, discount badge) applied.
  - Wishlist page uses `ProductCard`.

## 3. Next Steps

- Await further instructions or tasks from the user. Memory banks are now up-to-date based on the current codebase state.

## 4. Active Decisions & Considerations

- **Theme Simplification:** Confirmed removal of dynamic theme system; relies on base light/dark modes.
- **Component Reusability:** Confirmed `ProductCard` usage in Wishlist.
- **State Management:** Confirmed reliance on React Context for Cart (encrypted localStorage, country-specific) and Wishlist (unencrypted localStorage). Zustand removed.
- **Authentication:** Confirmed custom Shopify Customer Account API token implementation in `middleware.ts`. `next-auth` removed.
- **Middleware:** Confirmed logic for country detection/redirection (cookie/IP, active country check, `/coming-soon` redirect) and authentication token handling.
- **GraphQL Usage:** Confirmed use of fragments and `@inContext` directive for Shopify API interactions.
- **Sitemap:** Confirmed hybrid approach linking to Shopify's sitemap.

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

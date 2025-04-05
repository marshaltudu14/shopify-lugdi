# Active Context: Lugdi Storefront (Initialization)

## 1. Current Focus

- Updating Memory Banks after removing product filter functionality.

## 2. Recent Changes

- **Filter Logic Removal:** Removed product filtering functionality from Collection pages (`app/[country]/collections/[collectionSlug]/ClientCollectionPage.tsx`) and Search pages (`app/[country]/search/[searchQuery]/SearchPageClient.tsx`). This involved removing filter state, related effects, UI components (`CollectionFilters`, `ProductFilters`), and associated logic. Pages now display all fetched products directly, relying only on sorting and infinite scroll.
- **Theme System Removal:** Removed the entire seasonal/festival theme system (`lib/theme-config.ts`, `lib/theme-utils.ts`, `app/components/ThemeApplicator.tsx`, `app/components/effects/`, related CSS). The application now relies solely on the default light/dark mode defined in `app/globals.css`.
- **Styling Updates:**
  - Updated the top coupon bar (`.coupon-notice`) to use primary theme colors for better visibility.
  - Set product images (`ProductCard.tsx`, `ClientProductPage.tsx`) to use a 2:3 aspect ratio.
  - Updated the discount badge (`ProductCard.tsx`) to use destructive theme colors.
- **Wishlist Refactor:** Updated the wishlist page (`ClientWishlistPage.tsx`) to use the `ProductCard` component for visual consistency, adapting the data structure and retaining the remove functionality.
- **Code Cleanup:** Removed unused imports and fixed build errors resulting from the theme system removal. Verified `cursor-pointer` usage on Button components.

## 3. Next Steps

- Await further instructions or tasks from the user. (Memory banks updated).

## 4. Active Decisions & Considerations

- **Theme Simplification:** The removal of the dynamic theme system simplifies styling logic significantly, relying only on the base light/dark modes.
- **Component Reusability:** Refactoring the wishlist to use `ProductCard` improves consistency.
- **Zustand Usage:** Dependency exists, but not currently implemented.
- **Authentication:** Custom implementation using Shopify Customer Account API tokens (handled in `middleware.ts`). Protects `/account` route. `next-auth` dependency is unused.
- **Middleware:** Implemented (`middleware.ts`). Handles country detection/redirection (based on cookie/IP, redirects inactive countries to `/coming-soon`, enforces `/[country]/` structure) and authentication token refresh/validation for protected routes.

## 5. Important Patterns & Preferences

- **Internationalization:** URL-based routing (`/[country]/`) remains a core pattern.
- **Styling:** Heavy reliance on Tailwind CSS and Shadcn/ui components, now simplified to base light/dark themes.
- **API:** GraphQL via Apollo Client for Shopify interaction.
- **Cart State:** Client-side management via React Context with encrypted `localStorage` persistence. (Zustand dependency exists but is unused).
- **Wishlist State:** Client-side management via React Context (`WishlistContext`).

## 6. Learnings & Insights

- The project structure allowed for the relatively clean removal of the theme system, although careful cleanup of imports and component usage was necessary.
- Refactoring UI elements (like the wishlist items) to use common components (`ProductCard`) enhances maintainability and visual consistency.

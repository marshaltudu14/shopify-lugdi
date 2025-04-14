# Todo List: Lugdi Storefront Features & Improvements

This list tracks potential features, enhancements, and technical tasks for the Lugdi storefront, tailored for a unique fashion brand.

## Phase 1: Core Functionality & Launch Readiness

*   **[ ] Homepage Implementation:**
    *   Design and build out the content and layout (`app/page.tsx`).
    *   Showcase featured collections, new arrivals, and brand storytelling elements.
    *   Ensure strong visual impact reflecting the brand's aesthetic (mythology, futuristic, abstract art).
*   **[ ] Collection Pages - Visual Enhancements:**
    *   Improve visual layout and potentially add introductory content/imagery for each collection (`app/[country]/collections/[collectionSlug]/page.tsx`).
*   **[ ] Product Detail Pages (PDP) - Core Info:**
    *   Ensure clear display of product title, description, price, variants (size, color), and images (`app/[country]/products/[productSlug]/page.tsx`).
    *   Implement robust image gallery with zoom and multiple angles.
*   **[ ] Country Selection Integration:**
    *   Fully integrate `CountriesCombobox.tsx` for manual country selection.
    *   Ensure seamless switching between country contexts.
*   **[ ] Cart & Checkout Flow:**
    *   Thoroughly test adding/removing items, updating quantities (`app/[country]/cart/page.tsx`).
    *   Confirm smooth transition to Shopify checkout URL.
*   **[ ] Footer Policy Links:**
    *   Update hardcoded '#' links with actual URLs (Privacy Policy, Terms of Service, Shipping, Returns). Fetch from Shopify if possible via CMS or metafields.
*   **[ ] Basic SEO:**
    *   Ensure dynamic generation of relevant meta titles and descriptions for products, collections, and pages.
    *   Verify `robots.ts` and `sitemap.ts` functionality.
*   **[ ] Responsive Design Polish:**
    *   Test and refine layouts across major breakpoints (mobile, tablet, desktop).

## Phase 2: User Account & Engagement Features

*   **[ ] Login/Signup Flow:**
    *   Create UI/UX for user login and signup using Shopify Customer Account API.
    *   Handle authentication states and redirects.
*   **[ ] Account Pages:**
    *   Implement user account dashboard (`/account`).
    *   Display order history (fetching from Shopify).
    *   Allow users to manage saved addresses.
    *   Integrate Wishlist display within the account section.
*   **[ ] Wishlist Enhancements:**
    *   Consider adding notes or organization features to the wishlist.
    *   Allow sharing wishlists.
*   **[ ] Product Reviews/Ratings:**
    *   Implement a system for users to view and submit product reviews (e.g., using Shopify Product Reviews app or a third-party service like Yotpo/Judge.me integrated via API).
*   **[ ] Back-in-Stock Notifications:**
    *   Allow users to subscribe to notifications for out-of-stock variants. (Requires backend/Shopify app support).

## Phase 3: Brand Storytelling & Merchandising

*   **[ ] Lookbooks / Style Guides:**
    *   Create dedicated sections showcasing curated looks, styling ideas, or seasonal collections, linking directly to products.
*   **[ ] Enhanced Collection Pages:**
    *   Add rich content (banners, descriptions, videos) to collection pages to tell the story behind each collection.
*   **[ ] "Shop the Look" Functionality:**
    *   On Lookbook pages or PDPs, allow users to easily add all items from a displayed outfit to their cart.
*   **[ ] Detailed Product Information:**
    *   Add sections for Size Guides (potentially interactive).
    *   Include detailed Material Composition and Care Instructions.
    *   Highlight unique design details or cultural inspirations.
*   **[ ] Video Previews:**
    *   Integrate video assets on PDPs or collection pages to showcase fit and movement.
*   **[ ] Blog/Content Section ("Journal", "Stories"):**
    *   Add a blog section for brand stories, artist spotlights, design process insights, or cultural context related to the designs. (Could leverage Shopify Blog or a headless CMS).
*   **[ ] Social Media Integration:**
    *   Embed an Instagram feed showcasing user-generated content or brand posts.

## Phase 4: Internationalization & Advanced Features

*   **[ ] Shopify Markets Integration:**
    *   Investigate and implement deeper integration for country-specific pricing, currencies, and potentially duties/taxes presentation.
*   **[ ] Language Translation (i18n):**
    *   Add support for multiple languages based on the selected country, managing translations (e.g., using Next.js i18n routing or libraries like `next-intl`).
*   **[ ] Search Enhancements:**
    *   Improve search results page (`app/[country]/search/[searchQuery]/page.tsx`) with better UI, potentially facets/filtering (if needed later), and sorting options.
    *   Consider implementing predictive search in the header.
*   **[ ] Gift Card Functionality:**
    *   Implement support for purchasing and redeeming Shopify gift cards.
*   **[ ] Loyalty Program:**
    *   Integrate a customer loyalty program (likely via a Shopify app and API integration).
*   **[ ] Pre-order Functionality:**
    *   Support pre-orders for upcoming collections if applicable (requires Shopify setup).
*   **[ ] Advanced Filtering (Revisit):**
    *   If analytics show a strong need, re-evaluate adding product filtering to collection/search pages using Shopify Search & Discovery API or metafields.

## Ongoing Technical Tasks & Maintenance

*   **[x] Theme Toggle Implementation:**
    *   ✅ Implement theme toggle in desktop and mobile headers.
    *   ✅ Support light, dark, and system modes.
    *   ✅ Use appropriate icons and animations for better UX.
*   **[ ] Testing Strategy:**
    *   Define and implement unit tests (e.g., Jest/Vitest) for critical utilities and components.
    *   Implement integration tests for user flows (cart, login).
    *   Consider end-to-end tests (e.g., Cypress, Playwright).
*   **[ ] Dependency Management:**
    *   Regularly review and update dependencies.
    *   Remove unused dependencies (`next-auth`, `zustand`?) after confirming they won't be needed.
*   **[ ] Performance Optimization:**
    *   Continuously monitor performance (Core Web Vitals, Lighthouse).
    *   Optimize images (Next/Image, formats like WebP/AVIF).
    *   Analyze bundle sizes and implement code splitting where needed.
    *   Implement effective caching strategies (data fetching, edge caching).
*   **[ ] Deployment & CI/CD:**
    *   Configure a robust deployment environment (e.g., Vercel, Netlify).
    *   Set up CI/CD pipeline for automated testing and deployment.
*   **[ ] Error Monitoring & Logging:**
    *   Integrate an error monitoring service (e.g., Sentry).
    *   Implement structured logging for better debugging.
*   **[ ] Accessibility Audit:**
    *   Perform regular accessibility checks (WCAG compliance) and address issues.
*   **[ ] Security Audit:**
    *   Regularly review security best practices, especially around API keys and user data handling.

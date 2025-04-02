# Technical Context: Lugdi Storefront

## 1. Core Technologies

- **Framework:** Next.js (v15+) with Turbopack (for development)
- **Language:** TypeScript
- **UI Library:** Shadcn/ui (built on Radix UI primitives)
- **Styling:** Tailwind CSS (v4+)
- **State Management:** Zustand
- **API Communication:** Apollo Client (for GraphQL)
- **Backend:** Shopify (via Storefront GraphQL API - assumed)
- **Authentication:** next-auth (v4) - Presence confirmed, specific implementation TBD.
- **Forms:** React Hook Form with Zod for validation.

## 2. Development Environment

- **Package Manager:** npm (inferred from `package-lock.json`)
- **Linting:** ESLint (configured via `eslint.config.mjs`)
- **Formatting:** Likely Prettier (often used with Next.js/Tailwind, auto-formatting observed)
- **Build Tool:** Next.js CLI (`next build`)
- **Development Server:** Next.js CLI (`next dev --turbopack`)

## 3. Key Dependencies & Libraries

- `@apollo/client`: GraphQL client
- `@radix-ui/*`: UI primitives for Shadcn
- `class-variance-authority`, `clsx`, `tailwind-merge`: Utilities for Tailwind CSS class management
- `embla-carousel-react`: Carousel component
- `framer-motion`: Animations
- `js-cookie`: Client-side cookie management
- `lucide-react`: Icon library
- `next-themes`: Theme management (light/dark mode) - Note: Custom seasonal/festival theme system removed.
- `sonner`: Toast notifications
- `zod`: Schema validation

## 4. Fonts

- **Blippo:** Custom font (`/fonts/blippo-blk-bt.ttf`), variable `--font-blippo`
- **Baumans:** Custom font (`/fonts/Baumans-Regular.ttf`), variable `--font-baumans`

## 5. Technical Constraints/Considerations

- Relies heavily on Shopify's Storefront API for product, collection, and cart data. API rate limits and schema structure are constraints.
- Internationalization logic depends on the structure defined in `lib/countries.ts` and URL routing (`/[country]/...`).
- Performance optimization is crucial for a global audience (handled partly by Next.js features like Server Components, caching, etc.).

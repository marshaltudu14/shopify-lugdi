# System Patterns: Lugdi Storefront

## 1. Architecture Overview

- **Frontend Framework:** Next.js App Router architecture. Leverages Server Components for data fetching and rendering where possible, and Client Components (`"use client"`) for interactivity (e.g., cart, UI elements).
- **Backend:** Headless Shopify via Storefront GraphQL API. The Next.js app acts as the presentation layer.
- **API Communication:** Primarily GraphQL via Apollo Client. REST APIs might be used for other purposes if needed (e.g., internal API routes).

## 2. Key Design Patterns

- **Component Model:** Utilizes reusable components, likely following Atomic Design principles to some extent, leveraging Shadcn/ui components.
- **State Management:**
  - **Cart:** React Context API (`CartContext`) for client-side cart state. State is persisted to encrypted `localStorage`.
  - **Global State (Potential):** Zustand is listed as a dependency, potentially used for other global state needs (e.g., UI state, user session if not handled by next-auth). Needs confirmation.
  - **Local State:** Standard React `useState` and `useEffect` for component-level state.
- **Data Fetching:**
  - **Server Components:** Likely used for initial page loads, fetching data directly on the server (e.g., product details, collection pages).
  - **Client Components:** Apollo Client (`useQuery`, `useMutation`, `useApolloClient`) used for dynamic data fetching and mutations triggered by user interactions (e.g., cart operations).
- **Routing:** Next.js App Router with dynamic segments for internationalization (`/[country]/...`) and specific resources (`/collections/[collectionSlug]`, `/products/[productSlug]`).
- **Styling:** Utility-first CSS with Tailwind CSS, managed via `clsx`, `tailwind-merge`, and potentially `class-variance-authority`.
- **Internationalization (i18n):**
  - URL-based country detection (`/[country]/`).
  - Dynamic metadata and `lang` attribute generation (`app/layout.tsx`).
  - Country code passed in API requests (`CartContext.tsx`).
  - Country configuration likely managed in `lib/countries.ts`.

## 3. Important Implementation Paths

- **Product Display:** Fetching product data via GraphQL (likely using Server Components) and rendering using components like `ProductCard.tsx`.
- **Collection Pages:** Similar to products, fetching collection data and associated products.
- **Cart Operations:** Client-side logic within `CartContext.tsx` interacting with Shopify's cart mutations via Apollo Client. State synchronized with encrypted `localStorage`.
- **Country Selection/Routing:** Middleware (`middleware.ts`?) or logic within page/layout components likely handles redirection or context setting based on the URL's country segment. `CountriesCombobox.tsx` suggests a manual selection mechanism.

## 4. Security Considerations

- **Cart Persistence:** Client-side cart data in `localStorage` is encrypted using AES (`crypto-js`) with a key from environment variables (`NEXT_PUBLIC_CART_ENCRYPTION_KEY`).
- **API Keys:** Shopify Storefront API keys and other secrets should be securely managed via environment variables.
- **Authentication:** If `next-auth` is fully implemented, it handles user session management securely.

## 5. Code Organization

- **App Router Structure:** Features organized within the `app/` directory, often using route groups or nested folders.
- **Components:** Reusable UI elements in `app/components/` and `components/` (likely Shadcn UI).
- **Lib:** Core logic, utilities, API definitions (`lib/queries`, `lib/mutations`), Apollo setup (`lib/apollo`), type definitions (`lib/types`).
- **Utilities:** Helper functions in `utils/`.
- **Styling:** Global styles in `app/globals.css`, component-level styling via Tailwind classes.

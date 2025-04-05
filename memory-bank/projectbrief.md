# Project Brief: Lugdi E-commerce Storefront

## 1. Project Name

Lugdi

## 2. Core Purpose

To build a modern, global e-commerce storefront for the Lugdi fashion brand. The storefront will leverage a Next.js frontend, connect to a Shopify backend via its GraphQL Storefront API, and provide a country-specific browsing experience.

## 3. Key Requirements

- **Product Catalog:** Display products and collections fetched dynamically from Shopify.
- **Shopping Cart:** Implement standard cart functionality (add, view, update, remove items).
- **Internationalization:** Support multiple countries/regions, adapting content (like language, potentially currency/pricing via Shopify Markets) based on the selected country accessed via URL path (`/[country]/...`).
- **Search:** Allow users to search for products within the store.
- **Responsive Design:** Ensure the storefront is usable and visually appealing across various devices (desktop, tablet, mobile).
- **Branding:** Reflect Lugdi's brand identity ("bold fashion brand merging cultural heritage with modern style... artistic graphic T-shirts, luxury streetwear... inspired by mythology, futuristic aesthetics, and abstract art") through design, custom fonts (Blippo, Baumans), and content.
- **Technology Stack:** Utilize Next.js, TypeScript, Tailwind CSS, Shadcn/ui, Apollo Client. (Zustand is a dependency but not currently implemented for state management).

## 4. Primary Audience/Users

Global online shoppers interested in unique, culturally inspired fashion and luxury streetwear.

## 5. Scope

- **In Scope:**
  - Frontend development of the user-facing e-commerce website.
  - Integration with Shopify Storefront GraphQL API for product data, collections, cart management, and search.
  - Implementation of country selection and routing.
  - UI/UX design implementation based on Shadcn/ui components and custom styling.
  - State management using React Context (for Cart). (Zustand is a dependency but not currently implemented).
  - Basic SEO setup (metadata generation).
- **Out of Scope (Assumed):**
  - Shopify backend configuration (product setup, inventory, pricing, Shopify Markets setup).
  - Order processing and fulfillment logic.
  - Payment gateway integration (typically handled by redirecting to Shopify's checkout).
  - User authentication features (Implemented via custom Shopify Customer Account API token handling in middleware, not `next-auth`).
  - Advanced analytics integration beyond basic setup.

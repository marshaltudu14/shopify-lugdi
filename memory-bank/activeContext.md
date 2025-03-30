# Active Context: Lugdi Storefront (Initialization)

## 1. Current Focus

- Establishing the initial Memory Bank documentation based on project analysis.
- Understanding the existing codebase structure, technologies, and core features.

## 2. Recent Changes

- Created core Memory Bank files:
  - `projectbrief.md`
  - `productContext.md`
  - `techContext.md`
  - `systemPatterns.md`

## 3. Next Steps

- Create the `progress.md` file to document the current state of implemented features and potential next steps.
- Await specific task assignment from the user.

## 4. Active Decisions & Considerations

- **Inferred Scope:** The initial Memory Bank content is based on analyzing the existing file structure and key files (`package.json`, `app/layout.tsx`, `app/[country]/cart/CartContext.tsx`). Assumptions have been made about the project's state and features.
- **Zustand Usage:** The exact purpose of the Zustand dependency needs clarification, as cart state is handled by React Context. It might be unused, planned for future features (like UI state), or used in parts of the code not yet examined.
- **`next-auth` Usage:** The presence of `next-auth` suggests authentication, but its implementation status and requirements are unknown.
- **Middleware:** The role of `middleware.ts` in handling country routing or other logic needs investigation.

## 5. Important Patterns & Preferences

- **Internationalization:** URL-based routing (`/[country]/`) is a core pattern.
- **Styling:** Heavy reliance on Tailwind CSS and Shadcn/ui components.
- **API:** GraphQL via Apollo Client for Shopify interaction.
- **Cart State:** Client-side management via React Context with encrypted `localStorage` persistence.

## 6. Learnings & Insights

- The project is a headless Shopify storefront built with a modern Next.js stack.
- Internationalization is a key feature, built into the routing and potentially API calls.
- Cart state management uses a custom Context provider with encryption, separate from the included Zustand library.

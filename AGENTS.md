<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Florlen Frontend Agent Guidelines

## Design and styling rules

- Every UI must follow the styling rules defined in the DESIGN.md.
- Prioritize shacn/ui components, check https://ui.shadcn.com/docs/components, if it is available and suitable, must use it.
- USE shadcn/ui components and Tailwind CSS as the primary UI system.
- Do not add a new UI library without approval.
- Prefer Tailwind class utilities and existing design tokens; avoid inline styles unless required.
- Ensure responsive layouts, accessible labels, and sensible keyboard navigation.
- Ensure consistency in color, styling, and theme.

## Common components

- Always check the common/ui folder for reusable components before creating anything new.
- If no suitable component exists, ask for approval before adding a new common component.
- Avoid duplicating UI patterns; refactor to common components where appropriate.

# CODING GUIDELINES

- Use App Router conventions and keep server components as the default.
- Add `use client` only when client-side hooks or browser APIs are required.
- Avoid direct use of `window`/`document` in server components.
- Always write modular, reusable, and maintainable code.
- Strictly follow the DRY (Don't Repeat Yourself) principle.
- Before generating a large block of code or a full page, independently identify UI elements or logic that can be extracted into reusable components (e.g., Cards, Buttons, Inputs, Layout wrappers). If it is already exist, use it or add variance if necessary
- Extract these components into separate functions or files automatically.
- Keep components small and focused on a single responsibility.
- When create new components or pages, always implement i18n for translation (English and Vietnamese)
- Follow the existing file and naming conventions in the frontend codebase.
- Keep components small and focused; prefer composition over large monolith components.
- Do not introduce new dependencies without approval.
- Keep lint clean and match existing formatting rules.
- Use react-hook-form and Zod
- Use Next components includes: Link,Form, Image when edit/create (a) file(s)
- When implementing or modifying API-related logic in florlen-frontend, ensure consistency between the type returned by the backend and the get method, or between the type in the payload body and the post and patchcheck methods. (folder: florlen-backend/).

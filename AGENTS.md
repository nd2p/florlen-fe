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

## Next.js conventions

- Use App Router conventions and keep server components as the default.
- Add `use client` only when client-side hooks or browser APIs are required.
- Avoid direct use of `window`/`document` in server components.

## General frontend rules

- Follow the existing file and naming conventions in the frontend codebase.
- Keep components small and focused; prefer composition over large monolith components.
- Do not introduce new dependencies without approval.
- Keep lint clean and match existing formatting rules.

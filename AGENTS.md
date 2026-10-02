# Raj Exam Vault - Frontend Agent Instructions

## Project Overview
Raj Exam Vault is an education platform for Rajasthan Government Exam preparation. It provides Previous Year Question Papers (PYQs), Study Material, and Free PDFs.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: JavaScript (JSX)
- **State Management**: React useState/useContext (no external lib unless needed)
- **Authentication**: Frontend-only forms (backend integration pending)

## Design System
- **Primary Color**: Deep Navy Blue (#0a1628, #0f1d35)
- **Accent Colors**: 
  - Red/Orange gradient for CTAs (#e53935 → #7c4dff)
  - Gold (#d4a843) for premium elements
- **Background**: Dark navy with subtle purple gradients on left panel
- **Cards/Forms**: White background (#ffffff) with soft shadows
- **Font**: Inter (Google Font)
- **Border Radius**: 12px for inputs, 14px for buttons, 20px for cards
- **Icons**: Inline SVGs for consistency

## Folder Structure
```
src/
├── app/
│   ├── (auth)/           # Auth route group
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup/Register page
│   │   ├── forgot-password/ # Forgot password page
│   │   └── layout.js     # Auth layout (split-screen)
│   ├── globals.css       # Global styles + Tailwind
│   ├── layout.js         # Root layout
│   └── page.js           # Home page (redirects to login)
├── components/
│   └── auth/             # Auth-related components
│       ├── AuthHero.js   # Left panel hero section
│       ├── SocialLogin.js # Social login buttons
│       └── AuthFooter.js # Bottom footer bar
```

## Coding Conventions
1. Use `"use client"` directive for interactive components
2. Use Tailwind CSS classes for all styling
3. Keep components modular and reusable
4. Use semantic HTML elements
5. Add proper aria labels for accessibility
6. No backend API calls — all auth forms are frontend-only stubs
7. Use Next.js `Link` for navigation between auth pages
8. All form inputs should have proper validation states (UI only)

## Auth Pages Design Rules
1. **Split-screen layout**: Left = branded hero, Right = form
2. **Left panel**: Dark gradient background with illustration, tagline, feature badges
3. **Right panel**: White card with form, social login, security message
4. **Login**: Email/phone + password, remember me, forgot link, social auth
5. **Signup**: Full name, email/phone, password, confirm password, terms checkbox
6. **Forgot Password**: Email/phone input, submit, back to login

## Important Notes
- Keep all auth-related routes under the `(auth)` route group
- The `(auth)` layout handles the split-screen design
- Each page only needs to provide the form content
- No backend integration — forms just log to console for now

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

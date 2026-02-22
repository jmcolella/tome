# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tome is a Next.js 16 book tracking application that allows users to manage reading progress, create libraries, and track reading metrics. The app uses PostgreSQL (via Supabase) for persistence, Supabase Auth for user authentication, React Query for data synchronization, and Ant Design for the UI.

## Technology Stack

- **Framework**: Next.js 16 with React 19
- **Database**: PostgreSQL with Prisma ORM (hosted on Supabase)
- **Authentication**: Supabase Auth
- **Data Fetching**: TanStack React Query (v5)
- **UI Framework**: Ant Design (antd v6)
- **Styling**: Tailwind CSS v4
- **Forms**: TanStack React Form
- **Charts**: Chart.js with react-chartjs-2
- **Type Safety**: TypeScript 5 with strict mode

## Common Development Commands

### Running the Application
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server

### Database Management
- `npm run db-migrate` - Run pending database migrations (creates migrations interactively)
- `npm run db-migrate:deploy` - Deploy migrations in production (no prompts)
- `npm run db-studio` - Open Prisma Studio GUI for direct database viewing/editing
- `npm run supabase-gen` - Regenerate TypeScript types from Supabase schema

### Code Quality
- `npm run lint` - Run ESLint across the codebase
- `npm run env-dev` / `npm run env-prod` - Load environment configuration and regenerate Prisma client

## Architecture & Patterns

### Directory Structure
```
app/
├── api/                    # Server-side API routes
│   ├── auth/              # Authentication endpoints
│   ├── books/             # Book management endpoints
│   └── user/              # User data endpoints
├── tome/                  # Protected app pages and components
│   ├── components/        # React components (modals, lists, forms)
│   ├── hooks/             # Custom React hooks (organized by domain)
│   ├── providers/         # Context providers (Query, Theme)
│   ├── home/              # Home page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── welcome/           # Welcome/landing page
├── layout.tsx             # Root layout with auth context
└── page.tsx               # Splash/routing page

lib/
├── prisma.ts              # Prisma client singleton
├── supabase.ts            # Supabase client (browser)
└── supabase-server.ts     # Supabase server client

prisma/
├── schema.prisma          # Database schema definition
└── migrations/            # Timestamped migration files
```

### Core Data Model
- **User**: Managed by Supabase Auth (stored in `auth.users` schema)
- **Library**: User-created book collections
- **Book**: Individual books with metadata (title, pages, status, current page)
- **BookEvent**: Progress events (page updates, start date, completion)
- **BookEventVersion**: Version tracking for event metadata

### Key Architectural Patterns

**API Response Wrapper**
All API routes return an `ApiResponse<T>` wrapper:
```typescript
interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

**React Query for Data Fetching**
- Custom hooks in `app/tome/hooks/` wrap all API calls with React Query
- Query key structure: `['books']`, `['user']`, etc.
- Cache invalidation happens via `useQuery` mutations (see `useAddBook`, `useUpdateProgress`)
- Default stale time: 60 seconds, no refetch on window focus

**Client vs Server Components**
- Pages and most components use `"use client"` since they fetch user-specific data
- Server components are rare but exist in the layout structure
- Always check auth state client-side with `useGetUser()` hook

**Backend Domain Structure: API → Reader/Writer → Database**
The backend follows a strict layered architecture to maintain separation of concerns:
- **API Routes** (`app/api/**/route.ts`): Handle HTTP requests only, never interact with Prisma directly
- **Reader/Writer Classes**: Abstract database access behind domain-specific classes
  - `Reader` class: Read-only database queries (e.g., `BookReader.getById(id)`)
  - `Writer` class: Write operations (e.g., `BookWriter.create(data)`, `update(id, data)`)
  - Each table should have corresponding Reader/Writer classes
  - Classes must be located in `app/api/{domain}/` (e.g., `BookReader`, `BookWriter`)
- **Data Classes**: Reader/Writer must return data class abstractions, never raw Prisma models
  - Create domain-specific data classes (DTOs) that wrap Prisma models
  - Data classes provide a stable interface independent of database schema changes
  - Example: `BookData` class wraps `Book` Prisma model, exposing only needed fields
- **No Direct Prisma in API Routes**: API routes must never call `prisma.table.operation()` directly
  - This keeps database logic isolated and testable
  - Changes to queries only require updating Reader/Writer classes

**Import Convention**
- **Enforce absolute imports** using `@/` alias (e.g., `@/app/components/Button`)
- ESLint rule prevents relative imports in the `app/` directory
- This applies everywhere in the codebase

**UI Component Library**
- Use Ant Design (antd) components for consistent styling
- Access design tokens via `theme.useToken()` hook for dynamic theming
- Theme provider is in `app/tome/providers/ThemeProvider.tsx`

**Frontend Patterns**
- **Abstract React Query Behind Custom Hooks**: All React Query usage must be wrapped in custom hooks (located in `app/tome/hooks/`). Components should never call `useQuery` or `useMutation` directly.
- **Avoid useEffect**: Never use `useEffect` unless there is truly no other option. In the vast majority of cases, data fetching and state changes should be driven by user interactions (button clicks, form submissions) or be encapsulated in custom hooks. Direct effect-based logic is often a code smell.
- **Limit useCallback**: Only use `useCallback` for functions passed down as props to child components that are performance-sensitive. Even then, make a judgment call on whether the performance benefit is worth the added complexity. Don't use it defensively.
- **Avoid useMemo**: Never use `useMemo`. The codebase rarely involves computationally expensive operations that would justify memoization. If performance is a concern, refactor the code first before reaching for memoization.
- **Use `interface` for Props**: Define component props using TypeScript `interface`, not `type`. This is the idiomatic pattern for React component definitions.
- **Object Arguments for Multiple Parameters**: Functions and hooks with 3 or more arguments should accept a single object parameter with named key/value pairs instead. This improves readability and makes adding future parameters easier.
  ```typescript
  // ❌ Avoid
  function useBookData(bookId: string, includeEvents: boolean, sortBy: 'date' | 'page') {}

  // ✅ Prefer
  interface UseBookDataOptions {
    bookId: string;
    includeEvents?: boolean;
    sortBy?: 'date' | 'page';
  }
  function useBookData(options: UseBookDataOptions) {}
  ```
- **Avoid Type Casting**: Never use `as` type assertions or casting. Instead, create explicit types or use type discrimination. Type casting hides potential type safety issues and makes code harder to refactor.
  ```typescript
  // ❌ Avoid type casting
  const formValues = { name: "", goalType: undefined } as GoalFormValues;

  // ✅ Prefer explicit interface with proper defaults
  interface GoalFormValues {
    name: string;
    goalType: GoalType | undefined;
    targetValue: string;
    dateRange: [Dayjs, Dayjs] | undefined;
  }

  const defaultFormValues: GoalFormValues = {
    name: "",
    goalType: undefined,
    targetValue: "",
    dateRange: undefined,
  };
  ```
- **Use Theme Colors**: Always pull colors from the theme via `theme.useToken()` instead of hardcoding color values. This ensures consistency across light/dark modes and respects user preferences.
  ```typescript
  // ❌ Avoid hardcoded colors
  <div style={{ color: "#ff4d4f" }}>Error message</div>

  // ✅ Prefer theme tokens
  const { token } = theme.useToken();
  <Alert type="error" description={message} style={{ color: token.colorError }} />
  ```
- **Use Ant Design Text Component**: Prefer using the `Text` component from antd for displaying text instead of generic `<div>` or `<span>` elements. This provides semantic meaning and ensures consistent styling.
  ```typescript
  // ❌ Avoid
  <div style={{ color: "#ff4d4f", fontSize: 14 }}>Validation error</div>

  // ✅ Prefer
  import { Typography } from "antd";
  const { Text } = Typography;
  <Text type="danger">Validation error</Text>
  ```

## Important Implementation Notes

### Authentication Flow
- Auth is handled by Supabase Auth (OAuth/email)
- Server-side auth initialized in `app/api/auth/signIn` and `signOut` routes
- Client-side state fetched via `useGetUser()` hook
- User UUID from Supabase is the primary key across application

### Database Connection
- Prisma connects to PostgreSQL through `@prisma/adapter-pg`
- Database URL from environment variable `DATABASE_URL`
- Prisma client generated to custom path: `lib/generated/prisma-client`
- Server-side client accessed via `lib/prisma.ts`

### TypeScript Strict Mode
- Strict mode enabled; all code must be properly typed
- Prisma generates types automatically
- Database types can be regenerated via Supabase schema types script

## ESLint Configuration

The project enforces:
- Next.js core web vitals rules
- TypeScript-specific rules
- **Absolute imports only** within the `app/` directory (no relative paths)
- `react/no-children-prop` configured to allow functions as children (React 19 pattern)

## Environment Variables

Required variables (see `SUPABASE_SETUP.md`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `DATABASE_URL` - PostgreSQL connection string (for Prisma migrations)

## Testing & Debugging

- No automated test framework configured yet
- Use `npm run lint` to catch type and style issues
- Prisma Studio (`npm run db-studio`) useful for debugging database state
- React Query DevTools can be added for data fetching visibility

## Git Workflow

Current branch context: `add-book-metrics` branch tracks feature development. Main branch is `main`. Use PRs to merge features.

## Performance Considerations

- React Query configured with 60-second stale time; adjust if real-time updates needed
- Window focus refetch disabled to reduce unnecessary API calls
- Ant Design components are optimized; minimize re-renders with proper key props
- Tailwind CSS v4 provides minimal overhead with tree-shaking


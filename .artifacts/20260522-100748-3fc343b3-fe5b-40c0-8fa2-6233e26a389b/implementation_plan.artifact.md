# UI/UX Comprehensive Enhancements Plan

This plan outlines the steps to upgrade the Gold Store system's UI/UX using modern libraries like Sonner, Recharts, TanStack Virtual, and Command Menu.

## User Review Required

- **Breaking Changes:** The custom `useToastStore` will be refactored to wrap `Sonner`, so existing calls like `useToastStore.getState().success(...)` will still work but the UI will change.
- **New Feature:** Global search action (Ctrl+K) will be introduced.

## Proposed Changes

### 1. Dependencies & Infrastructure

- Install `sonner`, `cmdk`, `recharts`, `@tanstack/react-virtual`.

### 2. Core UI Components

#### [toast-store.ts](file:///C:/Users/PC/Desktop/SE104.Q21-DoAn/frontend/src/stores/toast-store.ts)
- Refactor to trigger `sonner` toasts while keeping the store interface for compatibility.

#### [NEW] [toaster.tsx](file:///C:/Users/PC/Desktop/SE104.Q21-DoAn/frontend/src/components/ui/toaster.tsx)
- Standard Sonner toaster component.

#### [layout.tsx](file:///C:/Users/PC/Desktop/SE104.Q21-DoAn/frontend/src/app/(dashboard)/layout.tsx)
- Add `<Toaster />` and `<CommandMenu />`.

### 3. Performance & Visualization

#### [Dashboard page.tsx](file:///C:/Users/PC/Desktop/SE104.Q21-DoAn/frontend/src/app/(dashboard)/dashboard/page.tsx)
- Replace custom SVG chart with `Recharts`.
- Add Skeleton screens for the initial loading state.

#### [Products page.tsx](file:///C:/Users/PC/Desktop/SE104.Q21-DoAn/frontend/src/app/(dashboard)/dashboard/products/page.tsx)
- Implement `react-virtual` for the product list if many items are present.
- Refactor creation form to use `react-hook-form` + `zod`.

### 4. Utility Features

#### [NEW] [command-menu.tsx](file:///C:/Users/PC/Desktop/SE104.Q21-DoAn/frontend/src/components/dashboard/command-menu.tsx)
- Implement Ctrl+K menu for quick navigation.

---

## Verification Plan

### Manual Verification
1. Open the dashboard and check the new `Recharts` chart animations and responsiveness.
2. Trigger a success/error action (e.g., delete an item) and verify `Sonner` toast appears with optional "Undo" action.
3. Press `Ctrl + K` to verify the command menu opens and allows searching for pages/actions.
4. Go to the Products page and verify skeleton screens while loading.
5. Create a product with invalid data to test `Zod` real-time validation.

# Component Testing

This project uses **Vitest** and **React Testing Library** for unit and integration testing of UI components.

## Running Tests

```bash
# Run all tests once
yarn test run

# Run tests in watch mode
yarn test

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage
```

## Test Structure

Tests are located alongside their components with `.test.tsx` extension:

- `src/components/ui/button.test.tsx`
- `src/components/ui/input.test.tsx`
- `src/components/ui/checkbox.test.tsx`
- etc.

## Writing Tests

Example test structure:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { YourComponent } from "./your-component";

describe("YourComponent", () => {
  it("renders correctly", () => {
    render(<YourComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("handles user interactions", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<YourComponent onClick={handleClick} />);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Current Test Coverage

- ✅ Button component (6 tests)
- ✅ Input component (6 tests)
- ✅ Checkbox component (5 tests)
- ✅ Badge component (3 tests)
- ✅ Card component (3 tests)
- ✅ Label component (3 tests)

**Total: 26 tests passing**

## Testing Best Practices

1. **Test user behavior, not implementation** - Focus on what users see and do
2. **Use accessible queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test error states** - Include tests for disabled, error, and edge cases
4. **Keep tests isolated** - Each test should be independent
5. **Use userEvent** - Simulates real user interactions better than fireEvent

## Configuration

- **vitest.config.ts** - Main Vitest configuration
- **vitest.setup.ts** - Global test setup (includes jest-dom matchers)
- Tests exclude: `e2e/**`, `*.spec.ts` (reserved for Playwright E2E tests)

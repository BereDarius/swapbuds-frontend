import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toaster } from "./sonner";

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

describe("Toaster", () => {
  it("renders without crashing", () => {
    // Toaster renders through a portal and doesn't throw
    expect(() => render(<Toaster />)).not.toThrow();
  });

  it("accepts className prop", () => {
    // Should not throw when className is provided
    expect(() => render(<Toaster className="custom-toaster" />)).not.toThrow();
  });

  it("accepts expanded prop", () => {
    // Should not throw when expand prop is provided
    expect(() => render(<Toaster expand />)).not.toThrow();
  });
});

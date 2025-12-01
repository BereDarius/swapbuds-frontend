import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: "light",
  }),
}));

describe("ThemeToggle", () => {
  it("should render toggle button", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("should open dropdown menu on click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("should call setTheme when selecting light theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    const lightOption = screen.getByText("Light");
    await user.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should call setTheme when selecting dark theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    const darkOption = screen.getByText("Dark");
    await user.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should call setTheme when selecting system theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    const systemOption = screen.getByText("System");
    await user.click(systemOption);

    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("should show sun icon in light mode", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});

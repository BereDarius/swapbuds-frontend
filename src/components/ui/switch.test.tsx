import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("renders switch", () => {
    render(<Switch data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toBeInTheDocument();
  });

  it("toggles checked state on click", async () => {
    const user = userEvent.setup();
    render(<Switch data-testid="switch" />);

    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toHaveAttribute("data-state", "unchecked");

    await user.click(switchElement);
    expect(switchElement).toHaveAttribute("data-state", "checked");

    await user.click(switchElement);
    expect(switchElement).toHaveAttribute("data-state", "unchecked");
  });

  it("respects disabled state", async () => {
    const user = userEvent.setup();
    render(<Switch disabled data-testid="switch" />);

    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toBeDisabled();

    await user.click(switchElement);
    expect(switchElement).toHaveAttribute("data-state", "unchecked");
  });

  it("handles onCheckedChange callback", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch onCheckedChange={handleChange} data-testid="switch" />);

    const switchElement = screen.getByTestId("switch");
    await user.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("supports defaultChecked prop", () => {
    render(<Switch defaultChecked data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toHaveAttribute("data-state", "checked");
  });
});

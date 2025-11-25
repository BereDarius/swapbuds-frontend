import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders checkbox", () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("toggles checked state on click", async () => {
    const user = userEvent.setup();
    render(<Checkbox data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("data-state", "checked");

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("respects disabled state", async () => {
    const user = userEvent.setup();
    render(<Checkbox disabled data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("handles onCheckedChange callback", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox onCheckedChange={handleChange} data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("supports defaultChecked prop", () => {
    render(<Checkbox defaultChecked data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });
});

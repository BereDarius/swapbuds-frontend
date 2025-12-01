import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./label";

describe("Label", () => {
  it("renders label with text", () => {
    render(<Label>Username</Label>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("associates with input using htmlFor", () => {
    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </div>
    );

    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", "email");
  });

  it("applies custom className", () => {
    render(<Label className="font-bold">Bold Label</Label>);
    const label = screen.getByText("Bold Label");
    expect(label).toHaveClass("font-bold");
  });
});

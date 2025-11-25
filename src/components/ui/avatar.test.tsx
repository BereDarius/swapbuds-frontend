import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("renders avatar container", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    const avatar = screen.getByTestId("avatar");
    expect(avatar).toBeInTheDocument();
  });

  it("renders fallback when image fails", () => {
    render(
      <Avatar>
        <AvatarImage src="invalid-url" alt="Invalid" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("FB")).toBeInTheDocument();
  });

  it("renders fallback only", () => {
    render(
      <Avatar>
        <AvatarFallback>XY</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("XY")).toBeInTheDocument();
  });

  it("applies custom className to avatar", () => {
    render(
      <Avatar className="size-16" data-testid="avatar">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("size-16");
  });
});

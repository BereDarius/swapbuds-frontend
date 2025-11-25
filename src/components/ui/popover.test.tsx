import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover", () => {
  it("renders popover trigger", () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    );

    expect(
      screen.getByRole("button", { name: "Open Popover" }),
    ).toBeInTheDocument();
  });

  it("opens popover on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByText("Popover Content")).toBeInTheDocument();
  });

  it("applies custom className to popover content", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent
          className="custom-popover"
          data-testid="popover-content"
        >
          Test Content
        </PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByRole("button"));

    const content = screen.getByTestId("popover-content");
    expect(content).toHaveClass("custom-popover");
  });

  it("renders popover with different alignments", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent align="start">Aligned Content</PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Aligned Content")).toBeInTheDocument();
  });
});

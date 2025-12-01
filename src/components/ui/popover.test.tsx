import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

describe("Popover", () => {
  it("renders popover trigger", () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );

    expect(
      screen.getByRole("button", { name: "Open Popover" })
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
      </Popover>
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
      </Popover>
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
      </Popover>
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Aligned Content")).toBeInTheDocument();
  });

  it("renders popover with custom side offset", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent sideOffset={10}>Content with offset</PopoverContent>
      </Popover>
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Content with offset")).toBeInTheDocument();
  });

  it("supports controlled open state", () => {
    const { rerender } = render(
      <Popover open={false}>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Controlled Content</PopoverContent>
      </Popover>
    );

    expect(screen.queryByText("Controlled Content")).not.toBeInTheDocument();

    rerender(
      <Popover open={true}>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Controlled Content</PopoverContent>
      </Popover>
    );

    expect(screen.getByText("Controlled Content")).toBeInTheDocument();
  });

  it("closes popover on outside click", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button>Open</Button>
          </PopoverTrigger>
          <PopoverContent>Closable Content</PopoverContent>
        </Popover>
        <div>Outside content</div>
      </div>
    );

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Closable Content")).toBeInTheDocument();

    await user.click(screen.getByText("Outside content"));
    expect(screen.queryByText("Closable Content")).not.toBeInTheDocument();
  });

  it("renders PopoverAnchor element", () => {
    render(
      <Popover>
        <PopoverAnchor>
          <div data-testid="anchor-element">Anchor</div>
        </PopoverAnchor>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );

    expect(screen.getByTestId("anchor-element")).toBeInTheDocument();
  });
});

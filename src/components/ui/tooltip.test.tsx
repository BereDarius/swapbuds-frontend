import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

describe("Tooltip", () => {
  it("renders trigger element", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Hover me" }),
    ).toBeInTheDocument();
  });

  it("shows tooltip content on hover", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });
    await user.hover(trigger);

    await waitFor(() => {
      // Radix UI renders content twice (visible + screen reader), so use getAllByText
      const tooltips = screen.getAllByText("Tooltip content");
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  it("shows tooltip state on hover", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });

    // Initially, trigger should not have delayed-open state
    expect(trigger).not.toHaveAttribute("data-state", "delayed-open");

    await user.hover(trigger);

    await waitFor(() => {
      const tooltips = screen.getAllByText("Tooltip content");
      expect(tooltips.length).toBeGreaterThan(0);
      expect(trigger).toHaveAttribute("data-state", "delayed-open");
    });
  });

  it("works with disabled button", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button disabled>Disabled button</Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disabled tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByText("Disabled button").parentElement;
    if (trigger) {
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText("Disabled tooltip");
        expect(tooltips.length).toBeGreaterThan(0);
      });
    }
  });

  it("applies custom className to content", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent className="custom-class">
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });
    await user.hover(trigger);

    await waitFor(() => {
      const contents = screen.getAllByText("Tooltip content");
      const visibleContent = contents[0].parentElement;
      expect(visibleContent).toHaveClass("custom-class");
    });
  });

  it("renders with different side positions", async () => {
    const user = userEvent.setup();
    const sides: Array<"top" | "right" | "bottom" | "left"> = [
      "top",
      "right",
      "bottom",
      "left",
    ];

    for (const side of sides) {
      const { unmount } = render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>Hover me</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
              <p>Tooltip on {side}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      const trigger = screen.getByRole("button", { name: "Hover me" });
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText(`Tooltip on ${side}`);
        expect(tooltips.length).toBeGreaterThan(0);
      });

      unmount();
    }
  });

  it("supports custom side offset", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={20}>
            <p>Tooltip with offset</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });
    await user.hover(trigger);

    await waitFor(() => {
      const tooltips = screen.getAllByText("Tooltip with offset");
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  it("renders complex content", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p className="font-bold">Title</p>
              <p>Description text</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });
    await user.hover(trigger);

    await waitFor(() => {
      const titles = screen.getAllByText("Title");
      const descriptions = screen.getAllByText("Description text");
      expect(titles.length).toBeGreaterThan(0);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });
});

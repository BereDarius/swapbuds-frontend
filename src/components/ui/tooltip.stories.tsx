import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Top: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Tooltip on Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip positioned at the top</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Bottom: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Tooltip on Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip positioned at the bottom</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Left: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Tooltip on Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip positioned on the left</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Right: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Tooltip on Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip positioned on the right</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const DisabledButton: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button disabled>Disabled Button</Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>You need to verify your account first</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const LongContent: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover for more info</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-semibold mb-1">Important Information</p>
            <p className="text-sm">
              This is a longer tooltip with multiple lines of text to
              demonstrate how the component handles longer content.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const CustomDelay: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Instant Tooltip</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This tooltip appears instantly</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const MultipleTooltips: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">First</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>First tooltip</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Second</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Second tooltip</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Third</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Third tooltip</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

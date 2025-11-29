import type { Meta, StoryObj } from "@storybook/react";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is a default alert with informational content.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again later.
      </AlertDescription>
    </Alert>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Simple Alert</AlertTitle>
      <AlertDescription>This alert doesn&apos;t have an icon.</AlertDescription>
    </Alert>
  ),
};

export const OnlyTitle: Story = {
  render: () => (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Alert with only a title</AlertTitle>
    </Alert>
  ),
};

export const OnlyDescription: Story = {
  render: () => (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        This alert only has a description without a title.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your action was completed successfully!
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Please review this information carefully before proceeding.
      </AlertDescription>
    </Alert>
  ),
};

export const InfoAlert: Story = {
  render: () => (
    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        Here&apos;s some helpful information you should know.
      </AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[500px]">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>
          This is the default alert style with neutral colors.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Destructive Alert</AlertTitle>
        <AlertDescription>
          This indicates an error or dangerous action.
        </AlertDescription>
      </Alert>

      <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Success Alert</AlertTitle>
        <AlertDescription>
          Custom styled alert for success messages.
        </AlertDescription>
      </Alert>

      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle>Warning Alert</AlertTitle>
        <AlertDescription>
          Custom styled alert for warning messages.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

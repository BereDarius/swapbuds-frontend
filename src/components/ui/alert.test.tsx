import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { AlertCircle } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("renders with default variant", () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders with destructive variant", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("border-destructive/50");
    expect(alert).toHaveClass("text-destructive");
  });

  it("applies custom className", () => {
    render(
      <Alert className="custom-alert">
        <AlertTitle>Title</AlertTitle>
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("custom-alert");
  });

  it("renders with icon", () => {
    render(
      <Alert>
        <AlertCircle data-testid="alert-icon" className="h-4 w-4" />
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>,
    );

    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
  });

  it("renders only title without description", () => {
    render(
      <Alert>
        <AlertTitle>Only Title</AlertTitle>
      </Alert>,
    );

    expect(screen.getByText("Only Title")).toBeInTheDocument();
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("renders only description without title", () => {
    render(
      <Alert>
        <AlertDescription>Only Description</AlertDescription>
      </Alert>,
    );

    expect(screen.getByText("Only Description")).toBeInTheDocument();
  });

  it("renders without icon", () => {
    render(
      <Alert>
        <AlertTitle>No Icon</AlertTitle>
        <AlertDescription>This alert has no icon</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    // Should not have svg element
    expect(alert.querySelector("svg")).not.toBeInTheDocument();
  });

  it("has correct ARIA role", () => {
    render(
      <Alert>
        <AlertTitle>Accessible Alert</AlertTitle>
      </Alert>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(
      <Alert ref={ref}>
        <AlertTitle>Ref Test</AlertTitle>
      </Alert>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders with complex content", () => {
    render(
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Complex Alert</AlertTitle>
        <AlertDescription>
          <div>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </div>
        </AlertDescription>
      </Alert>,
    );

    expect(screen.getByText("First paragraph")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph")).toBeInTheDocument();
  });

  it("applies variant-specific styles", () => {
    const { rerender } = render(
      <Alert variant="default">
        <AlertTitle>Default</AlertTitle>
      </Alert>,
    );

    let alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-background");
    expect(alert).toHaveClass("text-foreground");

    rerender(
      <Alert variant="destructive">
        <AlertTitle>Destructive</AlertTitle>
      </Alert>,
    );

    alert = screen.getByRole("alert");
    expect(alert).toHaveClass("border-destructive/50");
    expect(alert).toHaveClass("text-destructive");
  });
});

describe("AlertTitle", () => {
  it("renders as h5 element", () => {
    render(<AlertTitle>Test Title</AlertTitle>);

    const title = screen.getByText("Test Title");
    expect(title.tagName).toBe("H5");
  });

  it("applies correct styles", () => {
    render(<AlertTitle>Styled Title</AlertTitle>);

    const title = screen.getByText("Styled Title");
    expect(title).toHaveClass("mb-1");
    expect(title).toHaveClass("font-medium");
    expect(title).toHaveClass("leading-none");
    expect(title).toHaveClass("tracking-tight");
  });

  it("applies custom className", () => {
    render(<AlertTitle className="custom-title">Title</AlertTitle>);

    const title = screen.getByText("Title");
    expect(title).toHaveClass("custom-title");
  });
});

describe("AlertDescription", () => {
  it("renders as div element", () => {
    render(<AlertDescription>Test Description</AlertDescription>);

    const description = screen.getByText("Test Description");
    expect(description.tagName).toBe("DIV");
  });

  it("applies correct styles", () => {
    render(<AlertDescription>Styled Description</AlertDescription>);

    const description = screen.getByText("Styled Description");
    expect(description).toHaveClass("text-sm");
  });

  it("applies custom className", () => {
    render(
      <AlertDescription className="custom-description">
        Description
      </AlertDescription>,
    );

    const description = screen.getByText("Description");
    expect(description).toHaveClass("custom-description");
  });

  it("renders complex children", () => {
    render(
      <AlertDescription>
        <span>Complex</span> <strong>content</strong>
      </AlertDescription>,
    );

    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});

import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";

function TestForm() {
  const form = useForm({
    defaultValues: {
      username: "",
    },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>This is your public username</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("renders form with all sections", () => {
    render(<TestForm />);

    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(
      screen.getByText("This is your public username")
    ).toBeInTheDocument();
  });

  it("renders FormItem with custom className", () => {
    function TestComponent() {
      const form = useForm({ defaultValues: { test: "" } });

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="test"
            render={() => (
              <FormItem className="custom-item" data-testid="form-item">
                <FormLabel>Test</FormLabel>
                <FormControl>
                  <Input />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("form-item")).toHaveClass("custom-item");
  });

  it("renders FormDescription with correct text", () => {
    function TestComponent() {
      const form = useForm({ defaultValues: { test: "" } });

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="test"
            render={() => (
              <FormItem>
                <FormLabel>Test</FormLabel>
                <FormControl>
                  <Input />
                </FormControl>
                <FormDescription>Helper text goes here</FormDescription>
              </FormItem>
            )}
          />
        </Form>
      );
    }

    render(<TestComponent />);
    expect(screen.getByText("Helper text goes here")).toBeInTheDocument();
  });

  it("does not render FormMessage when no error", () => {
    function TestComponent() {
      const form = useForm({ defaultValues: { test: "" } });

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="test"
            render={() => (
              <FormItem>
                <FormLabel>Test</FormLabel>
                <FormControl>
                  <Input />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      );
    }

    const { container } = render(<TestComponent />);

    const formMessage = container.querySelector('[data-slot="form-message"]');
    expect(formMessage).not.toBeInTheDocument();
  });

  it("renders FormMessage with error", () => {
    function TestComponent() {
      const form = useForm({
        defaultValues: { email: "" },
        mode: "onChange",
      });

      // Manually set an error
      form.setError("email", {
        type: "manual",
        message: "Email is required",
      });

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={() => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      );
    }

    render(<TestComponent />);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("applies error styles to FormLabel when error exists", () => {
    function TestComponent() {
      const form = useForm({
        defaultValues: { field: "" },
      });

      form.setError("field", {
        type: "manual",
        message: "Error message",
      });

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="field"
            render={() => (
              <FormItem>
                <FormLabel data-testid="form-label">Field Label</FormLabel>
                <FormControl>
                  <Input />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      );
    }

    render(<TestComponent />);
    const label = screen.getByTestId("form-label");
    expect(label).toHaveAttribute("data-error", "true");
  });

  it("renders FormMessage with custom children", () => {
    function TestComponent() {
      const form = useForm({ defaultValues: { test: "" } });

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="test"
            render={() => (
              <FormItem>
                <FormLabel>Test</FormLabel>
                <FormControl>
                  <Input />
                </FormControl>
                <FormMessage>Custom message content</FormMessage>
              </FormItem>
            )}
          />
        </Form>
      );
    }

    render(<TestComponent />);
    expect(screen.getByText("Custom message content")).toBeInTheDocument();
  });

  it("sets correct aria-describedby when no error", () => {
    function TestComponent() {
      const form = useForm({ defaultValues: { field: "" } });

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="field"
            render={() => (
              <FormItem>
                <FormLabel>Field</FormLabel>
                <FormControl>
                  <Input data-testid="form-input" />
                </FormControl>
                <FormDescription>Description</FormDescription>
              </FormItem>
            )}
          />
        </Form>
      );
    }

    render(<TestComponent />);
    const input = screen.getByTestId("form-input");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).not.toContain("message");
  });

  it("sets correct aria-describedby when error exists", () => {
    function TestComponent() {
      const form = useForm({ defaultValues: { field: "" } });

      form.setError("field", {
        type: "manual",
        message: "Error occurred",
      });

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="field"
            render={() => (
              <FormItem>
                <FormLabel>Field</FormLabel>
                <FormControl>
                  <Input data-testid="form-input" />
                </FormControl>
                <FormDescription>Description</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      );
    }

    render(<TestComponent />);
    const input = screen.getByTestId("form-input");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toContain("message");
  });
});

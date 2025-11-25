import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders textarea element", () => {
    render(<Textarea placeholder="Enter message" />);
    const textarea = screen.getByPlaceholderText("Enter message");
    expect(textarea).toBeInTheDocument();
  });

  it("accepts text input", async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Type here" />);

    const textarea = screen.getByPlaceholderText("Type here");
    await user.type(textarea, "Hello\nWorld");

    expect(textarea).toHaveValue("Hello\nWorld");
  });

  it("respects disabled state", () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);
    const textarea = screen.getByPlaceholderText("Disabled textarea");
    expect(textarea).toBeDisabled();
  });

  it("calls onChange handler", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Textarea onChange={handleChange} placeholder="Test" />);

    const textarea = screen.getByPlaceholderText("Test");
    await user.type(textarea, "a");

    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

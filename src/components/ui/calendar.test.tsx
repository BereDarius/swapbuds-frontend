import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("renders calendar component", () => {
    render(<Calendar mode="single" />);

    // Calendar should render month navigation
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("applies custom className", () => {
    const { container } = render(
      <Calendar mode="single" className="custom-calendar" />,
    );

    const calendar = container.firstChild as HTMLElement;
    expect(calendar).toHaveClass("custom-calendar");
  });

  it("renders with selected date", () => {
    const selected = new Date(2024, 0, 15);
    render(<Calendar mode="single" selected={selected} />);

    // Calendar renders with date picker grid
    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with multiple mode", () => {
    render(<Calendar mode="multiple" />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with range mode", () => {
    render(<Calendar mode="range" />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with disabled dates", () => {
    const disabledDates = [new Date(2024, 0, 1), new Date(2024, 0, 2)];
    render(<Calendar mode="single" disabled={disabledDates} />);

    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("shows outside days when configured", () => {
    render(<Calendar mode="single" showOutsideDays={true} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("hides outside days when configured", () => {
    render(<Calendar mode="single" showOutsideDays={false} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with dropdown caption layout", () => {
    render(<Calendar mode="single" captionLayout="dropdown" />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with dropdown-months caption layout", () => {
    render(<Calendar mode="single" captionLayout="dropdown-months" />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with dropdown-years caption layout", () => {
    render(<Calendar mode="single" captionLayout="dropdown-years" />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with custom button variant", () => {
    render(<Calendar mode="single" buttonVariant="outline" />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with default button variant", () => {
    render(<Calendar mode="single" buttonVariant="default" />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with custom classNames", () => {
    const { container } = render(
      <Calendar
        mode="single"
        classNames={{
          month: "custom-month",
          day: "custom-day",
        }}
      />,
    );

    expect(container.querySelector(".custom-month")).toBeInTheDocument();
  });

  it("renders with custom formatters", () => {
    const customFormatter = (date: Date) =>
      date.toLocaleString("en-US", { month: "long" });
    render(
      <Calendar
        mode="single"
        formatters={{
          formatMonthDropdown: customFormatter,
        }}
      />,
    );

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with number of months", () => {
    render(<Calendar mode="single" numberOfMonths={2} />);

    const grids = screen.getAllByRole("grid");
    expect(grids.length).toBeGreaterThanOrEqual(1);
  });

  it("renders with today date", () => {
    const today = new Date();
    render(<Calendar mode="single" today={today} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with fromDate and toDate", () => {
    const fromDate = new Date(2024, 0, 1);
    const toDate = new Date(2024, 11, 31);
    render(<Calendar mode="single" fromDate={fromDate} toDate={toDate} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with disabled matcher function", () => {
    const disabledMatcher = (date: Date) =>
      date.getDay() === 0 || date.getDay() === 6;
    render(<Calendar mode="single" disabled={disabledMatcher} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders in controlled mode", () => {
    const selected = new Date(2024, 5, 15);
    const onSelect = vi.fn();

    render(<Calendar mode="single" selected={selected} onSelect={onSelect} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with required prop", () => {
    const selected = new Date();
    render(<Calendar mode="single" required selected={selected} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with weekStartsOn monday", () => {
    render(<Calendar mode="single" weekStartsOn={1} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders with weekStartsOn sunday", () => {
    render(<Calendar mode="single" weekStartsOn={0} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
  });
});

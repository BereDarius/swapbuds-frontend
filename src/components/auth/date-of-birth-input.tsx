"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";

interface DateOfBirthInputProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * DateOfBirthInput Component
 *
 * Three dropdown selectors for day, month, and year to capture date of birth.
 *
 * Features:
 * - Separate dropdowns for day, month, year
 * - Validates day range based on selected month/year
 * - Handles leap years correctly
 * - Age range: 18-120 years old
 * - Returns Date object for age calculation
 *
 * @example
 * ```tsx
 * <FormField
 *   control={form.control}
 *   name="dateOfBirth"
 *   render={({ field }) => (
 *     <DateOfBirthInput
 *       value={field.value}
 *       onChange={field.onChange}
 *       error={form.formState.errors.dateOfBirth?.message}
 *     />
 *   )}
 * />
 * ```
 */
export function DateOfBirthInput({
  value,
  onChange,
  disabled,
  error,
}: DateOfBirthInputProps) {
  const day = value?.getDate();
  const month = value ? value.getMonth() + 1 : undefined; // JS months are 0-indexed
  const year = value?.getFullYear();

  // Generate year options (18-120 years ago from now)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 120;
    const maxYear = currentYear - 18;
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  }, []);

  // Month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Calculate max days for selected month/year
  const maxDays = useMemo(() => {
    if (!month) return 31;
    if (!year) {
      // Default days without year
      const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return daysInMonth[month - 1];
    }
    // Check for leap year
    return new Date(year, month, 0).getDate();
  }, [month, year]);

  // Generate day options
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  const handleDayChange = (newDay: string) => {
    const dayNum = parseInt(newDay);
    if (month && year) {
      onChange(new Date(year, month - 1, dayNum));
    } else if (!value) {
      // Set a partial date if month/year not selected yet (use defaults)
      const tempMonth = month || 1;
      const tempYear = year || new Date().getFullYear() - 18;
      onChange(new Date(tempYear, tempMonth - 1, dayNum));
    }
  };

  const handleMonthChange = (newMonth: string) => {
    const monthNum = parseInt(newMonth);
    if (day && year) {
      // Adjust day if it exceeds max days in new month
      const maxDaysInMonth = new Date(year, monthNum, 0).getDate();
      const adjustedDay = Math.min(day, maxDaysInMonth);
      onChange(new Date(year, monthNum - 1, adjustedDay));
    } else {
      // Set a partial date with defaults
      const tempDay = day || 1;
      const tempYear = year || new Date().getFullYear() - 18;
      onChange(new Date(tempYear, monthNum - 1, tempDay));
    }
  };

  const handleYearChange = (newYear: string) => {
    const yearNum = parseInt(newYear);
    if (day && month) {
      // Adjust day if it exceeds max days in new month/year
      const maxDaysInMonth = new Date(yearNum, month, 0).getDate();
      const adjustedDay = Math.min(day, maxDaysInMonth);
      onChange(new Date(yearNum, month - 1, adjustedDay));
    } else {
      // Set a partial date with defaults
      const tempDay = day || 1;
      const tempMonth = month || 1;
      onChange(new Date(yearNum, tempMonth - 1, tempDay));
    }
  };

  return (
    <FormItem>
      <FormLabel>Date of Birth</FormLabel>
      <div className="grid grid-cols-3 gap-2">
        {/* Day */}
        <Select
          value={day?.toString()}
          onValueChange={handleDayChange}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Day" />
            </SelectTrigger>
          </FormControl>
          <SelectContent className="max-h-[200px]">
            {days.map((d) => (
              <SelectItem key={d} value={d.toString()}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month */}
        <Select
          value={month?.toString()}
          onValueChange={handleMonthChange}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
          </FormControl>
          <SelectContent className="max-h-[200px]">
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year */}
        <Select
          value={year?.toString()}
          onValueChange={handleYearChange}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
          </FormControl>
          <SelectContent className="max-h-[200px]">
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}

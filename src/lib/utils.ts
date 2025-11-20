import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility Functions
 */

/**
 * Merge Tailwind CSS classes with conflict resolution
 *
 * Combines multiple class names and resolves Tailwind conflicts.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @example
 * ```tsx
 * cn('px-2 py-1', condition && 'bg-blue-500', 'px-4') // 'py-1 bg-blue-500 px-4'
 * ```
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

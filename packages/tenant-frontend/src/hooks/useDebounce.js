import { useState, useEffect } from "react";

/**
 * A custom React hook that debounces a value.
 * It delays updating the value until a certain amount of time has passed
 * without the value changing. This is useful for performance-intensive
 * operations like API calls on user input.
 *
 * @param {*} value The value to be debounced (e.g., a search term).
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {*} The debounced value.
 */
export function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set up a timer that will update the debounced value after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // This is the cleanup function that React runs.
      // It will run BEFORE the effect runs again (if the `value` or `delay` changes)
      // or when the component unmounts.
      // This is crucial because it cancels the previous timer, preventing the
      // state from being updated with an old value.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}

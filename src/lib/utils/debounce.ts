/**
 * Debounce utility function
 * Delays function execution until after a specified wait time
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @param immediate - If true, trigger on leading edge instead of trailing
 * @returns Debounced function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<TArgs extends any[]>(
  func: (...args: TArgs) => void,
  wait: number = 300,
  immediate: boolean = false
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: TArgs) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Create a debounced version of a function with a specific delay
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDebounced<TArgs extends any[]>(
  func: (...args: TArgs) => void,
  delay: number = 300
): (...args: TArgs) => void {
  return debounce(func, delay);
}

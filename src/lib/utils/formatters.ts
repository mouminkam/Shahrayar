/**
 * Format price to always show 2 decimal places
 * @param price - The price to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number | string): string => {
  return Number(price).toFixed(2);
};

/**
 * Format currency with symbol
 * @param price - The price to format
 * @param symbol - Currency symbol (default: 'EUR')
 * @returns Formatted currency string
 */
export const formatCurrency = (price: number | string, symbol: string = 'EUR'): string => {
  return `${symbol} ${formatPrice(price)}`;
};

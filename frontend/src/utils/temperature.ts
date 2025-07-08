/**
 * Convert Celsius to Fahrenheit
 * @param celsius - Temperature in Celsius
 * @returns Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

/**
 * Convert Fahrenheit to Celsius
 * @param fahrenheit - Temperature in Fahrenheit
 * @returns Temperature in Celsius
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

/**
 * Format temperature for display
 * @param celsius - Temperature in Celsius
 * @param unit - Display unit ('F' for Fahrenheit, 'C' for Celsius)
 * @returns Formatted temperature string
 */
export const formatTemperature = (celsius: number, unit: 'F' | 'C' = 'F'): string => {
  if (unit === 'F') {
    const fahrenheit = celsiusToFahrenheit(celsius);
    return `${fahrenheit.toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
}; 
import { currencyConverter } from './utils'; // adjust the import path accordingly

describe('currencyConverter', () => {
  it('should return formatted currency for valid numbers', () => {
    expect(currencyConverter(1000)).toBe('£1,000.00');
    expect(currencyConverter(99.99)).toBe('£99.99');
  });

  it('should return an empty string for 0', () => {
    expect(currencyConverter(0)).toBe('');
  });

  it('should return an empty string for undefined or null', () => {
    // This will test if the function handles invalid values gracefully
    expect(currencyConverter(undefined as any)).toBe('');
    expect(currencyConverter(null as any)).toBe('');
  });

  it('should handle negative numbers correctly', () => {
    expect(currencyConverter(-100)).toBe('-£100.00');
  });

  it('should handle large numbers correctly', () => {
    expect(currencyConverter(1000000)).toBe('£1,000,000.00');
  });
});

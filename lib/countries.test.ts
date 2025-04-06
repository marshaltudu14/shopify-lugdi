import { getCurrencySymbol, countries } from './countries';

describe('getCurrencySymbol', () => {
  it('should return the correct currency symbol for a known currency code (INR)', () => {
    const currencyCode = 'INR';
    const expectedSymbol = '₹'; // Based on the data in countries.ts
    expect(getCurrencySymbol(currencyCode)).toBe(expectedSymbol);
  });

  it('should return the correct currency symbol for another known currency code (AUD)', () => {
    const currencyCode = 'AUD';
    const expectedSymbol = '$'; // Based on the data in countries.ts
    expect(getCurrencySymbol(currencyCode)).toBe(expectedSymbol);
  });

  it('should return the currency code itself if the code is not found in the list', () => {
    const currencyCode = 'XYZ'; // An unknown currency code
    expect(getCurrencySymbol(currencyCode)).toBe(currencyCode);
  });

  it('should return the currency code itself for an empty string input', () => {
    const currencyCode = '';
    expect(getCurrencySymbol(currencyCode)).toBe(currencyCode);
  });

  // Optional: Test all active countries defined in the array
  const activeCountries = countries.filter(c => c.active);
  if (activeCountries.length > 0) {
    describe('should return correct symbols for all active countries', () => {
      activeCountries.forEach(country => {
        it(`should return "${country.currencySymbol}" for ${country.currencyCode} (${country.name})`, () => {
          expect(getCurrencySymbol(country.currencyCode)).toBe(country.currencySymbol);
        });
      });
    });
  }
});

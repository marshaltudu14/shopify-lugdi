import { getSortConfig, sortMap, SortOption, SortConfig } from './SortConfig';

describe('getSortConfig', () => {
  // Test each defined sort option in the sortMap
  Object.keys(sortMap).forEach((key) => {
    const sortOption = key as SortOption;
    const expectedConfig: SortConfig = sortMap[sortOption];

    it(`should return the correct config for sort option: "${sortOption}"`, () => {
      const result = getSortConfig(sortOption);
      expect(result).toEqual(expectedConfig);
    });
  });

  // Although TypeScript should prevent invalid options,
  // we can add a test case for robustness if needed,
  // assuming JavaScript might bypass type checks.
  // This test expects the function to potentially throw or return undefined/null
  // depending on how it would handle an invalid key in JS.
  // Since it directly accesses the map, it would likely return undefined in JS.
  it('should return undefined for an invalid sort option (JavaScript context)', () => {
    // Use @ts-expect-error to test passing an invalid string value
    // This simulates a scenario where type safety might be bypassed in JS
    // @ts-expect-error Testing invalid input type
    expect(getSortConfig('invalid-sort-key')).toBeUndefined();
  });
});

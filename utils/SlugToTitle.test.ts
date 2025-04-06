import { convertSlugToTitle } from './SlugToTitle';

describe('convertSlugToTitle', () => {
  it('should convert a simple slug with hyphens to title case', () => {
    const slug = 'hello-world';
    const expectedTitle = 'Hello World';
    expect(convertSlugToTitle(slug)).toBe(expectedTitle);
  });

  it('should convert a slug with underscores to title case', () => {
    const slug = 'another_example_slug';
    const expectedTitle = 'Another Example Slug';
    expect(convertSlugToTitle(slug)).toBe(expectedTitle);
  });

  it('should handle slugs with mixed hyphens and underscores', () => {
    const slug = 'mixed-slug_example';
    const expectedTitle = 'Mixed Slug Example';
    expect(convertSlugToTitle(slug)).toBe(expectedTitle);
  });

  it('should handle single-word slugs', () => {
    const slug = 'singleword';
    const expectedTitle = 'Singleword'; // Capitalizes the first letter
    expect(convertSlugToTitle(slug)).toBe(expectedTitle);
  });

  it('should handle slugs with numbers', () => {
    const slug = 'slug-with-123-numbers';
    const expectedTitle = 'Slug With 123 Numbers';
    expect(convertSlugToTitle(slug)).toBe(expectedTitle);
  });

  it('should handle an empty slug', () => {
    const slug = '';
    const expectedTitle = '';
    expect(convertSlugToTitle(slug)).toBe(expectedTitle);
  });
});

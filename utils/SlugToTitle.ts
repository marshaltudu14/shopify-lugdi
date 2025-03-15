export function convertSlugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, " ") // Replace hyphens or underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
}

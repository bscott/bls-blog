/**
 * Calculate reading time for a given text content
 * @param content - The markdown or text content
 * @returns Formatted reading time string (e.g., "5 min read")
 */
export function getReadingTime(content: string): string {
  // Remove frontmatter
  const textWithoutFrontmatter = content.replace(/^---[\s\S]*?---/, '');

  // Remove code blocks
  const textWithoutCode = textWithoutFrontmatter.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  const textWithoutInlineCode = textWithoutCode.replace(/`[^`]*`/g, '');

  // Remove markdown syntax
  const plainText = textWithoutInlineCode
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/[*_~`]/g, '') // Remove emphasis
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .trim();

  // Count words
  const words = plainText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time (assuming 200 words per minute)
  const minutes = Math.ceil(wordCount / 200);

  return `${minutes} min read`;
}

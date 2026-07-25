export function calculateReadingTime(text: string): {
  words: number;
  minutes: number;
} {
  // Strip markdown formatting symbols
  const plainText = text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`[^`]*`/g, '') // remove inline code
    .replace(/#+\s/g, '') // remove headings
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // remove links
    .replace(/[*_~>]/g, ''); // remove formatting characters

  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  return { words, minutes };
}

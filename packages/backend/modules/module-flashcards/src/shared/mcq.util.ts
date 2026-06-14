export function normalizeMcqAnswerText(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

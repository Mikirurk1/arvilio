/** Equal split; remainder minor units go to the first participant in the list. */
export function splitGroupPriceMinor(
  totalMinor: number,
  participantIds: string[],
): Map<string, number> {
  const n = participantIds.length;
  if (n <= 0) return new Map();
  const base = Math.floor(totalMinor / n);
  const remainder = totalMinor - base * n;
  const amounts = new Map<string, number>();
  participantIds.forEach((userId, index) => {
    amounts.set(userId, base + (index === 0 ? remainder : 0));
  });
  return amounts;
}

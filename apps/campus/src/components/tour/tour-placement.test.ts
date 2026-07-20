import { placeTourCard } from './tour-placement';

describe('placeTourCard', () => {
  const viewport = { width: 1280, height: 800 };

  it('places the card to the right of a left-rail nav spotlight', () => {
    const p = placeTourCard(
      { top: 120, left: 8, width: 56, height: 40 },
      viewport,
    );
    expect(p.arrow).toBe('left');
    expect(p.left).toBeGreaterThan(8 + 56);
    expect(p.top).toBe(120);
  });

  it('falls back below when side placement would cover the spotlight', () => {
    const p = placeTourCard(
      { top: 80, left: 200, width: 400, height: 40 },
      { width: 720, height: 800 },
      420,
      260,
    );
    expect(p.arrow).toBe('top');
    expect(p.top).toBeGreaterThan(80 + 40);
  });
});

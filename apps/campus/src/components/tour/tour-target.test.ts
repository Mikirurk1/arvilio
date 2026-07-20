import {
  isTourTargetInView,
  measureTourTarget,
  resolveTourTargetElement,
  scrollTourTargetIntoView,
} from './tour-target';

describe('measureTourTarget', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('returns null when nothing matches', () => {
    expect(measureTourTarget({ navHref: '/missing', anchorId: 'nope' })).toBeNull();
  });

  it('prefers anchor over nav', () => {
    document.body.innerHTML = `
      <a data-tour-nav="/practice">Practice</a>
      <div data-tour-anchor="practice-card-vocabulary">Vocab</div>
    `;
    const nav = document.querySelector('[data-tour-nav="/practice"]')!;
    const anchor = document.querySelector('[data-tour-anchor="practice-card-vocabulary"]')!;
    jest.spyOn(nav, 'getBoundingClientRect').mockReturnValue({
      top: 10, left: 10, width: 40, height: 20, bottom: 30, right: 50, x: 10, y: 10, toJSON: () => ({}),
    });
    jest.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      top: 100, left: 200, width: 80, height: 40, bottom: 140, right: 280, x: 200, y: 100, toJSON: () => ({}),
    });

    const rect = measureTourTarget({
      anchorId: 'practice-card-vocabulary',
      navHref: '/practice',
    });
    expect(rect?.left).toBe(194); // 200 - 6 pad
    expect(rect?.top).toBe(94);
  });

  it('falls back to nav when anchor is zero-size / hidden', () => {
    document.body.innerHTML = `
      <a data-tour-nav="/practice">Practice</a>
      <div data-tour-anchor="practice-card-vocabulary">Vocab</div>
    `;
    const nav = document.querySelector('[data-tour-nav="/practice"]')!;
    const anchor = document.querySelector('[data-tour-anchor="practice-card-vocabulary"]')!;
    jest.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => ({}),
    });
    jest.spyOn(nav, 'getBoundingClientRect').mockReturnValue({
      top: 40, left: 12, width: 36, height: 24, bottom: 64, right: 48, x: 12, y: 40, toJSON: () => ({}),
    });
    const rect = measureTourTarget({
      anchorId: 'practice-card-vocabulary',
      navHref: '/practice',
    });
    expect(rect?.left).toBe(6);
    expect(rect?.top).toBe(34);
  });
});

describe('scrollTourTargetIntoView', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('scrolls when target is below the fold', () => {
    document.body.innerHTML = `<div data-tour-anchor="practice-stats">Stats</div>`;
    const el = document.querySelector('[data-tour-anchor="practice-stats"]')!;
    jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top: 1200,
      left: 40,
      width: 200,
      height: 80,
      bottom: 1280,
      right: 240,
      x: 40,
      y: 1200,
      toJSON: () => ({}),
    });
    const scrollIntoView = jest.fn();
    (el as HTMLElement).scrollIntoView = scrollIntoView;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: jest.fn().mockReturnValue({
        matches: true,
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });

    expect(isTourTargetInView(el)).toBe(false);
    expect(resolveTourTargetElement({ anchorId: 'practice-stats' })).toBe(el);
    expect(scrollTourTargetIntoView({ anchorId: 'practice-stats' })).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'center', behavior: 'auto' }),
    );
  });

  it('does not scroll when target already in view', () => {
    document.body.innerHTML = `<div data-tour-anchor="dash-hero">Hero</div>`;
    const el = document.querySelector('[data-tour-anchor="dash-hero"]')!;
    jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top: 120,
      left: 40,
      width: 200,
      height: 80,
      bottom: 200,
      right: 240,
      x: 40,
      y: 120,
      toJSON: () => ({}),
    });
    const scrollIntoView = jest.fn();
    (el as HTMLElement).scrollIntoView = scrollIntoView;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });

    expect(scrollTourTargetIntoView({ anchorId: 'dash-hero' })).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

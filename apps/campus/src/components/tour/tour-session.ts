/** In-memory + session gate so Vocabulary first-words cannot hijack the product tour. */

const SESSION_BOOT_KEY = 'arvi.tour.bootstrapped';
const SESSION_ACTIVE_KEY = 'arvi.tour.sessionActive';
const SESSION_CURSOR_KEY = 'arvi.tour.cursor';

let active = false;

export type ProductTourCursor = {
  userId: string;
  phase: 'A' | 'hub' | 'chapter';
  index: number;
  chapterId: string | null;
  chapterStepIndex: number;
};

export function isProductTourUiOpen(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(document.querySelector('[role="dialog"][aria-label="Product tour"]'));
}

export function isProductTourSessionActive(): boolean {
  if (active) return true;
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SESSION_ACTIVE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setProductTourSessionActive(next: boolean): void {
  active = next;
  if (typeof window === 'undefined') return;
  try {
    if (next) window.sessionStorage.setItem(SESSION_ACTIVE_KEY, '1');
    else {
      window.sessionStorage.removeItem(SESSION_ACTIVE_KEY);
      window.sessionStorage.removeItem(SESSION_CURSOR_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function hasBootstrappedProductTour(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SESSION_BOOT_KEY) === userId;
  } catch {
    return false;
  }
}

export function markBootstrappedProductTour(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_BOOT_KEY, userId);
  } catch {
    /* ignore */
  }
}

export function readProductTourCursor(userId: string): ProductTourCursor | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_CURSOR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductTourCursor;
    if (parsed?.userId !== userId) return null;
    if (parsed.phase !== 'A' && parsed.phase !== 'hub' && parsed.phase !== 'chapter') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeProductTourCursor(cursor: ProductTourCursor): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_CURSOR_KEY, JSON.stringify(cursor));
  } catch {
    /* ignore */
  }
}

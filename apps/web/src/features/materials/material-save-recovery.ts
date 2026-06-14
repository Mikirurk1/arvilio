const STORAGE_KEY = 'soenglish:material-pending-save';

export type MaterialPendingSave = {
  materialId: string;
  title: string;
  startedAt: number;
};

export function markMaterialPendingSave(pending: MaterialPendingSave): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

export function clearMaterialPendingSave(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function readMaterialPendingSave(): MaterialPendingSave | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MaterialPendingSave;
    if (!parsed.materialId || !parsed.title) return null;
    return parsed;
  } catch {
    return null;
  }
}

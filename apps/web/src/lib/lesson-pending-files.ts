const pending = new Map<string, File>();

export function pendingLessonFileKey(scope: string, containerId: string, fileName: string): string {
  return `${scope}:${containerId}:${fileName}`;
}

export function registerPendingLessonFile(key: string, file: File): void {
  pending.set(key, file);
}

export function takePendingLessonFile(key: string): File | undefined {
  const file = pending.get(key);
  if (file) pending.delete(key);
  return file;
}

export function movePendingLessonFiles(
  fromScope: string,
  fromContainerId: string,
  toScope: string,
  toContainerId: string,
  fileNames: string[],
): void {
  for (const fileName of fileNames) {
    const fromKey = pendingLessonFileKey(fromScope, fromContainerId, fileName);
    const toKey = pendingLessonFileKey(toScope, toContainerId, fileName);
    const file = pending.get(fromKey);
    if (!file) continue;
    pending.set(toKey, file);
    pending.delete(fromKey);
  }
}

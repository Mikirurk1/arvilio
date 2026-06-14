export function formatLongDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatLessonTime(startTime: string, duration: number) {
  const [h, m] = startTime.split(':').map((part) => Number(part) || 0);
  const start = new Date(2000, 0, 1, h, m);
  const end = new Date(start.getTime() + duration * 60_000);
  const fmt = (date: Date) => date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function lessonPageSubtitle(
  draft: { date: string; startTime: string; duration: number },
  statusLabel: string,
  canManageLessons: boolean,
) {
  const schedule = `${formatLongDate(draft.date)} · ${formatLessonTime(draft.startTime, draft.duration)}`;
  const hub = canManageLessons ? 'Lesson hub' : 'Materials & homework';
  return `${hub} · ${schedule} · ${statusLabel}`;
}

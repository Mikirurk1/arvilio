export function formatLongDate(isoDate: string, locale: string = 'en') {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatLessonTime(startTime: string, duration: number, locale: string = 'en') {
  const [h, m] = startTime.split(':').map((part) => Number(part) || 0);
  const start = new Date(2000, 0, 1, h, m);
  const end = new Date(start.getTime() + duration * 60_000);
  const bcp = locale === 'uk' ? 'uk-UA' : 'en-US';
  const fmt = (date: Date) => date.toLocaleTimeString(bcp, { hour: 'numeric', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function lessonPageSubtitle(
  draft: { date: string; startTime: string; duration: number },
  statusLabel: string,
  hubLabel: string,
  locale: string = 'en',
) {
  const schedule = `${formatLongDate(draft.date, locale)} · ${formatLessonTime(draft.startTime, draft.duration, locale)}`;
  return `${hubLabel} · ${schedule} · ${statusLabel}`;
}

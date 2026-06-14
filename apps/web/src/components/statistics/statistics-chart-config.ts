export const PIE_COLORS = [
  'var(--green)',
  'var(--blue)',
  'var(--purple)',
  'var(--orange)',
  'var(--text-faint)',
];

export const CHART_TOOLTIP_STYLE = {
  borderColor: 'var(--border)',
  borderRadius: 10,
  backgroundColor: 'var(--card)',
};
export const CHART_TOOLTIP_LABEL_STYLE = { color: 'var(--text-primary)' };
export const CHART_TOOLTIP_ITEM_STYLE = { color: 'var(--text-secondary)' };
export const CHART_LEGEND_STYLE = { color: 'var(--text-secondary)' };

export const CHART_MARGIN = { top: 8, right: 12, left: 0, bottom: 4 };
export const AXIS_TICK = { fontSize: 11, fill: 'var(--text-tertiary)' };

export const SECTION_INFO: Record<string, string> = {
  lessonsTrend: 'Completed lessons per day in the selected range.',
  vocabularyTrend: 'Words added, reviewed, and marked learned per day.',
  lessonStatusMix: 'Scheduled lesson statuses in the period.',
  vocabStatusMix: 'Current deck composition by card status.',
  practiceTrend: 'Practice minutes by activity type per day.',
  dailyGoalsTrend: 'Share of the four daily goal slots completed each day.',
  dailyGoalsSummary: 'Aggregate daily-goal completion for the whole period.',
  roster:
    'Per-student metrics for the selected period (lessons, practice, vocabulary, quizzes, speaking).',
};

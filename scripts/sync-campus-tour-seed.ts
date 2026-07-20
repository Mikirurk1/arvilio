/**
 * Sync CAMPUS_TOUR_SEED from Campus Level A + chapter + Help + first-words tracks.
 * Run from repo root: node --import tsx scripts/sync-campus-tour-seed.ts
 * Then: npm run seed:campus-ui -w @app/cms
 *
 * Payload trackIds:
 *   student | teacher | admin | adminPlatform — Level A + chapters
 *   helpStudent | helpTeacher | helpAdmin — Header ? encyclopedia
 *   firstWords — empty-deck first-words guide
 */
import { writeFileSync } from 'node:fs';
import { STUDENT_TOUR_STEPS } from '../apps/campus/src/components/tour/tracks/student.ts';
import { TEACHER_TOUR_STEPS } from '../apps/campus/src/components/tour/tracks/teacher.ts';
import { ADMIN_TOUR_STEPS } from '../apps/campus/src/components/tour/tracks/admin.ts';
import { ADMIN_PLATFORM_TOUR_STEPS } from '../apps/campus/src/components/tour/tracks/adminPlatform.ts';
import { STUDENT_TOUR_CHAPTERS } from '../apps/campus/src/components/tour/tracks/student-chapters.ts';
import { TEACHER_TOUR_CHAPTERS } from '../apps/campus/src/components/tour/tracks/teacher-chapters.ts';
import { ADMIN_TOUR_CHAPTERS } from '../apps/campus/src/components/tour/tracks/admin-chapters.ts';
import { STUDENT_HELP_STEPS } from '../apps/campus/src/components/tour/tracks/help-student.ts';
import { TEACHER_HELP_STEPS } from '../apps/campus/src/components/tour/tracks/help-teacher.ts';
import { ADMIN_HELP_STEPS } from '../apps/campus/src/components/tour/tracks/help-admin.ts';
import { getVocabFirstWordsSteps } from '../apps/campus/src/components/tour/vocab-first-words.ts';
import type { TourStep } from '../apps/campus/src/components/tour/tracks/types.ts';

function flattenChapters(chapters: Array<{ steps: TourStep[] }>): TourStep[] {
  return chapters.flatMap((c) => c.steps);
}

function dedupe(steps: TourStep[]): TourStep[] {
  const seen = new Set<string>();
  return steps.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

const tracks: Record<string, TourStep[]> = {
  student: dedupe([...STUDENT_TOUR_STEPS, ...flattenChapters(STUDENT_TOUR_CHAPTERS)]),
  teacher: dedupe([...TEACHER_TOUR_STEPS, ...flattenChapters(TEACHER_TOUR_CHAPTERS)]),
  admin: dedupe([...ADMIN_TOUR_STEPS, ...flattenChapters(ADMIN_TOUR_CHAPTERS)]),
  adminPlatform: dedupe([...ADMIN_PLATFORM_TOUR_STEPS]),
  helpStudent: dedupe([...STUDENT_HELP_STEPS]),
  helpTeacher: dedupe([...TEACHER_HELP_STEPS]),
  helpAdmin: dedupe([...ADMIN_HELP_STEPS]),
  firstWords: dedupe([...getVocabFirstWordsSteps()]),
};

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

let out = `/** Auto-synced from Campus tracks (Level A + chapters + Help + firstWords). Re-run: node --import tsx scripts/sync-campus-tour-seed.ts */\n`;out += `export const CAMPUS_TOUR_SEED: Array<{\n`;
out += `  trackId: string;\n`;
out += `  steps: Array<{\n`;
out += `    stepId: string;\n`;
out += `    area?: string;\n`;
out += `    target?: string;\n`;
out += `    locales: Record<'uk' | 'en', { title: string; body: string; ctaLabel?: string }>;\n`;
out += `  }>;\n`;
out += `}> = [\n`;

for (const [trackId, steps] of Object.entries(tracks)) {
  console.log(trackId, steps.length);
  out += `  {\n    trackId: '${trackId}',\n    steps: [\n`;
  for (const s of steps) {
    out += `      {\n        stepId: '${s.id}',\n`;
    if (s.area) out += `        area: '${esc(s.area)}',\n`;
    if (s.anchorId) out += `        target: '${esc(s.anchorId)}',\n`;
    const ukBody = s.uaIntent ?? s.body;
    out += `        locales: {\n`;
    out += `          en: { title: '${esc(s.title)}', body: '${esc(s.body)}' },\n`;
    out += `          uk: { title: '${esc(s.title)}', body: '${esc(ukBody)}' },\n`;
    out += `        },\n`;
    out += `      },\n`;
  }
  out += `    ],\n  },\n`;
}
out += `];\n`;

writeFileSync('packages/shared/types/src/lib/campus-tour-seed.ts', out);
console.log('wrote packages/shared/types/src/lib/campus-tour-seed.ts');

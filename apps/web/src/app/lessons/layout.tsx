'use client';

import { ScheduledLessonsProvider } from '@/features/lesson-modal/ScheduledLessonsProvider';

export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  return <ScheduledLessonsProvider>{children}</ScheduledLessonsProvider>;
}

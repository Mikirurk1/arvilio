/**
 * Data-driven first-login product tour (Phase 4.5.4). Editing steps here needs no
 * component changes. Element-anchored highlighting + a 3D mascot are later polish;
 * today each step is a "what / where / how" card. The mascot is a swappable asset.
 */
export interface TourStep {
  /** Stable id (also the mascot pose hook later: greet/point/celebrate). */
  id: string;
  title: string;
  body: string;
  /** Optional in-app area this step is about (used for the "where" hint / future anchor). */
  area?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to your school 👋',
    body: 'A quick tour of the essentials — under a minute. You can skip anytime and replay later from Help.',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    body: 'Your daily overview: upcoming lessons, recent activity, and quick actions.',
    area: 'Dashboard',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    body: 'Plan and reschedule lessons. Switch between week and month views.',
    area: 'Calendar',
  },
  {
    id: 'lessons',
    title: 'Lessons & materials',
    body: 'Run lessons and attach materials — books, audio, video, and quizzes.',
    area: 'Lessons',
  },
  {
    id: 'students',
    title: 'Students',
    body: 'Manage your learners, their progress, and per-student billing.',
    area: 'Students',
  },
  {
    id: 'billing',
    title: 'Billing',
    body: 'Set lesson pricing and payment methods. During the trial everything is free to explore.',
    area: 'Billing',
  },
  {
    id: 'done',
    title: "You're all set 🎉",
    body: 'That’s the tour. Create your first lesson to get going — Help is always one click away.',
  },
];

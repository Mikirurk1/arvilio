export type AssistantAudience = 'student' | 'teacher' | 'admin';

export type AssistantCorpusChunk = {
  id: string;
  /** Role ACL — student never sees teacher/admin-only chunks. */
  audience: AssistantAudience[];
  title: string;
  body: string;
  /** Optional deep link for navigate tool. */
  navHref?: string;
  keywords: string[];
};

/**
 * Curated product-help corpus (no curriculum / quiz keys).
 * Regenerated loosely from Help encyclopedia + FAQ; keep free of exercise answers.
 */
export const ASSISTANT_CORPUS: AssistantCorpusChunk[] = [
  {
    id: 'faq-arvi-chat',
    audience: ['student', 'teacher', 'admin'],
    title: 'Ask Arvi',
    body: 'Click the Arvi mascot in the bottom-right corner to open a help chat. Arvi explains product navigation and UI; it will not solve homework or quiz answers.',
    keywords: ['arvi', 'chat', 'help', 'assistant', 'mascot', 'допомога', 'арві'],
  },
  {
    id: 'faq-header-help',
    audience: ['student', 'teacher', 'admin'],
    title: 'Header help (?)',
    body: 'The ? button in the header opens page-scoped Help encyclopedia tips for the current screen. Use Learning mode in Profile → Account to show or hide it.',
    keywords: ['help', '?', 'довідка', 'learning mode', 'encyclopedia'],
  },
  {
    id: 'nav-dashboard',
    audience: ['student', 'teacher', 'admin'],
    title: 'Dashboard',
    body: 'Dashboard is your home. Students see next lesson, quick actions, stats, and review. Teachers see today’s schedule and shortcuts. Admins see school overview.',
    navHref: '/dashboard',
    keywords: ['dashboard', 'home', 'головна', 'дашборд'],
  },
  {
    id: 'nav-calendar',
    audience: ['student', 'teacher', 'admin'],
    title: 'Calendar',
    body: 'Open Calendar to see scheduled lessons. Click a lesson card to enter the lesson room with plan, materials, and homework.',
    navHref: '/calendar',
    keywords: ['calendar', 'schedule', 'календар', 'розклад', 'уроки'],
  },
  {
    id: 'nav-practice',
    audience: ['student'],
    title: 'Practice',
    body: 'Practice holds vocabulary review, quizzes, and speaking assignments assigned to you. Badges on Quick actions mean something is waiting.',
    navHref: '/practice',
    keywords: ['practice', 'vocabulary', 'quiz', 'speaking', 'практика', 'слова'],
  },
  {
    id: 'nav-vocabulary',
    audience: ['student', 'teacher', 'admin'],
    title: 'Vocabulary',
    body: 'Vocabulary cards use spaced repetition. Students review their deck; teachers/admins can manage school dictionary entries from System when allowed.',
    navHref: '/vocabulary',
    keywords: ['vocabulary', 'words', 'cards', 'словник', 'картки'],
  },
  {
    id: 'nav-chat',
    audience: ['student', 'teacher', 'admin'],
    title: 'School chat',
    body: 'Chat is human messaging with teachers and classmates — separate from Arvi AI help. Open Conversations from the Chat page.',
    navHref: '/chat',
    keywords: ['chat', 'message', 'чат', 'повідомлення'],
  },
  {
    id: 'nav-payment-student',
    audience: ['student'],
    title: 'Payments (student)',
    body: 'Students pay for lesson packages from the Payment page. Balance shows prepaid lesson credits remaining.',
    navHref: '/payment',
    keywords: ['payment', 'pay', 'balance', 'оплата', 'баланс', 'кредити'],
  },
  {
    id: 'nav-profile',
    audience: ['student', 'teacher', 'admin'],
    title: 'Profile',
    body: 'Profile holds account settings, notifications, Learning mode (Help button), tour Replay, and linked accounts.',
    navHref: '/profile',
    keywords: ['profile', 'settings', 'account', 'профіль', 'налаштування'],
  },
  {
    id: 'nav-materials',
    audience: ['teacher', 'admin'],
    title: 'Materials library',
    body: 'Teachers and admins open Materials to upload and organize school content (boards, books, media, files) and attach items to lessons from the lesson room or library picker. Students do not manage the library — they only see materials attached to their lessons.',
    navHref: '/materials',
    keywords: [
      'materials',
      'library',
      'upload',
      'attach',
      'матеріали',
      'бібліотека',
      'файл',
      'урок',
      'lesson',
    ],
  },
  {
    id: 'help-materials-facts',
    audience: ['teacher', 'admin'],
    title: 'Materials — quick facts',
    body: 'Typical flow: upload in Materials → organize → open a lesson → attach from the library. Attached items show in the lesson room for that class. Prefer unlinking from a lesson before deleting a shared library item. Media captions / AI assist may need the Pro plan.',
    navHref: '/materials',
    keywords: [
      'materials',
      'attach',
      'upload',
      'lesson',
      'library',
      'матеріали',
      'прикріпити',
      'завантажити',
      'урок',
      'факти',
      'translate',
      'переклад',
    ],
  },
  {
    id: 'nav-students',
    audience: ['teacher', 'admin'],
    title: 'Students',
    body: 'Manage student profiles, groups, and progress from the Students section.',
    navHref: '/students',
    keywords: ['students', 'learners', 'студенти', 'учні', 'групи'],
  },
  {
    id: 'nav-finance',
    audience: ['admin'],
    title: 'Finance',
    body: 'Admins track lesson balance ledgers, staff payouts, and school payment methods under Finance.',
    navHref: '/finance',
    keywords: ['finance', 'payout', 'ledger', 'фінанси', 'виплати'],
  },
  {
    id: 'nav-system',
    audience: ['admin'],
    title: 'System settings',
    body: 'System is for school operators: branding, domains, email, dictionary, connections (OAuth), payments, and AI assistant LLM keys.',
    navHref: '/system',
    keywords: ['system', 'integrations', 'llm', 'ai', 'система', 'інтеграції'],
  },
  {
    id: 'nav-billing-admin',
    audience: ['admin'],
    title: 'School subscription',
    body: 'School SaaS plan and billing live under Billing. AI assist (Arvi chat, captions) requires the Pro plan feature.',
    navHref: '/billing',
    keywords: ['billing', 'subscription', 'plan', 'pro', 'підписка', 'тариф'],
  },
  {
    id: 'help-stu-dash-hero',
    audience: ['student'],
    title: 'Your next step',
    body: 'The hero banner points at the most useful action right now — a lesson, word review, or practice.',
    navHref: '/dashboard',
    keywords: ['hero', 'next', 'dashboard', 'банер'],
  },
  {
    id: 'help-stu-lessons',
    audience: ['student'],
    title: 'Lessons',
    body: 'Open a lesson from Calendar or Dashboard. Inside you find the plan, materials, Meet/Zoom link, and homework. Ask your teacher if homework is unclear — Arvi will not give exercise answers.',
    navHref: '/calendar',
    keywords: ['lesson', 'homework', 'дз', 'домашка', 'урок'],
  },
  {
    id: 'help-tea-calendar',
    audience: ['teacher', 'admin'],
    title: 'Teacher calendar',
    body: 'Create and manage scheduled lessons from Calendar. Attach materials and set homework from the lesson room.',
    navHref: '/calendar',
    keywords: ['schedule', 'create lesson', 'календар', 'створити', 'матеріали'],
  },
  {
    id: 'help-adm-payments',
    audience: ['admin'],
    title: 'Payment providers',
    body: 'Configure Stripe and other PSPs under System → Payments. Secrets are encrypted; never share raw keys in chat.',
    navHref: '/system',
    keywords: ['stripe', 'payments', 'secrets', 'платежі'],
  },
  {
    id: 'policy-no-answers',
    audience: ['student', 'teacher', 'admin'],
    title: 'Academic honesty',
    body: 'Arvi refuses quiz answers, homework solutions, exercise keys, and speaking model answers. It can still explain Campus UI, Materials facts, and short UI label translations for staff. Students should ask their teacher for graded work help.',
    keywords: ['quiz', 'homework', 'answer', 'cheat', 'відповідь', 'тест'],
  },
];

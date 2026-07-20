/** Auto-synced from Campus tracks (Level A + chapters + Help + firstWords). Re-run: node --import tsx scripts/sync-campus-tour-seed.ts */
export const CAMPUS_TOUR_SEED: Array<{
  trackId: string;
  steps: Array<{
    stepId: string;
    area?: string;
    target?: string;
    locales: Record<'uk' | 'en', { title: string; body: string; ctaLabel?: string }>;
  }>;
}> = [
  {
    trackId: 'student',
    steps: [
      {
        stepId: 'stu-welcome',
        locales: {
          en: { title: 'Welcome — I\'m Arvi', body: 'Hi! I\'ll show you around step by step. You can skip anytime and replay later from Profile → Account.' },
          uk: { title: 'Welcome — I\'m Arvi', body: 'Привітання; replay з Profile → Account' },
        },
      },
      {
        stepId: 'stu-dashboard',
        area: 'Dashboard',
        target: 'dash-hero',
        locales: {
          en: { title: 'Your dashboard', body: 'This is your daily hub. The top banner points at your next useful action — a lesson, word review, or practice.' },
          uk: { title: 'Your dashboard', body: 'Дашборд: герой-банер' },
        },
      },
      {
        stepId: 'stu-dashboard-actions',
        area: 'Dashboard',
        target: 'dash-quick-actions',
        locales: {
          en: { title: 'Quick actions', body: 'Shortcuts jump to Calendar, Practice, Vocabulary, Chat, and Quizzes. Badges on Practice or Chat mean something is waiting.' },
          uk: { title: 'Quick actions', body: 'Швидкі дії + бейджі' },
        },
      },
      {
        stepId: 'stu-daily-goals',
        area: 'Dashboard',
        target: 'dash-daily-goals',
        locales: {
          en: { title: 'Daily goals', body: 'Small daily targets keep your streak alive. Check them off from the dashboard when you practice.' },
          uk: { title: 'Daily goals', body: 'Щоденні цілі' },
        },
      },
      {
        stepId: 'stu-lessons',
        area: 'Lessons',
        locales: {
          en: { title: 'Lessons list', body: 'Your class list — upcoming and past, with homework status on the highlight cards. There is no separate Homework page.' },
          uk: { title: 'Lessons list', body: 'Список уроків / ДЗ статус' },
        },
      },
      {
        stepId: 'stu-lesson-room',
        area: 'Lessons',
        locales: {
          en: { title: 'Inside a lesson', body: 'Open any lesson for the plan, materials, video join, and homework. Homework opens after the lesson is completed. You can also add vocabulary from the lesson.' },
          uk: { title: 'Inside a lesson', body: 'Кімната уроку: план, файли, відео, ДЗ' },
        },
      },
      {
        stepId: 'stu-practice',
        area: 'Practice',
        target: 'practice-hub-cards',
        locales: {
          en: { title: 'Practice hub', body: 'Your skill gym. Four modes are live: Vocabulary, Quiz, Speaking, and Irregular verbs. Games and Challenges are coming soon — ignore them for now.' },
          uk: { title: 'Practice hub', body: 'Хаб практики' },
        },
      },
      {
        stepId: 'stu-vocabulary',
        area: 'Vocabulary',
        target: 'practice-card-vocabulary',
        locales: {
          en: { title: 'Vocabulary deck', body: 'From Practice, open Vocabulary for your word cards. Switch List, Flashcards, or Play. Add words here or from a lesson. Play needs at least a couple of cards.' },
          uk: { title: 'Vocabulary deck', body: 'Словник: List / Flashcards / Play' },
        },
      },
      {
        stepId: 'stu-practice-stats',
        area: 'Practice',
        target: 'practice-stats',
        locales: {
          en: { title: 'Practice stats', body: 'Week stats show how much time you spent practicing. Due reviews and open quizzes also feed the Practice badge.' },
          uk: { title: 'Practice stats', body: 'Статистика практики' },
        },
      },
      {
        stepId: 'stu-quiz',
        area: 'Quiz',
        locales: {
          en: { title: 'Quizzes', body: 'Quizzes live under Practice too (and /quiz). Finish assigned quizzes to clear the Practice badge. Wrong answers can send words back into review.' },
          uk: { title: 'Quizzes', body: 'Квізи з Practice' },
        },
      },
      {
        stepId: 'stu-speaking',
        area: 'Speaking',
        locales: {
          en: { title: 'Speaking', body: 'Speaking topics let you record answers in the browser. Your teacher can leave feedback. Mic permission is required the first time.' },
          uk: { title: 'Speaking', body: 'Speaking + mic' },
        },
      },
      {
        stepId: 'stu-irregular',
        area: 'Irregular verbs',
        locales: {
          en: { title: 'Irregular verbs', body: 'Drill V2/V3 forms in a separate catalog — results are not saved to your vocabulary deck, but time still counts toward Practice this week.' },
          uk: { title: 'Irregular verbs', body: 'Неправильні дієслова' },
        },
      },
      {
        stepId: 'stu-calendar',
        area: 'Calendar',
        locales: {
          en: { title: 'Calendar', body: 'Check when your next lesson is in week or month view. Tap a lesson for details.' },
          uk: { title: 'Calendar', body: 'Розклад week/month' },
        },
      },
      {
        stepId: 'stu-request-lesson',
        area: 'Calendar',
        target: 'calendar-request-lesson',
        locales: {
          en: { title: 'Request a lesson', body: 'Need a new slot? Use Request lesson on the calendar — it opens Chat with your teacher. You cannot drag-create lessons yourself.' },
          uk: { title: 'Request a lesson', body: 'Запит уроку через чат' },
        },
      },
      {
        stepId: 'stu-chat',
        area: 'Chat',
        target: 'chat-new-message',
        locales: {
          en: { title: 'Chat', body: 'Message your teacher here. Unread counts show as a badge. Attachments expire after 24 hours. Use New message to start a thread.' },
          uk: { title: 'Chat', body: 'Чат; вкладення 24 год' },
        },
      },
      {
        stepId: 'stu-payment',
        area: 'Payment',
        target: 'payment-balance',
        locales: {
          en: { title: 'Payment & lesson balance', body: 'Your lesson credits live here. Buy a package or follow bank instructions. This is not the school\'s SaaS subscription — it\'s how you pay for lessons.' },
          uk: { title: 'Payment & lesson balance', body: 'Баланс уроків ≠ Subscription школи' },
        },
      },
      {
        stepId: 'stu-profile',
        area: 'Profile',
        locales: {
          en: { title: 'Profile & settings', body: 'Update name, password, notifications, appearance, and linked accounts. Keep your timezone accurate for the calendar.' },
          uk: { title: 'Profile & settings', body: 'Профіль + timezone' },
        },
      },
      {
        stepId: 'stu-done',
        locales: {
          en: { title: 'You\'re ready', body: 'That\'s the map. Next you can try short scenarios — a practice peek, request lesson, payment, and chat. Replay anytime from Profile → Account.' },
          uk: { title: 'You\'re ready', body: 'Фініш → chapters' },
        },
      },
      {
        stepId: 'stu-ch-practice-hub',
        area: 'Practice round',
        locales: {
          en: { title: 'Open Practice', body: 'Open Practice from the sidebar — your skill gym.' },
          uk: { title: 'Open Practice', body: 'Хаб практики' },
        },
      },
      {
        stepId: 'stu-ch-practice-vocab',
        area: 'Practice round',
        target: 'practice-card-vocabulary',
        locales: {
          en: { title: 'Open Vocabulary', body: 'Open Vocabulary from the hub (or /vocabulary). List, Flashcards, or Play — any view counts.' },
          uk: { title: 'Open Vocabulary', body: 'Словник' },
        },
      },
      {
        stepId: 'stu-ch-request-calendar',
        area: 'Request lesson',
        locales: {
          en: { title: 'Open Calendar', body: 'Open Calendar to see your schedule.' },
          uk: { title: 'Open Calendar', body: 'Календар' },
        },
      },
      {
        stepId: 'stu-ch-request-cta',
        area: 'Request lesson',
        target: 'calendar-request-lesson',
        locales: {
          en: { title: 'Request lesson', body: 'Find Request lesson on the calendar — it opens Chat. Opening Chat alone also counts.' },
          uk: { title: 'Request lesson', body: 'Request lesson CTA' },
        },
      },
      {
        stepId: 'stu-ch-payment-open',
        area: 'Payment',
        locales: {
          en: { title: 'Open Payment', body: 'Open Payment from the sidebar.' },
          uk: { title: 'Open Payment', body: 'Payment' },
        },
      },
      {
        stepId: 'stu-ch-payment-balance',
        area: 'Payment',
        target: 'payment-balance',
        locales: {
          en: { title: 'Your balance', body: 'Find the balance card — packages and bank instructions live nearby.' },
          uk: { title: 'Your balance', body: 'Баланс уроків' },
        },
      },
      {
        stepId: 'stu-ch-chat-open',
        area: 'Chat',
        locales: {
          en: { title: 'Open Chat', body: 'Open Chat from the sidebar.' },
          uk: { title: 'Open Chat', body: 'Чат' },
        },
      },
      {
        stepId: 'stu-ch-chat-new',
        area: 'Chat',
        target: 'chat-new-message',
        locales: {
          en: { title: 'New message', body: 'Spot New message. You do not have to send anything for this tour.' },
          uk: { title: 'New message', body: 'New message' },
        },
      },
    ],
  },
  {
    trackId: 'teacher',
    steps: [
      {
        stepId: 'tea-welcome',
        locales: {
          en: { title: 'Welcome, teacher', body: 'I\'m Arvi. We\'ll walk through planning, materials, students, and feedback — skip anytime. Replay later from Profile → Account.' },
          uk: { title: 'Welcome, teacher', body: 'Привітання вчителя' },
        },
      },
      {
        stepId: 'tea-dashboard',
        area: 'Dashboard',
        target: 'dash-hero',
        locales: {
          en: { title: 'Teaching dashboard', body: 'Start here each day: today\'s lessons, homework waiting for review, and shortcuts including New lesson and Students.' },
          uk: { title: 'Teaching dashboard', body: 'Дашборд + ДЗ на перевірку' },
        },
      },
      {
        stepId: 'tea-dashboard-homework',
        area: 'Dashboard',
        target: 'dash-homework-review',
        locales: {
          en: { title: 'Homework to review', body: 'When students submit after a completed lesson, items appear in your homework queue on the dashboard. Open a lesson to accept or leave feedback.' },
          uk: { title: 'Homework to review', body: 'Черга ДЗ на дашборді' },
        },
      },
      {
        stepId: 'tea-dashboard-actions',
        area: 'Dashboard',
        target: 'dash-quick-actions',
        locales: {
          en: { title: 'Quick actions', body: 'Shortcuts include Calendar, Students, and New lesson. Use them to jump into planning without hunting the sidebar.' },
          uk: { title: 'Quick actions', body: 'Швидкі дії викладача' },
        },
      },
      {
        stepId: 'tea-calendar',
        area: 'Calendar',
        locales: {
          en: { title: 'Plan on the calendar', body: 'Create, move, and resize lessons in week or month view. Conflicts and series edits confirm separately; past slots stay locked.' },
          uk: { title: 'Plan on the calendar', body: 'Календар DnD' },
        },
      },
      {
        stepId: 'tea-calendar-create',
        area: 'Calendar',
        target: 'header-create-lesson',
        locales: {
          en: { title: 'New lesson', body: 'Use New lesson in the header or on the calendar. The modal has Setup (who/when), Content (materials), and Homework — cancel anytime without saving.' },
          uk: { title: 'New lesson', body: 'Модалка створення уроку + header CTA' },
        },
      },
      {
        stepId: 'tea-lessons',
        area: 'Lessons',
        locales: {
          en: { title: 'Lessons list', body: 'The Lessons page lists your schedule with homework status. Open a card to enter the lesson room.' },
          uk: { title: 'Lessons list', body: 'Список уроків' },
        },
      },
      {
        stepId: 'tea-lesson-room',
        area: 'Lessons',
        locales: {
          en: { title: 'Lesson room', body: 'Inside a lesson: edit the plan, attach library materials, set homework, join video, and review student responses. Students submit homework only after the lesson is completed.' },
          uk: { title: 'Lesson room', body: 'Хаб уроку' },
        },
      },
      {
        stepId: 'tea-materials',
        area: 'Materials',
        target: 'materials-create',
        locales: {
          en: { title: 'Materials library', body: 'Upload boards, books, audio, and video once, then attach them to many lessons. Books open in the in-app viewer. Watch storage if your school has a quota.' },
          uk: { title: 'Materials library', body: 'Бібліотека матеріалів' },
        },
      },
      {
        stepId: 'tea-students',
        area: 'Students',
        locales: {
          en: { title: 'Students roster', body: 'Your roster lives here. If the school enabled group lessons, switch to Groups for shared templates.' },
          uk: { title: 'Students roster', body: 'Учні / групи' },
        },
      },
      {
        stepId: 'tea-groups',
        area: 'Students',
        target: 'students-groups-tab',
        locales: {
          en: { title: 'Groups', body: 'Groups hold shared lesson templates and members. Schedule group lessons by picking a named group — not ad-hoc billing.' },
          uk: { title: 'Groups', body: 'Групи (якщо groupLessons увімкнено)' },
        },
      },
      {
        stepId: 'tea-student-practice',
        area: 'Students',
        locales: {
          en: { title: 'Assign practice', body: 'Open a student → Practice tab to assign vocabulary, quizzes, or speaking. From the student hero you can also jump straight into a DM.' },
          uk: { title: 'Assign practice', body: 'Student Practice tab' },
        },
      },
      {
        stepId: 'tea-chat',
        area: 'Chat',
        target: 'chat-new-message',
        locales: {
          en: { title: 'Chat', body: 'Message students and keep feedback in one place. Calendar "request lesson" from a student lands here as a thread with you. Use New message to start a DM.' },
          uk: { title: 'Chat', body: 'Чат зі студентами' },
        },
      },
      {
        stepId: 'tea-profile',
        area: 'Profile',
        locales: {
          en: { title: 'Profile & connections', body: 'Your account, appearance, and Connections — link Google or Zoom under the Connections tab so you can host video lessons.' },
          uk: { title: 'Profile & connections', body: 'OAuth для відео' },
        },
      },
      {
        stepId: 'tea-done',
        locales: {
          en: { title: 'Ready to teach', body: 'Next you can try short scenarios — open a lesson draft, peek at materials, and more. Replay this tour anytime from Profile → Account.' },
          uk: { title: 'Ready to teach', body: 'Фініш → chapters' },
        },
      },
      {
        stepId: 'tea-ch-lesson-open',
        area: 'First lesson',
        target: 'header-create-lesson',
        locales: {
          en: { title: 'Open New lesson', body: 'Click New lesson in the header (or on the calendar). The lesson modal should appear.' },
          uk: { title: 'Open New lesson', body: 'Відкрити модалку уроку' },
        },
      },
      {
        stepId: 'tea-ch-lesson-setup',
        area: 'First lesson',
        target: 'lesson-modal-setup',
        locales: {
          en: { title: 'Peek at setup', body: 'The Setup tab is where you pick the student, time, and format. Glance at the fields — you can close without saving.' },
          uk: { title: 'Peek at setup', body: 'Вкладка Setup в модалці' },
        },
      },
      {
        stepId: 'tea-ch-materials-open',
        area: 'Materials',
        locales: {
          en: { title: 'Open Materials', body: 'Go to Materials from the sidebar — your shared library of boards, books, and media.' },
          uk: { title: 'Open Materials', body: 'Відкрити матеріали' },
        },
      },
      {
        stepId: 'tea-ch-materials-create',
        area: 'Materials',
        target: 'materials-create',
        locales: {
          en: { title: 'Find create', body: 'Spot the create / upload button. Opening the dialog is enough — cancel anytime.' },
          uk: { title: 'Find create', body: 'Кнопка створення матеріалу' },
        },
      },
      {
        stepId: 'tea-ch-students-roster',
        area: 'Students',
        locales: {
          en: { title: 'Open Students', body: 'Open Students from the sidebar to see your roster.' },
          uk: { title: 'Open Students', body: 'Список учнів' },
        },
      },
      {
        stepId: 'tea-ch-students-card',
        area: 'Students',
        target: 'student-card',
        locales: {
          en: { title: 'Open a student', body: 'If you have learners, open a student card. Empty roster? Skip — your admin can invite someone later.' },
          uk: { title: 'Open a student', body: 'Картка учня' },
        },
      },
      {
        stepId: 'tea-ch-groups-tab',
        area: 'Groups',
        target: 'students-groups-tab',
        locales: {
          en: { title: 'Open Groups', body: 'On Students, switch to the Groups tab.' },
          uk: { title: 'Open Groups', body: 'Вкладка Groups' },
        },
      },
      {
        stepId: 'tea-ch-chat-open',
        area: 'Chat',
        locales: {
          en: { title: 'Open Chat', body: 'Open Chat from the sidebar.' },
          uk: { title: 'Open Chat', body: 'Відкрити чат' },
        },
      },
      {
        stepId: 'tea-ch-chat-new',
        area: 'Chat',
        target: 'chat-new-message',
        locales: {
          en: { title: 'Find New message', body: 'Spot the New message control — you do not have to send anything.' },
          uk: { title: 'Find New message', body: 'New message' },
        },
      },
      {
        stepId: 'tea-ch-video-profile',
        area: 'Video setup',
        locales: {
          en: { title: 'Open Profile', body: 'Open Profile & Settings from the sidebar.' },
          uk: { title: 'Open Profile', body: 'Профіль' },
        },
      },
      {
        stepId: 'tea-ch-video-connections',
        area: 'Video setup',
        target: 'profile-connections',
        locales: {
          en: { title: 'Connections tab', body: 'Open the Connections tab to link Google Meet or Zoom. Linking is optional for this tour.' },
          uk: { title: 'Connections tab', body: 'Connections для відео' },
        },
      },
    ],
  },
  {
    trackId: 'admin',
    steps: [
      {
        stepId: 'adm-welcome',
        locales: {
          en: { title: 'Your school workspace', body: 'I\'m Arvi. Next: people, subscription, and system settings. If you already used the wizard, we won\'t repeat those forms. Replay later from Profile → Account.' },
          uk: { title: 'Your school workspace', body: 'Привітання після wizard' },
        },
      },
      {
        stepId: 'adm-dashboard',
        area: 'Dashboard',
        target: 'dash-hero',
        locales: {
          en: { title: 'School dashboard', body: 'Your pulse page — teaching shortcuts plus an entitlements meter for seats and storage that mirrors Subscription.' },
          uk: { title: 'School dashboard', body: 'Дашборд + entitlements' },
        },
      },
      {
        stepId: 'adm-entitlements',
        area: 'Dashboard',
        target: 'dash-entitlements',
        locales: {
          en: { title: 'Seats & storage', body: 'The entitlements meter tracks plan seats and storage. Open Subscription to upgrade or apply a promo.' },
          uk: { title: 'Seats & storage', body: 'Entitlements на дашборді' },
        },
      },
      {
        stepId: 'adm-students',
        area: 'Students',
        locales: {
          en: { title: 'Students & groups', body: 'Manage learners here. Open a profile for progress, practice, and lesson balance. Groups appear when System → General has group lessons on.' },
          uk: { title: 'Students & groups', body: 'Учні / групи' },
        },
      },
      {
        stepId: 'adm-groups',
        area: 'Students',
        target: 'students-groups-tab',
        locales: {
          en: { title: 'Groups', body: 'When group lessons are enabled, switch to Groups for templates and members.' },
          uk: { title: 'Groups', body: 'Groups tab' },
        },
      },
      {
        stepId: 'adm-admin',
        area: 'Admin',
        target: 'admin-create-form',
        locales: {
          en: { title: 'Create accounts', body: 'Admin creates and removes accounts and supports bulk student import. Temporary passwords go out by email. Seat limits can block new students — use the form below the metrics.' },
          uk: { title: 'Create accounts', body: 'Створення акаунтів' },
        },
      },
      {
        stepId: 'adm-staff',
        area: 'Staff',
        locales: {
          en: { title: 'Staff', body: 'Teachers and staff cards — open someone for compensation settings and earnings history. Pair with Finance when you record payouts.' },
          uk: { title: 'Staff', body: 'Персонал' },
        },
      },
      {
        stepId: 'adm-billing',
        area: 'Subscription',
        locales: {
          en: { title: 'School subscription', body: 'Billing (Subscription in the nav) is your school\'s plan with Arvilio — seats, storage, trial, promos. Not where students buy lesson packs.' },
          uk: { title: 'School subscription', body: 'SaaS підписка' },
        },
      },
      {
        stepId: 'adm-system',
        area: 'System',
        locales: {
          en: { title: 'System overview', body: 'System is the control room: General, Email, Dictionary, Connections, Payments, Payouts, Domains, Branding.' },
          uk: { title: 'System overview', body: 'System огляд' },
        },
      },
      {
        stepId: 'adm-system-payments',
        area: 'System',
        target: 'system-tab-payments-trigger',
        locales: {
          en: { title: 'Payments for students', body: 'Open System → Payments for methods, packages, and invoice templates. Students only see checkout on Payment after this is configured. Peeking at the tab is enough for now.' },
          uk: { title: 'Payments for students', body: 'System → Payments' },
        },
      },
      {
        stepId: 'adm-system-general',
        area: 'System',
        locales: {
          en: { title: 'Group lessons & video', body: 'System → General toggles group lessons (unlocks Students → Groups) and the video meetings provider panel.' },
          uk: { title: 'Group lessons & video', body: 'General: groups + video' },
        },
      },
      {
        stepId: 'adm-materials',
        area: 'Materials',
        target: 'materials-create',
        locales: {
          en: { title: 'School materials', body: 'Shared library for boards, books, and media. Storage counts against your subscription quota.' },
          uk: { title: 'School materials', body: 'Матеріали' },
        },
      },
      {
        stepId: 'adm-finance',
        area: 'Finance',
        locales: {
          en: { title: 'Finance & payouts', body: 'School money-out to teachers — charts, history, Record payout. Rates live under Staff; defaults under System → Payouts.' },
          uk: { title: 'Finance & payouts', body: 'Фінанси' },
        },
      },
      {
        stepId: 'adm-calendar',
        area: 'Calendar',
        locales: {
          en: { title: 'School calendar', body: 'See the whole schedule; filter audience and teachers. Admins can plan lessons too.' },
          uk: { title: 'School calendar', body: 'Календар школи' },
        },
      },
      {
        stepId: 'adm-chat',
        area: 'Chat',
        target: 'chat-new-message',
        locales: {
          en: { title: 'Chat', body: 'Message staff and students. Admins can also create group chats.' },
          uk: { title: 'Chat', body: 'Чат / group chat' },
        },
      },
      {
        stepId: 'adm-profile',
        area: 'Profile',
        locales: {
          en: { title: 'Your profile', body: 'Personal settings, appearance, and connections. Replay this tour from the Account tab anytime.' },
          uk: { title: 'Your profile', body: 'Профіль адміна' },
        },
      },
      {
        stepId: 'adm-done',
        locales: {
          en: { title: 'You\'re set', body: 'Next: try short scenarios — create a learner form, peek at Payments, Subscription, and more. Or open Subscription if the trial is ending.' },
          uk: { title: 'You\'re set', body: 'Фініш → chapters' },
        },
      },
      {
        stepId: 'adm-ch-create-open',
        area: 'Create learner',
        locales: {
          en: { title: 'Open Admin', body: 'Open Admin from the sidebar — create and remove accounts, plus bulk import.' },
          uk: { title: 'Open Admin', body: 'Сторінка Admin' },
        },
      },
      {
        stepId: 'adm-ch-create-form',
        area: 'Create learner',
        target: 'admin-create-form',
        locales: {
          en: { title: 'Find create form', body: 'Spot the create-account form. You can leave it empty — no need to submit.' },
          uk: { title: 'Find create form', body: 'Форма створення акаунта' },
        },
      },
      {
        stepId: 'adm-ch-payments-system',
        area: 'Student payments',
        locales: {
          en: { title: 'Open System', body: 'Open System — the school control room.' },
          uk: { title: 'Open System', body: 'System' },
        },
      },
      {
        stepId: 'adm-ch-payments-tab',
        area: 'Student payments',
        target: 'system-tab-payments',
        locales: {
          en: { title: 'Payments tab', body: 'Switch to the Payments tab. Configure methods later — peeking is enough now.' },
          uk: { title: 'Payments tab', body: 'System → Payments' },
        },
      },
      {
        stepId: 'adm-ch-billing-open',
        area: 'Subscription',
        locales: {
          en: { title: 'Open Subscription', body: 'Open Subscription from the sidebar to see seats, storage, and plan.' },
          uk: { title: 'Open Subscription', body: 'SaaS підписка' },
        },
      },
      {
        stepId: 'adm-ch-billing-plan',
        area: 'Subscription',
        target: 'billing-plan',
        locales: {
          en: { title: 'Current plan', body: 'Find the current plan card — upgrade and promos live here when needed.' },
          uk: { title: 'Current plan', body: 'Картка плану' },
        },
      },
      {
        stepId: 'adm-ch-finance-open',
        area: 'Finance',
        locales: {
          en: { title: 'Open Finance', body: 'Open Finance from the sidebar — money out to teachers.' },
          uk: { title: 'Open Finance', body: 'Фінанси' },
        },
      },
      {
        stepId: 'adm-ch-finance-payout',
        area: 'Finance',
        target: 'finance-record-payout',
        locales: {
          en: { title: 'Record payout control', body: 'Find a Record payout control. Opening the form is optional; do not submit.' },
          uk: { title: 'Record payout control', body: 'Record payout' },
        },
      },
      {
        stepId: 'adm-ch-staff-open',
        area: 'Staff',
        locales: {
          en: { title: 'Open Staff', body: 'Open Staff from the sidebar.' },
          uk: { title: 'Open Staff', body: 'Персонал' },
        },
      },
      {
        stepId: 'adm-ch-staff-roster',
        area: 'Staff',
        target: 'staff-roster',
        locales: {
          en: { title: 'Staff list', body: 'Browse staff cards — open someone later for compensation settings.' },
          uk: { title: 'Staff list', body: 'Список персоналу' },
        },
      },
    ],
  },
  {
    trackId: 'adminPlatform',
    steps: [
      {
        stepId: 'sup-welcome',
        locales: {
          en: { title: 'Platform operator in school view', body: 'You\'re in a school workspace with elevated access. Day-to-day school ops match the admin map; cross-school actions belong in the platform console.' },
          uk: { title: 'Platform operator in school view', body: 'Короткий тур для super_admin у школі' },
        },
      },
      {
        stepId: 'sup-system',
        area: 'System',
        locales: {
          en: { title: 'System', body: 'School integrations and branding live here. Prefer the platform app for schools list, suspend, and audit.' },
          uk: { title: 'System', body: 'System школи' },
        },
      },
      {
        stepId: 'sup-billing',
        area: 'Subscription',
        locales: {
          en: { title: 'Subscription', body: 'This school\'s SaaS plan and quotas.' },
          uk: { title: 'Subscription', body: 'Підписка школи' },
        },
      },
      {
        stepId: 'sup-done',
        locales: {
          en: { title: 'Done', body: 'Use the platform app for fleet-wide work. Replay this short tour from Profile → Account if needed.' },
          uk: { title: 'Done', body: 'Фініш' },
        },
      },
    ],
  },
  {
    trackId: 'helpStudent',
    steps: [
      {
        stepId: 'help-stu-dash-hero',
        area: 'Dashboard',
        target: 'dash-hero',
        locales: {
          en: { title: 'Your next step', body: 'The hero banner points at the most useful action right now — a lesson, word review, or practice. Tap it when you are not sure where to start.' },
          uk: { title: 'Your next step', body: 'Герой-банер: наступна дія' },
        },
      },
      {
        stepId: 'help-stu-dash-quick-actions',
        area: 'Dashboard',
        target: 'dash-quick-actions',
        locales: {
          en: { title: 'Quick actions', body: 'Shortcuts to Calendar, Practice, Vocabulary, Chat, and Quizzes. Badges mean something is waiting in Practice or Chat.' },
          uk: { title: 'Quick actions', body: 'Швидкі дії + бейджі' },
        },
      },
      {
        stepId: 'help-stu-dash-stats',
        area: 'Dashboard',
        target: 'dash-stats',
        locales: {
          en: { title: 'Your stats', body: 'Tiles show vocabulary cards, lessons today, and completed lessons — a quick pulse of your week.' },
          uk: { title: 'Your stats', body: 'Плитки статистики' },
        },
      },
      {
        stepId: 'help-stu-dash-today',
        area: 'Dashboard',
        target: 'dash-today-lessons',
        locales: {
          en: { title: 'Today\'s lessons', body: 'Lessons scheduled for today. Open a card to enter the lesson room for plan, materials, and homework.' },
          uk: { title: 'Today\'s lessons', body: 'Уроки сьогодні' },
        },
      },
      {
        stepId: 'help-stu-dash-upcoming',
        area: 'Dashboard',
        target: 'dash-upcoming',
        locales: {
          en: { title: 'Coming up', body: 'Upcoming lessons beyond today so you can plan ahead.' },
          uk: { title: 'Coming up', body: 'Найближчі уроки' },
        },
      },
      {
        stepId: 'help-stu-dash-review',
        area: 'Dashboard',
        target: 'dash-review-words',
        locales: {
          en: { title: 'Review words', body: 'Cards due for review. Jump into Vocabulary Play when you have a few minutes.' },
          uk: { title: 'Review words', body: 'Слова на повторення' },
        },
      },
      {
        stepId: 'help-stu-dash-daily-goals',
        area: 'Dashboard',
        target: 'dash-daily-goals',
        locales: {
          en: { title: 'Daily goals', body: 'Small targets to keep your streak alive. Check them off after you practice or review words.' },
          uk: { title: 'Daily goals', body: 'Щоденні цілі' },
        },
      },
      {
        stepId: 'help-stu-dash-wotd',
        area: 'Dashboard',
        target: 'dash-word-of-day',
        locales: {
          en: { title: 'Word of the day', body: 'A daily word tip. Open it when you want a quick vocabulary boost.' },
          uk: { title: 'Word of the day', body: 'Слово дня' },
        },
      },
      {
        stepId: 'help-stu-dash-streak',
        area: 'Dashboard',
        target: 'dash-streak',
        locales: {
          en: { title: 'Streak calendar', body: 'Your practice streak over recent days. Consistency matters more than long sessions.' },
          uk: { title: 'Streak calendar', body: 'Календар стріку' },
        },
      },
      {
        stepId: 'help-stu-dash-irregular',
        area: 'Dashboard',
        target: 'dash-irregular-verb',
        locales: {
          en: { title: 'Irregular verb of the day', body: 'A daily irregular verb tip. Open Irregular verbs from Practice to drill all three forms.' },
          uk: { title: 'Irregular verb of the day', body: 'Дієслово дня' },
        },
      },
      {
        stepId: 'help-stu-lessons-highlights',
        area: 'Lessons',
        target: 'lessons-highlights',
        locales: {
          en: { title: 'Next & previous', body: 'Highlight cards show your next and previous lessons with materials count and homework status.' },
          uk: { title: 'Next & previous', body: 'Хайлайти уроків' },
        },
      },
      {
        stepId: 'help-stu-lessons-list',
        area: 'Lessons',
        target: 'lessons-list',
        locales: {
          en: { title: 'Lessons list', body: 'Full schedule with filters. There is no separate Homework page — homework lives on each lesson.' },
          uk: { title: 'Lessons list', body: 'Список уроків / ДЗ' },
        },
      },
      {
        stepId: 'help-stu-lesson-join',
        area: 'Lessons',
        target: 'lesson-join-video',
        locales: {
          en: { title: 'Join video', body: 'When the lesson is live and your school video provider is ready, join Meet, Zoom, or LiveKit from the lesson room.' },
          uk: { title: 'Join video', body: 'Відео-дзвінок' },
        },
      },
      {
        stepId: 'help-stu-lesson-homework',
        area: 'Lessons',
        target: 'lesson-homework',
        locales: {
          en: { title: 'Homework', body: 'Submit homework only after the lesson is marked completed. Until then it stays “Opens after the lesson”.' },
          uk: { title: 'Homework', body: 'ДЗ після завершення' },
        },
      },
      {
        stepId: 'help-stu-practice-hub',
        area: 'Practice',
        target: 'practice-hub-cards',
        locales: {
          en: { title: 'Practice hub', body: 'Your skill gym. Four modes are live: Vocabulary, Quiz, Speaking, and Irregular verbs. Games and Challenges are coming soon — ignore them for now.' },
          uk: { title: 'Practice hub', body: 'Хаб практики' },
        },
      },
      {
        stepId: 'help-stu-practice-stats',
        area: 'Practice',
        target: 'practice-stats',
        locales: {
          en: { title: 'Week stats', body: 'Time and activity for this week across practice modes.' },
          uk: { title: 'Week stats', body: 'Статистика тижня' },
        },
      },
      {
        stepId: 'help-stu-practice-vocab',
        area: 'Vocabulary',
        target: 'practice-card-vocabulary',
        locales: {
          en: { title: 'Vocabulary deck', body: 'Open Vocabulary for list, flashcards, or Play. Add words here or from a lesson. Play needs at least a couple of cards.' },
          uk: { title: 'Vocabulary deck', body: 'Картка Vocabulary' },
        },
      },
      {
        stepId: 'help-stu-vocab-modes',
        area: 'Vocabulary',
        target: 'vocab-mode-toggle',
        locales: {
          en: { title: 'List · Flashcards · Play', body: 'Switch how you study. Play is a quick multiple-choice round when you have enough cards.' },
          uk: { title: 'List · Flashcards · Play', body: 'Режими словника' },
        },
      },
      {
        stepId: 'help-stu-vocab-stats',
        area: 'Vocabulary',
        target: 'vocab-stats',
        locales: {
          en: { title: 'Deck stats', body: 'Totals for new, review, and learned cards. Tap a chip to filter the list.' },
          uk: { title: 'Deck stats', body: 'Статистика колоди' },
        },
      },
      {
        stepId: 'help-stu-vocab-add',
        area: 'Vocabulary',
        target: 'vocab-add-word',
        locales: {
          en: { title: 'Add a word', body: 'Type an English word to look it up and add it to your deck. You can also save words from lessons.' },
          uk: { title: 'Add a word', body: 'Додати слово' },
        },
      },
      {
        stepId: 'help-stu-vocab-filters',
        area: 'Vocabulary',
        target: 'vocab-filters',
        locales: {
          en: { title: 'Search & filters', body: 'Find words by text, lesson, or part of speech. Filters apply to List and Flashcards.' },
          uk: { title: 'Search & filters', body: 'Фільтри словника' },
        },
      },
      {
        stepId: 'help-stu-vocab-list',
        area: 'Vocabulary',
        target: 'vocab-word-list',
        locales: {
          en: { title: 'Your cards', body: 'Each card shows status and actions. Open a word for details; mark status as you learn.' },
          uk: { title: 'Your cards', body: 'Сітка карток' },
        },
      },
      {
        stepId: 'help-stu-vocab-flashcard',
        area: 'Vocabulary',
        target: 'vocab-flashcard',
        locales: {
          en: { title: 'Flashcard', body: 'Tap to flip. Mark how well you know the word, then move to the next card.' },
          uk: { title: 'Flashcard', body: 'Флешкартка' },
        },
      },
      {
        stepId: 'help-stu-vocab-play-setup',
        area: 'Vocabulary',
        target: 'vocab-play-setup',
        locales: {
          en: { title: 'Play setup', body: 'Choose a word source, then start when you have at least two usable cards.' },
          uk: { title: 'Play setup', body: 'Підготовка Play' },
        },
      },
      {
        stepId: 'help-stu-vocab-play-source',
        area: 'Vocabulary',
        target: 'vocab-play-source',
        locales: {
          en: { title: 'Word source', body: 'Random, last lesson, or a specific lesson — picks which cards enter the round.' },
          uk: { title: 'Word source', body: 'Джерело слів' },
        },
      },
      {
        stepId: 'help-stu-vocab-play-start',
        area: 'Vocabulary',
        target: 'vocab-play-start',
        locales: {
          en: { title: 'Start Play', body: 'Begins a multiple-choice round. Needs enough cards in the selected pool.' },
          uk: { title: 'Start Play', body: 'Старт Play' },
        },
      },
      {
        stepId: 'help-stu-vocab-play-progress',
        area: 'Vocabulary',
        target: 'vocab-play-progress',
        locales: {
          en: { title: 'Round progress', body: 'Question number and score dots update as you answer.' },
          uk: { title: 'Round progress', body: 'Прогрес раунду' },
        },
      },
      {
        stepId: 'help-stu-vocab-play-question',
        area: 'Vocabulary',
        target: 'vocab-play-question',
        locales: {
          en: { title: 'Prompt', body: 'The English word (and phonetic) you need to translate.' },
          uk: { title: 'Prompt', body: 'Питання' },
        },
      },
      {
        stepId: 'help-stu-vocab-play-options',
        area: 'Vocabulary',
        target: 'vocab-play-options',
        locales: {
          en: { title: 'Answer choices', body: 'Pick one translation, then Check. Wrong answers can send the card back to review.' },
          uk: { title: 'Answer choices', body: 'Варіанти відповіді' },
        },
      },
      {
        stepId: 'help-stu-vocab-play-actions',
        area: 'Vocabulary',
        target: 'vocab-play-actions',
        locales: {
          en: { title: 'Check · Next · Finish', body: 'Check confirms your pick. Next advances. Finish ends the round early if you need to stop.' },
          uk: { title: 'Check · Next · Finish', body: 'Дії раунду' },
        },
      },
      {
        stepId: 'help-stu-vocab-play-result',
        area: 'Vocabulary',
        target: 'vocab-play-result',
        locales: {
          en: { title: 'Round results', body: 'See your score and start a new round when you are ready.' },
          uk: { title: 'Round results', body: 'Результат раунду' },
        },
      },
      {
        stepId: 'help-stu-practice-quiz',
        area: 'Quiz',
        target: 'practice-card-quiz',
        locales: {
          en: { title: 'Quizzes', body: 'Start assigned quizzes (saved) or Practice mode (no persist). Wrong answers can send words back into review.' },
          uk: { title: 'Quizzes', body: 'Вікторини' },
        },
      },
      {
        stepId: 'help-stu-quiz-hero',
        area: 'Quiz',
        target: 'quiz-hero',
        locales: {
          en: { title: 'Quiz session', body: 'Inside a quiz: answer, see feedback, finish to save progress when it is an assigned quiz.' },
          uk: { title: 'Quiz session', body: 'Сесія квізу' },
        },
      },
      {
        stepId: 'help-stu-practice-speaking',
        area: 'Speaking',
        target: 'practice-card-speaking',
        locales: {
          en: { title: 'Speaking', body: 'Record answers to topics your teacher assigns. Mic permission is required. Teachers review submissions later.' },
          uk: { title: 'Speaking', body: 'Speaking' },
        },
      },
      {
        stepId: 'help-stu-speaking-record',
        area: 'Speaking',
        target: 'speaking-record',
        locales: {
          en: { title: 'Record a reply', body: 'Open an assigned topic and record your answer. Mic permission is required. Teachers review submissions later.' },
          uk: { title: 'Record a reply', body: 'Запис Speaking' },
        },
      },
      {
        stepId: 'help-stu-practice-irregular',
        area: 'Irregular verbs',
        target: 'practice-card-irregular',
        locales: {
          en: { title: 'Irregular verbs', body: 'Drill three forms. Results are not saved to your vocabulary deck but count toward practice week time.' },
          uk: { title: 'Irregular verbs', body: 'Неправильні дієслова' },
        },
      },
      {
        stepId: 'help-stu-irregular-play',
        area: 'Irregular verbs',
        target: 'irregular-play',
        locales: {
          en: { title: 'Start a drill', body: 'Pick a tier, then start Play to practice irregular verb forms. Results count toward practice week time but do not add vocabulary cards.' },
          uk: { title: 'Start a drill', body: 'Старт drill' },
        },
      },
      {
        stepId: 'help-stu-cal-toolbar',
        area: 'Calendar',
        target: 'calendar-toolbar',
        locales: {
          en: { title: 'Week or month', body: 'Toggle week and month views and move between dates. Your timezone comes from Profile.' },
          uk: { title: 'Week or month', body: 'Тулбар календаря' },
        },
      },
      {
        stepId: 'help-stu-cal-grid',
        area: 'Calendar',
        target: 'calendar-grid',
        locales: {
          en: { title: 'Schedule board', body: 'Browse lessons on the grid. Open a lesson to see details; you cannot drag or create slots as a student.' },
          uk: { title: 'Schedule board', body: 'Сітка календаря' },
        },
      },
      {
        stepId: 'help-stu-cal-request',
        area: 'Calendar',
        target: 'calendar-request-lesson',
        locales: {
          en: { title: 'Request a lesson', body: 'Ask your teacher for a time — this opens Chat with that teacher so you can arrange it.' },
          uk: { title: 'Request a lesson', body: 'Запит уроку → чат' },
        },
      },
      {
        stepId: 'help-stu-chat-inbox',
        area: 'Chat',
        target: 'chat-inbox',
        locales: {
          en: { title: 'Inbox', body: 'Threads with your teachers and school admins. Unread shows on the nav badge.' },
          uk: { title: 'Inbox', body: 'Інбокс' },
        },
      },
      {
        stepId: 'help-stu-chat-new',
        area: 'Chat',
        target: 'chat-new-message',
        locales: {
          en: { title: 'New message', body: 'Start a DM with someone you are allowed to message (assigned teachers and admins).' },
          uk: { title: 'New message', body: 'Нове повідомлення' },
        },
      },
      {
        stepId: 'help-stu-chat-composer',
        area: 'Chat',
        target: 'chat-composer',
        locales: {
          en: { title: 'Message & attach', body: 'Type in the thread. Attachments expire after 24 hours — download anything you need to keep.' },
          uk: { title: 'Message & attach', body: 'Композер + вкладення' },
        },
      },
      {
        stepId: 'help-stu-payment-balance',
        area: 'Payment',
        target: 'payment-balance',
        locales: {
          en: { title: 'Lesson balance', body: 'Prepaid lessons you can spend. This is **not** the school’s SaaS subscription.' },
          uk: { title: 'Lesson balance', body: 'Баланс уроків' },
        },
      },
      {
        stepId: 'help-stu-payment-packages',
        area: 'Payment',
        target: 'payment-packages',
        locales: {
          en: { title: 'Packages', body: 'Buy a package when your school enabled self-serve checkout and configured payment methods.' },
          uk: { title: 'Packages', body: 'Пакети' },
        },
      },
      {
        stepId: 'help-stu-payment-methods',
        area: 'Payment',
        target: 'payment-methods',
        locales: {
          en: { title: 'How to pay', body: 'Online methods and/or manual invoice (IBAN) depending on System → Payments at your school.' },
          uk: { title: 'How to pay', body: 'Методи оплати' },
        },
      },
      {
        stepId: 'help-stu-payment-ledger',
        area: 'Payment',
        target: 'payment-ledger',
        locales: {
          en: { title: 'Activity', body: 'History of top-ups and lesson usage on your balance.' },
          uk: { title: 'Activity', body: 'Історія балансу' },
        },
      },
      {
        stepId: 'help-stu-profile-tab',
        area: 'Profile',
        target: 'profile-tab-profile',
        locales: {
          en: { title: 'Profile', body: 'Name, avatar, languages, and timezone used for calendar and lessons.' },
          uk: { title: 'Profile', body: 'Вкладка Profile' },
        },
      },
      {
        stepId: 'help-stu-profile-stats',
        area: 'Profile',
        target: 'profile-tab-statistics',
        locales: {
          en: { title: 'Statistics', body: 'Your learning metrics and progress overview.' },
          uk: { title: 'Statistics', body: 'Статистика' },
        },
      },
      {
        stepId: 'help-stu-profile-notifications',
        area: 'Profile',
        target: 'profile-tab-notifications',
        locales: {
          en: { title: 'Notifications', body: 'Email and in-app preferences.' },
          uk: { title: 'Notifications', body: 'Сповіщення' },
        },
      },
      {
        stepId: 'help-stu-profile-connections',
        area: 'Profile',
        target: 'profile-connections-tab',
        locales: {
          en: { title: 'Connections', body: 'Link Google or other accounts if your school uses them for login or video.' },
          uk: { title: 'Connections', body: 'Connections' },
        },
      },
      {
        stepId: 'help-stu-profile-appearance',
        area: 'Profile',
        target: 'profile-tab-appearance',
        locales: {
          en: { title: 'Appearance', body: 'Theme and font size for the app shell.' },
          uk: { title: 'Appearance', body: 'Appearance' },
        },
      },
      {
        stepId: 'help-stu-profile-account',
        area: 'Profile',
        target: 'profile-tab-account',
        locales: {
          en: { title: 'Account', body: 'Password, Learning mode (Header ?), full Replay tour, logout, and data export.' },
          uk: { title: 'Account', body: 'Account / Help' },
        },
      },
    ],
  },
  {
    trackId: 'helpTeacher',
    steps: [
      {
        stepId: 'help-tea-dash-hero',
        area: 'Dashboard',
        target: 'dash-hero',
        locales: {
          en: { title: 'Teaching hub', body: 'Start each day here: today\'s lessons, homework waiting for review, and shortcuts including New lesson and Students.' },
          uk: { title: 'Teaching hub', body: 'Герой викладача' },
        },
      },
      {
        stepId: 'help-tea-dash-quick-actions',
        area: 'Dashboard',
        target: 'dash-quick-actions',
        locales: {
          en: { title: 'Quick actions', body: 'Jump to Calendar, Students, Materials, Chat, or create a lesson without hunting the sidebar.' },
          uk: { title: 'Quick actions', body: 'Швидкі дії' },
        },
      },
      {
        stepId: 'help-tea-dash-homework',
        area: 'Dashboard',
        target: 'dash-homework-review',
        locales: {
          en: { title: 'Homework to review', body: 'When students submit after a completed lesson, items appear here. Open a lesson to accept or leave feedback.' },
          uk: { title: 'Homework to review', body: 'Черга ДЗ' },
        },
      },
      {
        stepId: 'help-tea-dash-today',
        area: 'Dashboard',
        target: 'dash-today-lessons',
        locales: {
          en: { title: 'Today\'s lessons', body: 'Your schedule for today. Open a card to enter the lesson room.' },
          uk: { title: 'Today\'s lessons', body: 'Уроки сьогодні' },
        },
      },
      {
        stepId: 'help-tea-dash-week',
        area: 'Dashboard',
        target: 'dash-week-lessons',
        locales: {
          en: { title: 'This week', body: 'Broader week view of planned lessons.' },
          uk: { title: 'This week', body: 'Уроки тижня' },
        },
      },
      {
        stepId: 'help-tea-dash-students',
        area: 'Dashboard',
        target: 'dash-my-students',
        locales: {
          en: { title: 'My students', body: 'Snapshot of learners assigned to you. Open Students for the full roster.' },
          uk: { title: 'My students', body: 'Мої учні' },
        },
      },
      {
        stepId: 'help-tea-dash-month',
        area: 'Dashboard',
        target: 'dash-lessons-month',
        locales: {
          en: { title: 'Lessons this month', body: 'Monthly volume for a quick capacity check.' },
          uk: { title: 'Lessons this month', body: 'Уроки за місяць' },
        },
      },
      {
        stepId: 'help-tea-cal-toolbar',
        area: 'Calendar',
        target: 'calendar-toolbar',
        locales: {
          en: { title: 'Week or month', body: 'Switch views and navigate dates. Past slots stay locked; timezone follows your Profile.' },
          uk: { title: 'Week or month', body: 'Тулбар' },
        },
      },
      {
        stepId: 'help-tea-cal-grid',
        area: 'Calendar',
        target: 'calendar-grid',
        locales: {
          en: { title: 'Plan on the board', body: 'Create, move, and resize lessons. Conflicts and series edits confirm separately.' },
          uk: { title: 'Plan on the board', body: 'DnD сітка' },
        },
      },
      {
        stepId: 'help-tea-cal-create',
        area: 'Calendar',
        target: 'header-create-lesson',
        locales: {
          en: { title: 'New lesson', body: 'Header Create lesson (or calendar empty slot) opens the modal: Setup, Content, Homework — cancel anytime without saving.' },
          uk: { title: 'New lesson', body: 'CTA створення' },
        },
      },
      {
        stepId: 'help-tea-cal-modal',
        area: 'Calendar',
        target: 'lesson-modal',
        locales: {
          en: { title: 'Lesson modal', body: 'Setup who/when; Content attaches library materials; Homework sets student work.' },
          uk: { title: 'Lesson modal', body: 'Модалка уроку' },
        },
      },
      {
        stepId: 'help-tea-lessons-highlights',
        area: 'Lessons',
        target: 'lessons-highlights',
        locales: {
          en: { title: 'Highlights', body: 'Next/previous cards with materials and homework badges.' },
          uk: { title: 'Highlights', body: 'Хайлайти' },
        },
      },
      {
        stepId: 'help-tea-lessons-list',
        area: 'Lessons',
        target: 'lessons-list',
        locales: {
          en: { title: 'Lessons list', body: 'Filter and open any lesson you teach. Create/edit from here or the calendar.' },
          uk: { title: 'Lessons list', body: 'Список' },
        },
      },
      {
        stepId: 'help-tea-lesson-plan',
        area: 'Lessons',
        target: 'lesson-plan',
        locales: {
          en: { title: 'Lesson plan', body: 'Edit the plan students see in the lesson room.' },
          uk: { title: 'Lesson plan', body: 'План уроку' },
        },
      },
      {
        stepId: 'help-tea-lesson-join',
        area: 'Lessons',
        target: 'lesson-join-video',
        locales: {
          en: { title: 'Join video', body: 'Host Meet/Zoom/LiveKit when Connections and System video provider are ready.' },
          uk: { title: 'Join video', body: 'Відео' },
        },
      },
      {
        stepId: 'help-tea-lesson-homework',
        area: 'Lessons',
        target: 'lesson-homework',
        locales: {
          en: { title: 'Review homework', body: 'Accept or feedback student submissions after the lesson is completed.' },
          uk: { title: 'Review homework', body: 'Перевірка ДЗ' },
        },
      },
      {
        stepId: 'help-tea-materials-grid',
        area: 'Materials',
        target: 'materials-grid',
        locales: {
          en: { title: 'Library grid', body: 'Boards, books, audio, and video reusable across lessons. Students open files from lessons, not this library.' },
          uk: { title: 'Library grid', body: 'Сітка бібліотеки' },
        },
      },
      {
        stepId: 'help-tea-materials-create',
        area: 'Materials',
        target: 'materials-create',
        locales: {
          en: { title: 'Add material', body: 'Create a library entry — links, uploads (≤100MB), metadata.' },
          uk: { title: 'Add material', body: 'Створити матеріал' },
        },
      },
      {
        stepId: 'help-tea-materials-upload',
        area: 'Materials',
        target: 'materials-upload',
        locales: {
          en: { title: 'Upload form', body: 'Fill the form and attach files. Interrupted uploads can resume via the recovery banner.' },
          uk: { title: 'Upload form', body: 'Форма завантаження' },
        },
      },
      {
        stepId: 'help-tea-materials-viewer',
        area: 'Materials',
        target: 'materials-viewer',
        locales: {
          en: { title: 'Viewer', body: 'Books open in-app with annotations; media opens in a modal. Watch school storage quota.' },
          uk: { title: 'Viewer', body: 'Переглядач' },
        },
      },
      {
        stepId: 'help-tea-students-list',
        area: 'Students',
        target: 'students-list',
        locales: {
          en: { title: 'Roster', body: 'Learners assigned to you. Empty state means nobody is assigned yet.' },
          uk: { title: 'Roster', body: 'Список учнів' },
        },
      },
      {
        stepId: 'help-tea-students-groups',
        area: 'Students',
        target: 'students-groups-tab',
        locales: {
          en: { title: 'Groups', body: 'When group lessons are on (System → General), switch here for shared templates and members.' },
          uk: { title: 'Groups', body: 'Вкладка Groups' },
        },
      },
      {
        stepId: 'help-tea-students-card',
        area: 'Students',
        target: 'student-card',
        locales: {
          en: { title: 'Student card', body: 'Open a learner for Profile, Statistics, Lessons, Practice, and more. Teachers do not see student pricing.' },
          uk: { title: 'Student card', body: 'Картка учня' },
        },
      },
      {
        stepId: 'help-tea-student-practice',
        area: 'Students',
        target: 'student-practice-tab',
        locales: {
          en: { title: 'Assign practice', body: 'Practice tab: assign vocabulary, quizzes, or speaking.' },
          uk: { title: 'Assign practice', body: 'Practice tab' },
        },
      },
      {
        stepId: 'help-tea-student-dm',
        area: 'Students',
        target: 'student-hero-chat',
        locales: {
          en: { title: 'Message student', body: 'From the student hero, jump into a DM without hunting Chat.' },
          uk: { title: 'Message student', body: 'DM з профілю' },
        },
      },
      {
        stepId: 'help-tea-chat-inbox',
        area: 'Chat',
        target: 'chat-inbox',
        locales: {
          en: { title: 'Inbox', body: 'Threads with your students and admins. Calendar “request lesson” lands here.' },
          uk: { title: 'Inbox', body: 'Інбокс' },
        },
      },
      {
        stepId: 'help-tea-chat-new',
        area: 'Chat',
        target: 'chat-new-message',
        locales: {
          en: { title: 'New message', body: 'Start a DM with an assigned student or admin.' },
          uk: { title: 'New message', body: 'Нове повідомлення' },
        },
      },
      {
        stepId: 'help-tea-chat-composer',
        area: 'Chat',
        target: 'chat-composer',
        locales: {
          en: { title: 'Thread', body: 'Reply and attach files (24h TTL).' },
          uk: { title: 'Thread', body: 'Композер' },
        },
      },
      {
        stepId: 'help-tea-profile-tab',
        area: 'Profile',
        target: 'profile-tab-profile',
        locales: {
          en: { title: 'Profile', body: 'Your teaching identity, timezone, and languages.' },
          uk: { title: 'Profile', body: 'Profile' },
        },
      },
      {
        stepId: 'help-tea-profile-stats',
        area: 'Profile',
        target: 'profile-tab-statistics',
        locales: {
          en: { title: 'Statistics', body: 'Teaching metrics; earnings glance may appear here — not school Finance.' },
          uk: { title: 'Statistics', body: 'Статистика / earnings' },
        },
      },
      {
        stepId: 'help-tea-profile-notifications',
        area: 'Profile',
        target: 'profile-tab-notifications',
        locales: {
          en: { title: 'Notifications', body: 'Email and in-app prefs.' },
          uk: { title: 'Notifications', body: 'Сповіщення' },
        },
      },
      {
        stepId: 'help-tea-profile-connections',
        area: 'Profile',
        target: 'profile-connections',
        locales: {
          en: { title: 'Connections', body: 'Link Google or Zoom so you can host video lessons.' },
          uk: { title: 'Connections', body: 'OAuth для відео' },
        },
      },
      {
        stepId: 'help-tea-profile-appearance',
        area: 'Profile',
        target: 'profile-tab-appearance',
        locales: {
          en: { title: 'Appearance', body: 'Theme and font size.' },
          uk: { title: 'Appearance', body: 'Appearance' },
        },
      },
      {
        stepId: 'help-tea-profile-account',
        area: 'Profile',
        target: 'profile-tab-account',
        locales: {
          en: { title: 'Account', body: 'Learning mode, Replay tour, password, logout.' },
          uk: { title: 'Account', body: 'Account' },
        },
      },
      {
        stepId: 'help-tea-practice-hub',
        area: 'Practice',
        target: 'practice-hub-cards',
        locales: {
          en: { title: 'Practice hub', body: 'Preview learner modes here. Assign vocabulary, quizzes, or speaking from a student’s Practice tab.' },
          uk: { title: 'Practice hub', body: 'Хаб практики' },
        },
      },
      {
        stepId: 'help-tea-practice-stats',
        area: 'Practice',
        target: 'practice-stats',
        locales: {
          en: { title: 'Week stats', body: 'When you practice as staff, week activity shows here the same way it does for learners.' },
          uk: { title: 'Week stats', body: 'Статистика тижня' },
        },
      },
      {
        stepId: 'help-tea-practice-vocab',
        area: 'Vocabulary',
        target: 'practice-card-vocabulary',
        locales: {
          en: { title: 'Vocabulary', body: 'Open Vocabulary to preview list, flashcards, and Play. Assign decks from the student’s Practice tab.' },
          uk: { title: 'Vocabulary', body: 'Картка Vocabulary' },
        },
      },
      {
        stepId: 'help-tea-vocab-modes',
        area: 'Vocabulary',
        target: 'vocab-mode-toggle',
        locales: {
          en: { title: 'List · Flashcards · Play', body: 'Switch study modes while previewing a deck. Play needs enough cards — same rules as for learners.' },
          uk: { title: 'List · Flashcards · Play', body: 'Режими словника' },
        },
      },
      {
        stepId: 'help-tea-vocab-stats',
        area: 'Vocabulary',
        target: 'vocab-stats',
        locales: {
          en: { title: 'Deck stats', body: 'New / review / learned counts for the deck you are previewing.' },
          uk: { title: 'Deck stats', body: 'Статистика колоди' },
        },
      },
      {
        stepId: 'help-tea-vocab-add',
        area: 'Vocabulary',
        target: 'vocab-add-word',
        locales: {
          en: { title: 'Add a word', body: 'Try the add-word flow; learner decks are usually filled from lessons or your assignments.' },
          uk: { title: 'Add a word', body: 'Додати слово' },
        },
      },
      {
        stepId: 'help-tea-vocab-filters',
        area: 'Vocabulary',
        target: 'vocab-filters',
        locales: {
          en: { title: 'Search & filters', body: 'Find words by text, lesson, or part of speech while previewing a deck.' },
          uk: { title: 'Search & filters', body: 'Фільтри словника' },
        },
      },
      {
        stepId: 'help-tea-vocab-list',
        area: 'Vocabulary',
        target: 'vocab-word-list',
        locales: {
          en: { title: 'Card grid', body: 'Preview learner cards and statuses. Assign decks from the student’s Practice tab.' },
          uk: { title: 'Card grid', body: 'Сітка карток' },
        },
      },
      {
        stepId: 'help-tea-vocab-flashcard',
        area: 'Vocabulary',
        target: 'vocab-flashcard',
        locales: {
          en: { title: 'Flashcard', body: 'Same flip-and-mark flow learners use — useful when checking what students see.' },
          uk: { title: 'Flashcard', body: 'Флешкартка' },
        },
      },
      {
        stepId: 'help-tea-vocab-play-setup',
        area: 'Vocabulary',
        target: 'vocab-play-setup',
        locales: {
          en: { title: 'Play setup', body: 'Preview Play setup: choose a source, then start when the pool has enough cards.' },
          uk: { title: 'Play setup', body: 'Підготовка Play' },
        },
      },
      {
        stepId: 'help-tea-vocab-play-source',
        area: 'Vocabulary',
        target: 'vocab-play-source',
        locales: {
          en: { title: 'Word source', body: 'Random, last lesson, or a specific lesson — same controls learners get.' },
          uk: { title: 'Word source', body: 'Джерело слів' },
        },
      },
      {
        stepId: 'help-tea-vocab-play-start',
        area: 'Vocabulary',
        target: 'vocab-play-start',
        locales: {
          en: { title: 'Start Play', body: 'Begins a multiple-choice preview round.' },
          uk: { title: 'Start Play', body: 'Старт Play' },
        },
      },
      {
        stepId: 'help-tea-vocab-play-progress',
        area: 'Vocabulary',
        target: 'vocab-play-progress',
        locales: {
          en: { title: 'Round progress', body: 'Question number and score dots during a Play round.' },
          uk: { title: 'Round progress', body: 'Прогрес раунду' },
        },
      },
      {
        stepId: 'help-tea-vocab-play-question',
        area: 'Vocabulary',
        target: 'vocab-play-question',
        locales: {
          en: { title: 'Prompt', body: 'The English word shown during Play.' },
          uk: { title: 'Prompt', body: 'Питання' },
        },
      },
      {
        stepId: 'help-tea-vocab-play-options',
        area: 'Vocabulary',
        target: 'vocab-play-options',
        locales: {
          en: { title: 'Answer choices', body: 'Multiple-choice options — same interaction as for learners.' },
          uk: { title: 'Answer choices', body: 'Варіанти відповіді' },
        },
      },
      {
        stepId: 'help-tea-vocab-play-actions',
        area: 'Vocabulary',
        target: 'vocab-play-actions',
        locales: {
          en: { title: 'Check · Next · Finish', body: 'Confirm, advance, or end the round early.' },
          uk: { title: 'Check · Next · Finish', body: 'Дії раунду' },
        },
      },
      {
        stepId: 'help-tea-vocab-play-result',
        area: 'Vocabulary',
        target: 'vocab-play-result',
        locales: {
          en: { title: 'Round results', body: 'Score summary and New round after Play finishes.' },
          uk: { title: 'Round results', body: 'Результат раунду' },
        },
      },
      {
        stepId: 'help-tea-practice-quiz',
        area: 'Quiz',
        target: 'practice-card-quiz',
        locales: {
          en: { title: 'Quizzes', body: 'Open Quiz to preview assigned vs practice runs. Generate quizzes from the quiz hub when available.' },
          uk: { title: 'Quizzes', body: 'Вікторини' },
        },
      },
      {
        stepId: 'help-tea-quiz-hero',
        area: 'Quiz',
        target: 'quiz-hero',
        locales: {
          en: { title: 'Quiz session', body: 'Inside a quiz: answer flow matches learners.' },
          uk: { title: 'Quiz session', body: 'Сесія квізу' },
        },
      },
      {
        stepId: 'help-tea-practice-quiz-gen',
        area: 'Quiz',
        target: 'quiz-generate',
        locales: {
          en: { title: 'Generate quizzes', body: 'Create quizzes for learners from the quiz hub. Assign them from the student’s Practice tab.' },
          uk: { title: 'Generate quizzes', body: 'Генерація квізів' },
        },
      },
      {
        stepId: 'help-tea-practice-speaking',
        area: 'Speaking',
        target: 'practice-card-speaking',
        locales: {
          en: { title: 'Speaking', body: 'Preview speaking topics and recording. Assign topics and review submissions from the student’s Practice tab.' },
          uk: { title: 'Speaking', body: 'Speaking' },
        },
      },
      {
        stepId: 'help-tea-speaking-record',
        area: 'Speaking',
        target: 'speaking-record',
        locales: {
          en: { title: 'Record a reply', body: 'Mic permission is required to record. You review learner submissions later.' },
          uk: { title: 'Record a reply', body: 'Запис Speaking' },
        },
      },
      {
        stepId: 'help-tea-practice-irregular',
        area: 'Irregular verbs',
        target: 'practice-card-irregular',
        locales: {
          en: { title: 'Irregular verbs', body: 'Three-forms drill for preview. Results are not saved to a vocabulary deck; they count toward practice week time.' },
          uk: { title: 'Irregular verbs', body: 'Неправильні дієслова' },
        },
      },
      {
        stepId: 'help-tea-irregular-play',
        area: 'Irregular verbs',
        target: 'irregular-play',
        locales: {
          en: { title: 'Start a drill', body: 'Pick a tier, then Play — same drill learners use.' },
          uk: { title: 'Start a drill', body: 'Старт drill' },
        },
      },
    ],
  },
  {
    trackId: 'helpAdmin',
    steps: [
      {
        stepId: 'help-adm-dash-hero',
        area: 'Dashboard',
        target: 'dash-hero',
        locales: {
          en: { title: 'School pulse', body: 'Daily hub for the school — teaching shortcuts plus ops signals.' },
          uk: { title: 'School pulse', body: 'Герой школи' },
        },
      },
      {
        stepId: 'help-adm-dash-quick-actions',
        area: 'Dashboard',
        target: 'dash-quick-actions',
        locales: {
          en: { title: 'Quick actions', body: 'Jump to Students, Calendar, New lesson, Admin, or Subscription.' },
          uk: { title: 'Quick actions', body: 'Швидкі дії' },
        },
      },
      {
        stepId: 'help-adm-dash-homework',
        area: 'Dashboard',
        target: 'dash-homework-review',
        locales: {
          en: { title: 'Homework queue', body: 'Same staff queue as teachers when you teach or review.' },
          uk: { title: 'Homework queue', body: 'Черга ДЗ' },
        },
      },
      {
        stepId: 'help-adm-dash-today',
        area: 'Dashboard',
        target: 'dash-today-lessons',
        locales: {
          en: { title: 'Today\'s lessons', body: 'School-wide or your teaching schedule depending on filters.' },
          uk: { title: 'Today\'s lessons', body: 'Уроки сьогодні' },
        },
      },
      {
        stepId: 'help-adm-dash-entitlements',
        area: 'Dashboard',
        target: 'dash-entitlements',
        locales: {
          en: { title: 'Seats & storage', body: 'Plan seats and storage meter — mirrors Subscription (/billing). Upgrade there if you are near limits.' },
          uk: { title: 'Seats & storage', body: 'Entitlements' },
        },
      },
      {
        stepId: 'help-adm-dash-stats',
        area: 'Dashboard',
        target: 'dash-stats',
        locales: {
          en: { title: 'School stats', body: 'Quick tiles for today’s teaching load and school pulse metrics.' },
          uk: { title: 'School stats', body: 'Плитки статистики' },
        },
      },
      {
        stepId: 'help-adm-dash-week',
        area: 'Dashboard',
        target: 'dash-week-lessons',
        locales: {
          en: { title: 'This week', body: 'Broader week view of planned lessons across the school.' },
          uk: { title: 'This week', body: 'Уроки тижня' },
        },
      },
      {
        stepId: 'help-adm-dash-students',
        area: 'Dashboard',
        target: 'dash-my-students',
        locales: {
          en: { title: 'Learners snapshot', body: 'Recent learners assigned in this school. Open Students for the full roster.' },
          uk: { title: 'Learners snapshot', body: 'Знімок учнів' },
        },
      },
      {
        stepId: 'help-adm-dash-month',
        area: 'Dashboard',
        target: 'dash-lessons-month',
        locales: {
          en: { title: 'Lessons this month', body: 'Monthly volume for a quick capacity check.' },
          uk: { title: 'Lessons this month', body: 'Уроки за місяць' },
        },
      },
      {
        stepId: 'help-adm-students-list',
        area: 'Students',
        target: 'students-list',
        locales: {
          en: { title: 'Learners roster', body: 'Learning roster — progress, practice, and lesson balance on each profile. Account create/delete is under Admin.' },
          uk: { title: 'Learners roster', body: 'Ростер учнів' },
        },
      },
      {
        stepId: 'help-adm-students-groups',
        area: 'Students',
        target: 'students-groups-tab',
        locales: {
          en: { title: 'Groups', body: 'Shared templates and members when group lessons are enabled in System → General.' },
          uk: { title: 'Groups', body: 'Groups' },
        },
      },
      {
        stepId: 'help-adm-students-panel',
        area: 'Students',
        target: 'students-groups-panel',
        locales: {
          en: { title: 'Groups panel', body: 'Manage group membership and templates used when scheduling group lessons.' },
          uk: { title: 'Groups panel', body: 'Панель груп' },
        },
      },
      {
        stepId: 'help-adm-student-billing',
        area: 'Students',
        target: 'student-billing-tab',
        locales: {
          en: { title: 'Student billing', body: 'Adjust a learner’s lesson balance here. This is not school Subscription.' },
          uk: { title: 'Student billing', body: 'Баланс учня' },
        },
      },
      {
        stepId: 'help-adm-student-practice',
        area: 'Students',
        target: 'student-practice-tab',
        locales: {
          en: { title: 'Assign practice', body: 'Same Practice tab as teachers — vocab, quiz, speaking.' },
          uk: { title: 'Assign practice', body: 'Practice' },
        },
      },
      {
        stepId: 'help-adm-student-profile',
        area: 'Students',
        target: 'student-card',
        locales: {
          en: { title: 'Open learner', body: 'Profile, statistics, lessons, achievements — full learner OS.' },
          uk: { title: 'Open learner', body: 'Профіль учня' },
        },
      },
      {
        stepId: 'help-adm-admin-create',
        area: 'Admin',
        target: 'admin-create-form',
        locales: {
          en: { title: 'Create accounts', body: 'Create and remove accounts; temporary passwords go out by email. Seat limits can block new students.' },
          uk: { title: 'Create accounts', body: 'Створення акаунтів' },
        },
      },
      {
        stepId: 'help-adm-admin-import',
        area: 'Admin',
        target: 'admin-import',
        locales: {
          en: { title: 'Bulk import', body: 'Import students in bulk when available. Distinct from the learning roster on Students.' },
          uk: { title: 'Bulk import', body: 'Імпорт' },
        },
      },
      {
        stepId: 'help-adm-admin-seats',
        area: 'Admin',
        target: 'admin-seats-hint',
        locales: {
          en: { title: 'Seats', body: 'New learners consume Subscription seats — check Billing if create fails.' },
          uk: { title: 'Seats', body: 'Ліміт місць' },
        },
      },
      {
        stepId: 'help-adm-staff-roster',
        area: 'Staff',
        target: 'staff-roster',
        locales: {
          en: { title: 'Staff roster', body: 'Teachers and staff with compensation / earnings settings per person.' },
          uk: { title: 'Staff roster', body: 'Ростер staff' },
        },
      },
      {
        stepId: 'help-adm-staff-comp',
        area: 'Staff',
        target: 'staff-compensation',
        locales: {
          en: { title: 'Compensation', body: 'Pay settings for a person — not the same as Finance payouts ledger.' },
          uk: { title: 'Compensation', body: 'Компенсація' },
        },
      },
      {
        stepId: 'help-adm-staff-detail',
        area: 'Staff',
        target: 'staff-detail',
        locales: {
          en: { title: 'Staff profile', body: 'Open a staff member for earnings history and setup.' },
          uk: { title: 'Staff profile', body: 'Картка staff' },
        },
      },
      {
        stepId: 'help-adm-billing-plan',
        area: 'Subscription',
        target: 'billing-plan',
        locales: {
          en: { title: 'School subscription', body: 'SaaS plan, seats, and storage for the school (Layer B). Never confuse with student /payment.' },
          uk: { title: 'School subscription', body: 'Підписка школи' },
        },
      },
      {
        stepId: 'help-adm-billing-usage',
        area: 'Subscription',
        target: 'billing-usage',
        locales: {
          en: { title: 'Usage & quotas', body: 'How seats and storage are consumed vs plan limits.' },
          uk: { title: 'Usage & quotas', body: 'Використання' },
        },
      },
      {
        stepId: 'help-adm-billing-promo',
        area: 'Subscription',
        target: 'billing-promo',
        locales: {
          en: { title: 'Promo codes', body: 'Apply platform promo codes when offered.' },
          uk: { title: 'Promo codes', body: 'Промо' },
        },
      },
      {
        stepId: 'help-adm-finance-overview',
        area: 'Finance',
        target: 'finance-overview',
        locales: {
          en: { title: 'Finance overview', body: 'School money-out: charts and payout history to teachers.' },
          uk: { title: 'Finance overview', body: 'Огляд фінансів' },
        },
      },
      {
        stepId: 'help-adm-finance-payout',
        area: 'Finance',
        target: 'finance-record-payout',
        locales: {
          en: { title: 'Record payout', body: 'Record a payout to staff. Soft peek is enough — you can cancel.' },
          uk: { title: 'Record payout', body: 'Запис виплати' },
        },
      },
      {
        stepId: 'help-adm-finance-defaults',
        area: 'Finance',
        target: 'finance-payout-defaults',
        locales: {
          en: { title: 'Payout defaults', body: 'Defaults often mirror System → Payouts.' },
          uk: { title: 'Payout defaults', body: 'Дефолти виплат' },
        },
      },
      {
        stepId: 'help-adm-system-overview',
        area: 'System',
        locales: {
          en: { title: 'System control room', body: 'Integrations and school settings. Use the tabs for each area — Payments is critical for student checkout.' },
          uk: { title: 'System control room', body: 'Огляд System' },
        },
      },
      {
        stepId: 'help-adm-system-general',
        area: 'System',
        target: 'system-tab-general',
        locales: {
          en: { title: 'General', body: 'Group lessons toggle and video meetings provider for the school.' },
          uk: { title: 'General', body: 'General' },
        },
      },
      {
        stepId: 'help-adm-system-email',
        area: 'System',
        target: 'system-tab-email',
        locales: {
          en: { title: 'Email', body: 'SMTP status and test welcome mail.' },
          uk: { title: 'Email', body: 'Email / SMTP' },
        },
      },
      {
        stepId: 'help-adm-system-dictionary',
        area: 'System',
        target: 'system-tab-dictionary',
        locales: {
          en: { title: 'Word dictionary', body: 'Dictionary and translation providers for vocabulary enrichment.' },
          uk: { title: 'Word dictionary', body: 'Dictionary' },
        },
      },
      {
        stepId: 'help-adm-system-connections',
        area: 'System',
        target: 'system-tab-connections',
        locales: {
          en: { title: 'Connections', body: 'Google, Zoom, LiveKit, and related integrations. Teachers also link accounts under Profile → Connections.' },
          uk: { title: 'Connections', body: 'Connections' },
        },
      },
      {
        stepId: 'help-adm-system-payments',
        area: 'System',
        target: 'system-tab-payments-trigger',
        locales: {
          en: { title: 'Payments for students', body: 'Currencies, methods, packages, manual invoice templates, and secrets — required for student /payment to work.' },
          uk: { title: 'Payments for students', body: 'System Payments' },
        },
      },
      {
        stepId: 'help-adm-system-payouts',
        area: 'System',
        target: 'system-tab-payouts',
        locales: {
          en: { title: 'Payouts', body: 'Staff payout defaults — pair with Finance when recording payouts.' },
          uk: { title: 'Payouts', body: 'System Payouts' },
        },
      },
      {
        stepId: 'help-adm-system-domains',
        area: 'System',
        target: 'system-tab-domains',
        locales: {
          en: { title: 'Domains', body: 'Custom school domain setup.' },
          uk: { title: 'Domains', body: 'Domains' },
        },
      },
      {
        stepId: 'help-adm-system-branding',
        area: 'System',
        target: 'system-tab-branding',
        locales: {
          en: { title: 'Branding', body: 'School branding and accent (wizard may already have set accent).' },
          uk: { title: 'Branding', body: 'Branding' },
        },
      },
      {
        stepId: 'help-adm-materials-grid',
        area: 'Materials',
        target: 'materials-grid',
        locales: {
          en: { title: 'School library', body: 'Shared library for the school; quota tied to Subscription.' },
          uk: { title: 'School library', body: 'Бібліотека' },
        },
      },
      {
        stepId: 'help-adm-materials-create',
        area: 'Materials',
        target: 'materials-create',
        locales: {
          en: { title: 'Add material', body: 'Create reusable assets teachers attach to lessons.' },
          uk: { title: 'Add material', body: 'Створити' },
        },
      },
      {
        stepId: 'help-adm-materials-upload',
        area: 'Materials',
        target: 'materials-upload',
        locales: {
          en: { title: 'Upload', body: 'Files ≤100MB; watch storage entitlements.' },
          uk: { title: 'Upload', body: 'Upload' },
        },
      },
      {
        stepId: 'help-adm-materials-viewer',
        area: 'Materials',
        target: 'materials-viewer',
        locales: {
          en: { title: 'Viewer', body: 'In-app book/media viewer.' },
          uk: { title: 'Viewer', body: 'Viewer' },
        },
      },
      {
        stepId: 'help-adm-cal-toolbar',
        area: 'Calendar',
        target: 'calendar-toolbar',
        locales: {
          en: { title: 'Filters & views', body: 'Audience (all / my-students) and teacher filters plus week/month.' },
          uk: { title: 'Filters & views', body: 'Тулбар + фільтри' },
        },
      },
      {
        stepId: 'help-adm-cal-grid',
        area: 'Calendar',
        target: 'calendar-grid',
        locales: {
          en: { title: 'School schedule', body: 'Whole-school board; admins can plan lessons too.' },
          uk: { title: 'School schedule', body: 'Сітка' },
        },
      },
      {
        stepId: 'help-adm-cal-create',
        area: 'Calendar',
        target: 'header-create-lesson',
        locales: {
          en: { title: 'New lesson', body: 'Same create modal as teachers.' },
          uk: { title: 'New lesson', body: 'Створити урок' },
        },
      },
      {
        stepId: 'help-adm-chat-inbox',
        area: 'Chat',
        target: 'chat-inbox',
        locales: {
          en: { title: 'Inbox', body: 'School messaging; visibility rules differ by role.' },
          uk: { title: 'Inbox', body: 'Інбокс' },
        },
      },
      {
        stepId: 'help-adm-chat-new',
        area: 'Chat',
        target: 'chat-new-message',
        locales: {
          en: { title: 'New message', body: 'Start a DM.' },
          uk: { title: 'New message', body: 'DM' },
        },
      },
      {
        stepId: 'help-adm-chat-group',
        area: 'Chat',
        target: 'chat-create-group',
        locales: {
          en: { title: 'Create group', body: 'Admins can create group chats.' },
          uk: { title: 'Create group', body: 'Груповий чат' },
        },
      },
      {
        stepId: 'help-adm-chat-composer',
        area: 'Chat',
        target: 'chat-composer',
        locales: {
          en: { title: 'Thread', body: 'Reply and attachments (24h TTL).' },
          uk: { title: 'Thread', body: 'Композер' },
        },
      },
      {
        stepId: 'help-adm-lessons-list',
        area: 'Lessons',
        target: 'lessons-list',
        locales: {
          en: { title: 'Lessons', body: 'Admins can open the lessons list like staff.' },
          uk: { title: 'Lessons', body: 'Уроки' },
        },
      },
      {
        stepId: 'help-adm-lessons-highlights',
        area: 'Lessons',
        target: 'lessons-highlights',
        locales: {
          en: { title: 'Highlights', body: 'Next/previous lesson cards.' },
          uk: { title: 'Highlights', body: 'Хайлайти' },
        },
      },
      {
        stepId: 'help-adm-lesson-homework',
        area: 'Lessons',
        target: 'lesson-homework',
        locales: {
          en: { title: 'Homework', body: 'Review submissions when you teach.' },
          uk: { title: 'Homework', body: 'ДЗ' },
        },
      },
      {
        stepId: 'help-adm-practice-hub',
        area: 'Practice',
        target: 'practice-hub-cards',
        locales: {
          en: { title: 'Practice hub', body: 'Preview all learner modes here. Assign vocabulary, quizzes, or speaking from a student’s Practice tab — not from this hub alone.' },
          uk: { title: 'Practice hub', body: 'Хаб практики' },
        },
      },
      {
        stepId: 'help-adm-practice-stats',
        area: 'Practice',
        target: 'practice-stats',
        locales: {
          en: { title: 'Week stats', body: 'When you practice as staff, week activity shows here the same way it does for learners.' },
          uk: { title: 'Week stats', body: 'Статистика тижня' },
        },
      },
      {
        stepId: 'help-adm-practice-vocab',
        area: 'Vocabulary',
        target: 'practice-card-vocabulary',
        locales: {
          en: { title: 'Vocabulary', body: 'Open Vocabulary to preview list, flashcards, and Play. Assign decks from the student’s Practice tab.' },
          uk: { title: 'Vocabulary', body: 'Картка Vocabulary' },
        },
      },
      {
        stepId: 'help-adm-vocab-modes',
        area: 'Vocabulary',
        target: 'vocab-mode-toggle',
        locales: {
          en: { title: 'List · Flashcards · Play', body: 'Switch study modes while previewing a deck. Play needs enough cards — same rules as for learners.' },
          uk: { title: 'List · Flashcards · Play', body: 'Режими словника' },
        },
      },
      {
        stepId: 'help-adm-vocab-stats',
        area: 'Vocabulary',
        target: 'vocab-stats',
        locales: {
          en: { title: 'Deck stats', body: 'New / review / learned counts for the deck you are previewing.' },
          uk: { title: 'Deck stats', body: 'Статистика колоди' },
        },
      },
      {
        stepId: 'help-adm-vocab-add',
        area: 'Vocabulary',
        target: 'vocab-add-word',
        locales: {
          en: { title: 'Add a word', body: 'Staff can try the add-word flow; learner decks are usually filled from lessons or assignments.' },
          uk: { title: 'Add a word', body: 'Додати слово' },
        },
      },
      {
        stepId: 'help-adm-vocab-filters',
        area: 'Vocabulary',
        target: 'vocab-filters',
        locales: {
          en: { title: 'Search & filters', body: 'Find words by text, lesson, or part of speech while previewing a deck.' },
          uk: { title: 'Search & filters', body: 'Фільтри словника' },
        },
      },
      {
        stepId: 'help-adm-vocab-list',
        area: 'Vocabulary',
        target: 'vocab-word-list',
        locales: {
          en: { title: 'Card grid', body: 'Preview learner cards and statuses. Assign decks from the student’s Practice tab.' },
          uk: { title: 'Card grid', body: 'Сітка карток' },
        },
      },
      {
        stepId: 'help-adm-vocab-flashcard',
        area: 'Vocabulary',
        target: 'vocab-flashcard',
        locales: {
          en: { title: 'Flashcard', body: 'Same flip-and-mark flow learners use — useful when checking what students see.' },
          uk: { title: 'Flashcard', body: 'Флешкартка' },
        },
      },
      {
        stepId: 'help-adm-vocab-play-setup',
        area: 'Vocabulary',
        target: 'vocab-play-setup',
        locales: {
          en: { title: 'Play setup', body: 'Preview Play setup: choose a source, then start when the pool has enough cards.' },
          uk: { title: 'Play setup', body: 'Підготовка Play' },
        },
      },
      {
        stepId: 'help-adm-vocab-play-source',
        area: 'Vocabulary',
        target: 'vocab-play-source',
        locales: {
          en: { title: 'Word source', body: 'Random, last lesson, or a specific lesson — same controls learners get.' },
          uk: { title: 'Word source', body: 'Джерело слів' },
        },
      },
      {
        stepId: 'help-adm-vocab-play-start',
        area: 'Vocabulary',
        target: 'vocab-play-start',
        locales: {
          en: { title: 'Start Play', body: 'Begins a multiple-choice preview round.' },
          uk: { title: 'Start Play', body: 'Старт Play' },
        },
      },
      {
        stepId: 'help-adm-vocab-play-progress',
        area: 'Vocabulary',
        target: 'vocab-play-progress',
        locales: {
          en: { title: 'Round progress', body: 'Question number and score dots during a Play round.' },
          uk: { title: 'Round progress', body: 'Прогрес раунду' },
        },
      },
      {
        stepId: 'help-adm-vocab-play-question',
        area: 'Vocabulary',
        target: 'vocab-play-question',
        locales: {
          en: { title: 'Prompt', body: 'The English word shown during Play.' },
          uk: { title: 'Prompt', body: 'Питання' },
        },
      },
      {
        stepId: 'help-adm-vocab-play-options',
        area: 'Vocabulary',
        target: 'vocab-play-options',
        locales: {
          en: { title: 'Answer choices', body: 'Multiple-choice options — same interaction as for learners.' },
          uk: { title: 'Answer choices', body: 'Варіанти відповіді' },
        },
      },
      {
        stepId: 'help-adm-vocab-play-actions',
        area: 'Vocabulary',
        target: 'vocab-play-actions',
        locales: {
          en: { title: 'Check · Next · Finish', body: 'Confirm, advance, or end the round early.' },
          uk: { title: 'Check · Next · Finish', body: 'Дії раунду' },
        },
      },
      {
        stepId: 'help-adm-vocab-play-result',
        area: 'Vocabulary',
        target: 'vocab-play-result',
        locales: {
          en: { title: 'Round results', body: 'Score summary and New round after Play finishes.' },
          uk: { title: 'Round results', body: 'Результат раунду' },
        },
      },
      {
        stepId: 'help-adm-practice-quiz',
        area: 'Quiz',
        target: 'practice-card-quiz',
        locales: {
          en: { title: 'Quizzes', body: 'Open Quiz to preview assigned vs practice runs. Generate quizzes for students from the quiz hub when available.' },
          uk: { title: 'Quizzes', body: 'Вікторини' },
        },
      },
      {
        stepId: 'help-adm-quiz-hero',
        area: 'Quiz',
        target: 'quiz-hero',
        locales: {
          en: { title: 'Quiz session', body: 'Inside a quiz: answer flow matches learners. Staff can also generate quizzes when the generate control is available.' },
          uk: { title: 'Quiz session', body: 'Сесія квізу' },
        },
      },
      {
        stepId: 'help-adm-quiz-generate',
        area: 'Quiz',
        target: 'quiz-generate',
        locales: {
          en: { title: 'Generate quizzes', body: 'Create quizzes for learners from the quiz hub. Assign them from the student’s Practice tab.' },
          uk: { title: 'Generate quizzes', body: 'Генерація квізів' },
        },
      },
      {
        stepId: 'help-adm-practice-speaking',
        area: 'Speaking',
        target: 'practice-card-speaking',
        locales: {
          en: { title: 'Speaking', body: 'Preview speaking topics and recording. Assign topics and review submissions from the student’s Practice tab.' },
          uk: { title: 'Speaking', body: 'Speaking' },
        },
      },
      {
        stepId: 'help-adm-speaking-record',
        area: 'Speaking',
        target: 'speaking-record',
        locales: {
          en: { title: 'Record a reply', body: 'Mic permission is required to record. Teachers and admins review learner submissions later.' },
          uk: { title: 'Record a reply', body: 'Запис Speaking' },
        },
      },
      {
        stepId: 'help-adm-practice-irregular',
        area: 'Irregular verbs',
        target: 'practice-card-irregular',
        locales: {
          en: { title: 'Irregular verbs', body: 'Three-forms drill for preview. Results are not saved to a vocabulary deck; they count toward practice week time.' },
          uk: { title: 'Irregular verbs', body: 'Неправильні дієслова' },
        },
      },
      {
        stepId: 'help-adm-irregular-play',
        area: 'Irregular verbs',
        target: 'irregular-play',
        locales: {
          en: { title: 'Start a drill', body: 'Pick a tier, then Play. Same drill learners use — useful when checking what students see.' },
          uk: { title: 'Start a drill', body: 'Старт drill' },
        },
      },
      {
        stepId: 'help-adm-profile-account',
        area: 'Profile',
        target: 'profile-tab-account',
        locales: {
          en: { title: 'Account & Help', body: 'Learning mode, Replay tour, logout.' },
          uk: { title: 'Account & Help', body: 'Account' },
        },
      },
      {
        stepId: 'help-adm-profile-connections',
        area: 'Profile',
        target: 'profile-connections',
        locales: {
          en: { title: 'Your connections', body: 'Personal OAuth links for video hosting when you teach.' },
          uk: { title: 'Your connections', body: 'Connections' },
        },
      },
    ],
  },
  {
    trackId: 'firstWords',
    steps: [
      {
        stepId: 'first-words-modes',
        area: 'Vocabulary',
        target: 'vocab-mode-toggle',
        locales: {
          en: { title: 'Your vocabulary deck', body: 'List, Flashcards, and Play live here. First, add a few words so you have something to study.' },
          uk: { title: 'Your vocabulary deck', body: 'Режими + перші слова' },
        },
      },
      {
        stepId: 'first-words-add',
        area: 'Vocabulary',
        target: 'vocab-add-word',
        locales: {
          en: { title: 'Add your first words', body: 'Type an English word below to look it up and add it to your deck. Two or more cards unlock Play.' },
          uk: { title: 'Add your first words', body: 'Додати перші слова' },
        },
      },
    ],
  },
];

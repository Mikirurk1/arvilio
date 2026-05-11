(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activeMockUser",
    ()=>activeMockUser,
    "activeRole",
    ()=>activeRole,
    "mockUsersByRole",
    ()=>mockUsersByRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const mockUsersByRole = {
    student: {
        id: 'student-1',
        fullName: 'Mykola Kovalenko',
        email: 'mykola@example.com',
        role: 'student',
        avatarInitials: 'MK',
        targetLevel: 'B2',
        streakDays: 14
    },
    teacher: {
        id: 'teacher-1',
        fullName: 'Sarah Mitchell',
        email: 'sarah@example.com',
        role: 'teacher',
        avatarInitials: 'SM',
        targetLevel: 'C1',
        streakDays: 30
    },
    admin: {
        id: 'admin-1',
        fullName: 'Admin Manager',
        email: 'admin@example.com',
        role: 'admin',
        avatarInitials: 'AM',
        targetLevel: 'C2',
        streakDays: 60
    },
    'super-admin': {
        id: 'super-admin-1',
        fullName: 'Platform Owner',
        email: 'owner@example.com',
        role: 'super-admin',
        avatarInitials: 'PO',
        targetLevel: 'C2',
        streakDays: 120
    }
};
const activeRole = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MOCK_ROLE ?? 'student';
const activeMockUser = mockUsersByRole[activeRole];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canEdit",
    ()=>canEdit,
    "canManage",
    ()=>canManage,
    "canSchedule",
    ()=>canSchedule,
    "canView",
    ()=>canView,
    "roleMatrix",
    ()=>roleMatrix
]);
const roleMatrix = {
    dashboard: {
        view: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ],
        edit: [
            'teacher',
            'admin',
            'super-admin'
        ],
        manage: [
            'admin',
            'super-admin'
        ],
        schedule: [
            'teacher',
            'admin',
            'super-admin'
        ]
    },
    profile: {
        view: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ],
        edit: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ],
        manage: [
            'admin',
            'super-admin'
        ],
        schedule: [
            'teacher',
            'admin',
            'super-admin'
        ]
    },
    vocabulary: {
        view: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ],
        edit: [
            'teacher',
            'admin',
            'super-admin'
        ],
        manage: [
            'admin',
            'super-admin'
        ],
        schedule: [
            'teacher',
            'admin',
            'super-admin'
        ]
    },
    quiz: {
        view: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ],
        edit: [
            'teacher',
            'admin',
            'super-admin'
        ],
        manage: [
            'admin',
            'super-admin'
        ],
        schedule: [
            'teacher',
            'admin',
            'super-admin'
        ]
    },
    calendar: {
        view: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ],
        edit: [
            'teacher',
            'admin',
            'super-admin'
        ],
        manage: [
            'admin',
            'super-admin'
        ],
        schedule: [
            'teacher',
            'admin',
            'super-admin'
        ]
    },
    practice: {
        view: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ],
        edit: [
            'teacher',
            'admin',
            'super-admin'
        ],
        manage: [
            'admin',
            'super-admin'
        ],
        schedule: [
            'teacher',
            'admin',
            'super-admin'
        ]
    },
    lessons: {
        view: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ],
        edit: [
            'teacher',
            'admin',
            'super-admin'
        ],
        manage: [
            'admin',
            'super-admin'
        ],
        schedule: [
            'teacher',
            'admin',
            'super-admin'
        ]
    }
};
const includes = (allowed, role)=>allowed.includes(role);
const canView = (scope, role)=>includes(roleMatrix[scope].view, role);
const canEdit = (scope, role)=>includes(roleMatrix[scope].edit, role);
const canManage = (scope, role)=>includes(roleMatrix[scope].manage, role);
const canSchedule = (scope, role)=>includes(roleMatrix[scope].schedule, role);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/content/site-content.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "siteContent",
    ()=>siteContent
]);
const siteContent = {
    dashboard: {
        greeting: 'Good morning',
        subtitle: "Monday, April 20 · You're on a 14-day streak — keep it up!",
        hero: {
            label: 'Continue where you left off',
            title: 'Business Vocabulary — Unit 3',
            subtitle: 'Finance & investment terms · 15 words remaining',
            progressLabel: '62% complete'
        }
    },
    practice: {
        title: 'Practice',
        subtitle: 'Pick an activity: build vocabulary like in the Vocabulary area, or run drills like in the Quiz — all from one place.'
    },
    quiz: {
        title: 'Quiz & Practice',
        subtitle: 'Test your grammar and vocabulary knowledge'
    },
    vocabulary: {
        title: 'Vocabulary'
    },
    calendar: {
        title: 'Calendar'
    },
    profile: {
        title: 'Profile & Settings',
        subtitle: 'Manage your account and preferences'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/lessons.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockLessons",
    ()=>mockLessons
]);
const mockLessons = [
    {
        id: '1',
        title: 'Second & Third Conditionals',
        type: 'grammar',
        level: 'B2',
        duration: 55,
        xp: 30,
        difficulty: 'medium',
        description: 'Learn to express hypothetical situations and past regrets with conditional sentences.',
        completed: false,
        locked: false,
        visibilityByRole: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ]
    },
    {
        id: '2',
        title: 'Finance & Investment Terms',
        type: 'vocabulary',
        level: 'B2',
        duration: 55,
        xp: 25,
        difficulty: 'easy',
        description: '15 essential words for business communication: equity, yield, portfolio, and more.',
        completed: false,
        locked: false,
        visibilityByRole: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ]
    },
    {
        id: '3',
        title: 'Present a Project Proposal',
        type: 'speaking',
        level: 'B2',
        duration: 55,
        xp: 40,
        difficulty: 'hard',
        description: 'Role-play a business meeting: pitching ideas and handling questions confidently.',
        completed: false,
        locked: false,
        visibilityByRole: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ]
    },
    {
        id: '4',
        title: 'Podcast Comprehension',
        type: 'listening',
        level: 'C1',
        duration: 55,
        xp: 35,
        difficulty: 'hard',
        description: 'Improve your listening skills through authentic podcast content.',
        completed: false,
        locked: true,
        visibilityByRole: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/vocabulary.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockReviewWords",
    ()=>mockReviewWords,
    "mockVocabularyWords",
    ()=>mockVocabularyWords
]);
const mockVocabularyWords = [
    {
        id: '1',
        word: 'Eloquent',
        phonetic: '/ˈɛl.ə.kwənt/',
        pos: 'adjective',
        definition: 'Fluent and persuasive in speaking or writing.',
        example: 'She delivered an eloquent speech.',
        status: 'new',
        category: 'communication'
    },
    {
        id: '2',
        word: 'Leverage',
        phonetic: '/ˈlev.ər.ɪdʒ/',
        pos: 'verb / noun',
        definition: 'Use something to maximum advantage.',
        example: 'We need to leverage our network.',
        status: 'learning',
        category: 'business'
    },
    {
        id: '3',
        word: 'Concise',
        phonetic: '/kənˈsaɪs/',
        pos: 'adjective',
        definition: 'Clear and brief.',
        example: 'Please be concise in your presentation.',
        status: 'known',
        category: 'communication'
    },
    {
        id: '4',
        word: 'Ambiguous',
        phonetic: '/æmˈbɪɡ.ju.əs/',
        pos: 'adjective',
        definition: 'Open to more than one interpretation.',
        example: 'The contract terms were ambiguous.',
        status: 'learning',
        category: 'communication'
    }
];
const mockReviewWords = [
    {
        word: 'Eloquent',
        pos: 'adjective',
        def: 'Fluent and persuasive in speech',
        status: 'new'
    },
    {
        word: 'Leverage',
        pos: 'verb/noun',
        def: 'Use to maximum advantage',
        status: 'learning'
    },
    {
        word: 'Concise',
        pos: 'adjective',
        def: 'Clear and brief',
        status: 'known'
    },
    {
        word: 'Ambiguous',
        pos: 'adjective',
        def: 'Open to interpretation',
        status: 'learning'
    },
    {
        word: 'Coherent',
        pos: 'adjective',
        def: 'Logical and consistent',
        status: 'new'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/quiz.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockQuizQuestions",
    ()=>mockQuizQuestions
]);
const mockQuizQuestions = [
    {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Choose the correct conditional sentence:',
        options: [
            'If I would have more time, I will study harder.',
            'If I had more time, I would study harder.',
            'If I have more time, I would study harder.',
            'If I had more time, I will study harder.'
        ],
        correct: 1,
        explanation: 'Second conditional: if + past simple, would + infinitive.'
    },
    {
        id: 'q2',
        type: 'multiple-choice',
        question: "What does 'eloquent' mean?",
        options: [
            'Speaking very loudly',
            'Unable to express oneself',
            'Fluent and persuasive in speech or writing',
            'Using confusing language'
        ],
        correct: 2,
        explanation: 'Eloquent means fluent and persuasive.'
    },
    {
        id: 'q3',
        type: 'fill-in',
        question: 'If I ___ more time, I would study harder.',
        correct: 'had',
        explanation: 'Second conditional uses past simple after if.'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/calendar.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockCalendarEvents",
    ()=>mockCalendarEvents
]);
const mockCalendarEvents = [
    {
        id: 'evt-1',
        title: 'Grammar: Conditionals',
        type: 'grammar',
        date: '2026-04-20',
        time: '10:00',
        duration: 55,
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        studentId: 'student-1',
        studentName: 'Mykola K.',
        status: 'confirmed'
    },
    {
        id: 'evt-2',
        title: 'Speaking: Project Proposal',
        type: 'speaking',
        date: '2026-04-22',
        time: '14:00',
        duration: 55,
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        studentId: 'student-1',
        studentName: 'Mykola K.',
        status: 'pending'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/profile.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockPracticeActivities",
    ()=>mockPracticeActivities,
    "mockProfileAchievements",
    ()=>mockProfileAchievements,
    "mockProfileGoals",
    ()=>mockProfileGoals
]);
const mockProfileAchievements = [
    {
        icon: '🔥',
        label: '14-Day Streak',
        unlocked: true
    },
    {
        icon: '📚',
        label: '500 Words',
        unlocked: true
    },
    {
        icon: '🎯',
        label: 'First Quiz',
        unlocked: true
    },
    {
        icon: '💬',
        label: 'Speaking Pro',
        unlocked: true
    },
    {
        icon: '🏆',
        label: '100% Quiz',
        unlocked: false
    },
    {
        icon: '⭐',
        label: 'Level 20',
        unlocked: false
    },
    {
        icon: '🌍',
        label: '30-Day Streak',
        unlocked: false
    },
    {
        icon: '📖',
        label: '1000 Words',
        unlocked: false
    }
];
const mockProfileGoals = [
    {
        text: 'Complete 1 grammar lesson',
        done: true
    },
    {
        text: 'Review 20 flashcards',
        done: true
    },
    {
        text: 'Practice speaking 10 min',
        done: false
    },
    {
        text: 'Finish all daily goals',
        done: false
    }
];
const mockPracticeActivities = [
    {
        href: '/vocabulary',
        title: 'Vocabulary',
        description: 'Search and organize your words, track new vs known, and flip through flashcards to memorize faster.',
        icon: '📚',
        tag: 'Words',
        tagClass: 'tagGreen'
    },
    {
        href: '/quiz',
        title: 'Quiz',
        description: 'Multiple-choice and fill-in questions on grammar and vocabulary with explanations after each answer.',
        icon: '🎯',
        tag: 'Grammar',
        tagClass: 'tagBlue'
    },
    {
        href: '#',
        title: 'Speaking',
        description: 'Guided speaking prompts and pronunciation practice — we are preparing this mode for your level.',
        icon: '🎙️',
        tag: 'Soon',
        tagClass: 'tagMuted',
        disabled: true
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/content/site-content.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/lessons.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$quiz$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/quiz.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/calendar.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/app/calendar/page.module.scss [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "calLayout": "page-module-scss-module__EZXmPW__calLayout",
  "calMain": "page-module-scss-module__EZXmPW__calMain",
  "calMonthTitle": "page-module-scss-module__EZXmPW__calMonthTitle",
  "calNav": "page-module-scss-module__EZXmPW__calNav",
  "dayCell": "page-module-scss-module__EZXmPW__dayCell",
  "dayCellSelected": "page-module-scss-module__EZXmPW__dayCellSelected",
  "dayCellToday": "page-module-scss-module__EZXmPW__dayCellToday",
  "dayDot": "page-module-scss-module__EZXmPW__dayDot",
  "dayDots": "page-module-scss-module__EZXmPW__dayDots",
  "dayName": "page-module-scss-module__EZXmPW__dayName",
  "dayNum": "page-module-scss-module__EZXmPW__dayNum",
  "dotAmber": "page-module-scss-module__EZXmPW__dotAmber",
  "dotBlue": "page-module-scss-module__EZXmPW__dotBlue",
  "dotGreen": "page-module-scss-module__EZXmPW__dotGreen",
  "dotPurple": "page-module-scss-module__EZXmPW__dotPurple",
  "emptyCell": "page-module-scss-module__EZXmPW__emptyCell",
  "eventCard": "page-module-scss-module__EZXmPW__eventCard",
  "evtActions": "page-module-scss-module__EZXmPW__evtActions",
  "evtAmber": "page-module-scss-module__EZXmPW__evtAmber",
  "evtBlue": "page-module-scss-module__EZXmPW__evtBlue",
  "evtGreen": "page-module-scss-module__EZXmPW__evtGreen",
  "evtHeader": "page-module-scss-module__EZXmPW__evtHeader",
  "evtMeta": "page-module-scss-module__EZXmPW__evtMeta",
  "evtPurple": "page-module-scss-module__EZXmPW__evtPurple",
  "evtStatus": "page-module-scss-module__EZXmPW__evtStatus",
  "evtTeacher": "page-module-scss-module__EZXmPW__evtTeacher",
  "evtTitle": "page-module-scss-module__EZXmPW__evtTitle",
  "evtType": "page-module-scss-module__EZXmPW__evtType",
  "fieldGroup": "page-module-scss-module__EZXmPW__fieldGroup",
  "fieldInput": "page-module-scss-module__EZXmPW__fieldInput",
  "fieldLabel": "page-module-scss-module__EZXmPW__fieldLabel",
  "headerRight": "page-module-scss-module__EZXmPW__headerRight",
  "modal": "page-module-scss-module__EZXmPW__modal",
  "modalActions": "page-module-scss-module__EZXmPW__modalActions",
  "modalCancelBtn": "page-module-scss-module__EZXmPW__modalCancelBtn",
  "modalConfirmBtn": "page-module-scss-module__EZXmPW__modalConfirmBtn",
  "modalFields": "page-module-scss-module__EZXmPW__modalFields",
  "modalLesson": "page-module-scss-module__EZXmPW__modalLesson",
  "modalOverlay": "page-module-scss-module__EZXmPW__modalOverlay",
  "modalTitle": "page-module-scss-module__EZXmPW__modalTitle",
  "monthGrid": "page-module-scss-module__EZXmPW__monthGrid",
  "navBtn": "page-module-scss-module__EZXmPW__navBtn",
  "noEvents": "page-module-scss-module__EZXmPW__noEvents",
  "page": "page-module-scss-module__EZXmPW__page",
  "pageHeader": "page-module-scss-module__EZXmPW__pageHeader",
  "pageSub": "page-module-scss-module__EZXmPW__pageSub",
  "pageTitle": "page-module-scss-module__EZXmPW__pageTitle",
  "rescheduleBtn": "page-module-scss-module__EZXmPW__rescheduleBtn",
  "roleActive": "page-module-scss-module__EZXmPW__roleActive",
  "roleBtn": "page-module-scss-module__EZXmPW__roleBtn",
  "roleToggle": "page-module-scss-module__EZXmPW__roleToggle",
  "sidePanel": "page-module-scss-module__EZXmPW__sidePanel",
  "sidePanelTitle": "page-module-scss-module__EZXmPW__sidePanelTitle",
  "slideUp": "page-module-scss-module__EZXmPW__slideUp",
  "statusConfirmed": "page-module-scss-module__EZXmPW__statusConfirmed",
  "statusPending": "page-module-scss-module__EZXmPW__statusPending",
  "viewActive": "page-module-scss-module__EZXmPW__viewActive",
  "viewBtn": "page-module-scss-module__EZXmPW__viewBtn",
  "viewToggle": "page-module-scss-module__EZXmPW__viewToggle",
  "weekBody": "page-module-scss-module__EZXmPW__weekBody",
  "weekCell": "page-module-scss-module__EZXmPW__weekCell",
  "weekDayHeader": "page-module-scss-module__EZXmPW__weekDayHeader",
  "weekDayName": "page-module-scss-module__EZXmPW__weekDayName",
  "weekDayNum": "page-module-scss-module__EZXmPW__weekDayNum",
  "weekDaySelected": "page-module-scss-module__EZXmPW__weekDaySelected",
  "weekDayToday": "page-module-scss-module__EZXmPW__weekDayToday",
  "weekEvt": "page-module-scss-module__EZXmPW__weekEvt",
  "weekEvtTime": "page-module-scss-module__EZXmPW__weekEvtTime",
  "weekEvtTitle": "page-module-scss-module__EZXmPW__weekEvtTitle",
  "weekHeader": "page-module-scss-module__EZXmPW__weekHeader",
  "weekHour": "page-module-scss-module__EZXmPW__weekHour",
  "weekRow": "page-module-scss-module__EZXmPW__weekRow",
  "weekTimeCol": "page-module-scss-module__EZXmPW__weekTimeCol",
  "weekView": "page-module-scss-module__EZXmPW__weekView",
});
}),
"[project]/apps/web/src/app/calendar/sections.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarHeaderControls",
    ()=>CalendarHeaderControls,
    "CalendarMonthNavigator",
    ()=>CalendarMonthNavigator,
    "SelectedDateSidebar",
    ()=>SelectedDateSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$CalendarEventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/CalendarEventCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SegmentedControl.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/calendar/page.module.scss [app-client] (css module)");
'use client';
;
;
;
;
function CalendarHeaderControls({ view, setView, role, setRole }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].headerRight,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SegmentedControl"], {
                value: view,
                onValueChange: setView,
                ariaLabel: "Calendar view",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].viewToggle,
                optionClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].viewBtn,
                activeOptionClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].viewActive,
                options: [
                    {
                        value: 'month',
                        label: 'Month'
                    },
                    {
                        value: 'week',
                        label: 'Week'
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SegmentedControl"], {
                value: role,
                onValueChange: setRole,
                ariaLabel: "Calendar role",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].roleToggle,
                optionClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].roleBtn,
                activeOptionClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].roleActive,
                options: [
                    {
                        value: 'student',
                        label: 'Student'
                    },
                    {
                        value: 'teacher',
                        label: 'Teacher'
                    },
                    {
                        value: 'admin',
                        label: 'Admin'
                    },
                    {
                        value: 'super-admin',
                        label: 'Super Admin'
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = CalendarHeaderControls;
function SelectedDateSidebar({ selectedDate, selectedEvents, role, typeColor, typeLabel, onReschedule }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calSidebar,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SurfaceCard"], {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sidePanel,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sidePanelTitle,
                    children: selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    }) : 'Select a date'
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                selectedEvents.length === 0 && selectedDate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].noEvents,
                    children: "No lessons scheduled"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
                    lineNumber: 78,
                    columnNumber: 56
                }, this) : null,
                selectedEvents.map((eventItem)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$CalendarEventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarEventCard"], {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].eventCard} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"][`evt${typeColor[eventItem.type]}`]}`,
                        headerClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].evtHeader,
                        typeClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].evtType,
                        statusClassName: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].evtStatus} ${eventItem.status === 'confirmed' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statusConfirmed : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statusPending}`,
                        titleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].evtTitle,
                        metaClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].evtMeta,
                        teacherClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].evtTeacher,
                        actionsClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].evtActions,
                        actionButtonClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].rescheduleBtn,
                        typeLabel: typeLabel[eventItem.type],
                        typeVariant: eventItem.type === 'vocabulary' ? 'green' : eventItem.type === 'speaking' ? 'amber' : 'blue',
                        statusLabel: eventItem.status,
                        statusVariant: eventItem.status === 'confirmed' ? 'green' : 'amber',
                        title: eventItem.title,
                        time: eventItem.time,
                        teacherName: eventItem.teacherName,
                        actionLabel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canSchedule"])('calendar', role) ? 'Reschedule' : 'Request change',
                        onAction: ()=>onReschedule(eventItem)
                    }, eventItem.id, false, {
                        fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
                        lineNumber: 80,
                        columnNumber: 11
                    }, this))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
            lineNumber: 68,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
_c1 = SelectedDateSidebar;
function CalendarMonthNavigator({ monthLabel, onPrev, onNext }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calNav,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                type: "button",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].navBtn,
                onClick: onPrev,
                children: "←"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calMonthTitle,
                children: monthLabel
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                type: "button",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].navBtn,
                onClick: onNext,
                children: "→"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/calendar/sections.tsx",
        lineNumber: 117,
        columnNumber: 5
    }, this);
}
_c2 = CalendarMonthNavigator;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "CalendarHeaderControls");
__turbopack_context__.k.register(_c1, "SelectedDateSidebar");
__turbopack_context__.k.register(_c2, "CalendarMonthNavigator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/app/calendar/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CalendarPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/PageHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/calendar.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/content/site-content.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/calendar/sections.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/calendar/page.module.scss [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function CalendarPage() {
    _s();
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canView"])('calendar', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role)) return null;
    const [events, setEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockCalendarEvents"]);
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role);
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('2026-04-20');
    const [rescheduleEvt, setRescheduleEvt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [newDate, setNewDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [newTime, setNewTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('month');
    const [year, setYear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(2026);
    const [month, setMonth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(3);
    const MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August'
    ];
    const DAYS = [
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        'Sun'
    ];
    const visibleEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarPage.useMemo[visibleEvents]": ()=>events.filter({
                "CalendarPage.useMemo[visibleEvents]": (eventItem)=>role === 'student' ? eventItem.studentId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id : true
            }["CalendarPage.useMemo[visibleEvents]"])
    }["CalendarPage.useMemo[visibleEvents]"], [
        events,
        role
    ]);
    const eventsOnDate = (date)=>visibleEvents.filter((eventItem)=>eventItem.date === date);
    const selectedEvents = selectedDate ? eventsOnDate(selectedDate) : [];
    const daysCount = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const weekStart = (()=>{
        const base = selectedDate ? new Date(selectedDate) : new Date(year, month, 1);
        const dow = base.getDay() === 0 ? 6 : base.getDay() - 1;
        const start = new Date(base);
        start.setDate(base.getDate() - dow);
        return start;
    })();
    const weekDays = Array.from({
        length: 7
    }, (_, i)=>{
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        return date;
    });
    const hours = Array.from({
        length: 12
    }, (_, i)=>i + 8);
    const typeColor = {
        grammar: 'Blue',
        vocabulary: 'Green',
        speaking: 'Amber',
        listening: 'Purple'
    };
    const typeLabel = {
        grammar: 'Grammar',
        vocabulary: 'Vocabulary',
        speaking: 'Speaking',
        listening: 'Listening'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].page} container container--page`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PageHeader"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageHeader,
                titleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageTitle,
                subtitleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageSub,
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["siteContent"].calendar.title,
                subtitle: role === 'student' ? 'Your personal lesson schedule' : `Teacher view — all students (${[
                    ...new Set(events.map((eventItem)=>eventItem.studentId))
                ].length} students)`,
                actions: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarHeaderControls"], {
                    view: view,
                    setView: setView,
                    role: role,
                    setRole: setRole
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                    lineNumber: 61,
                    columnNumber: 18
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calLayout,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calMain,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarMonthNavigator"], {
                                monthLabel: `${MONTHS[month]} ${year}`,
                                onPrev: ()=>{
                                    if (month === 0) {
                                        setYear((y)=>y - 1);
                                        setMonth(11);
                                    } else setMonth((m)=>m - 1);
                                },
                                onNext: ()=>{
                                    if (month === 11) {
                                        setYear((y)=>y + 1);
                                        setMonth(0);
                                    } else setMonth((m)=>m + 1);
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            view === 'month' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].monthGrid,
                                children: [
                                    DAYS.map((day)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dayName,
                                            children: day
                                        }, day, false, {
                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                            lineNumber: 85,
                                            columnNumber: 17
                                        }, this)),
                                    Array.from({
                                        length: firstDow
                                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyCell
                                        }, `e${i}`, false, {
                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                            lineNumber: 90,
                                            columnNumber: 17
                                        }, this)),
                                    Array.from({
                                        length: daysCount
                                    }, (_, i)=>{
                                        const day = i + 1;
                                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const dayEvents = eventsOnDate(dateStr);
                                        const isSelected = selectedDate === dateStr;
                                        const isToday = dateStr === '2026-04-20';
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dayCell} ${isSelected ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dayCellSelected : ''} ${isToday ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dayCellToday : ''}`,
                                            onClick: ()=>setSelectedDate(dateStr),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dayNum,
                                                    children: day
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                    lineNumber: 104,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dayDots,
                                                    children: dayEvents.slice(0, 3).map((eventItem)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].dayDot} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"][`dot${typeColor[eventItem.type]}`]}`
                                                        }, eventItem.id, false, {
                                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                            lineNumber: 107,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                    lineNumber: 105,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, day, true, {
                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                            lineNumber: 99,
                                            columnNumber: 19
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                lineNumber: 83,
                                columnNumber: 13
                            }, this),
                            view === 'week' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekView,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekHeader,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekTimeCol
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                lineNumber: 122,
                                                columnNumber: 17
                                            }, this),
                                            weekDays.map((date)=>{
                                                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                                const isToday = dateStr === '2026-04-20';
                                                const isSelected = selectedDate === dateStr;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekDayHeader} ${isToday ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekDayToday : ''} ${isSelected ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekDaySelected : ''}`,
                                                    onClick: ()=>setSelectedDate(dateStr),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekDayName,
                                                            children: DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                            lineNumber: 133,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekDayNum,
                                                            children: date.getDate()
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                            lineNumber: 134,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, dateStr, true, {
                                                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                    lineNumber: 128,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekBody,
                                        children: hours.map((hour)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekRow,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekHour,
                                                        children: [
                                                            hour,
                                                            ":00"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                        lineNumber: 142,
                                                        columnNumber: 21
                                                    }, this),
                                                    weekDays.map((date)=>{
                                                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                                        const slotEvents = eventsOnDate(dateStr).filter((eventItem)=>parseInt(eventItem.time, 10) === hour);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekCell,
                                                            children: slotEvents.map((eventItem)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekEvt} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"][`evt${typeColor[eventItem.type]}`]}`,
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekEvtTitle,
                                                                            children: eventItem.title
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                                            lineNumber: 150,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekEvtTime,
                                                                            children: [
                                                                                eventItem.time,
                                                                                " · 55 min"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                                            lineNumber: 151,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, eventItem.id, true, {
                                                                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                                    lineNumber: 149,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, dateStr, false, {
                                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                            lineNumber: 147,
                                                            columnNumber: 25
                                                        }, this);
                                                    })
                                                ]
                                            }, hour, true, {
                                                fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                                lineNumber: 141,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                        lineNumber: 139,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectedDateSidebar"], {
                        selectedDate: selectedDate,
                        selectedEvents: selectedEvents,
                        role: role,
                        typeColor: typeColor,
                        typeLabel: typeLabel,
                        onReschedule: (eventItem)=>{
                            setRescheduleEvt(eventItem);
                            setNewDate(eventItem.date);
                            setNewTime(eventItem.time);
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            rescheduleEvt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalOverlay,
                onClick: ()=>setRescheduleEvt(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modal,
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalTitle,
                            children: role === 'teacher' ? 'Reschedule lesson' : 'Request reschedule'
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                            lineNumber: 181,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalLesson,
                            children: rescheduleEvt.title
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                            lineNumber: 182,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalFields,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                                            children: "New date"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                            lineNumber: 185,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            type: "date",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                                            value: newDate,
                                            onChange: (e)=>setNewDate(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                            lineNumber: 186,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                    lineNumber: 184,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                                            children: "New time"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                            lineNumber: 189,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            type: "time",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                                            value: newTime,
                                            onChange: (e)=>setNewTime(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                            lineNumber: 190,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                    lineNumber: 188,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                            lineNumber: 183,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalActions,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "button",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalCancelBtn,
                                    onClick: ()=>setRescheduleEvt(null),
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                    lineNumber: 194,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "button",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$calendar$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalConfirmBtn,
                                    onClick: ()=>{
                                        if (!rescheduleEvt) return;
                                        setEvents((prev)=>prev.map((eventItem)=>eventItem.id === rescheduleEvt.id ? {
                                                    ...eventItem,
                                                    date: newDate,
                                                    time: newTime,
                                                    status: 'pending'
                                                } : eventItem));
                                        setRescheduleEvt(null);
                                    },
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canSchedule"])('calendar', role) ? 'Confirm reschedule' : 'Send request'
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                                    lineNumber: 197,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                            lineNumber: 193,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                    lineNumber: 180,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/calendar/page.tsx",
                lineNumber: 179,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/calendar/page.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_s(CalendarPage, "qtbozdBgZ3zT+N0XXdzJQhyAYC4=");
_c = CalendarPage;
var _c;
__turbopack_context__.k.register(_c, "CalendarPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_web_src_d4624d81._.js.map
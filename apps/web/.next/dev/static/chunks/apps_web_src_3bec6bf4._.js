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
"[project]/apps/web/src/app/quiz/page.module.scss [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "amber": "page-module-scss-module__zZ5OZG__amber",
  "checkBtn": "page-module-scss-module__zZ5OZG__checkBtn",
  "expCorrect": "page-module-scss-module__zZ5OZG__expCorrect",
  "expIcon": "page-module-scss-module__zZ5OZG__expIcon",
  "expText": "page-module-scss-module__zZ5OZG__expText",
  "expWrong": "page-module-scss-module__zZ5OZG__expWrong",
  "explanation": "page-module-scss-module__zZ5OZG__explanation",
  "fillArea": "page-module-scss-module__zZ5OZG__fillArea",
  "fillCorrect": "page-module-scss-module__zZ5OZG__fillCorrect",
  "fillCorrectAnswer": "page-module-scss-module__zZ5OZG__fillCorrectAnswer",
  "fillInput": "page-module-scss-module__zZ5OZG__fillInput",
  "fillWrong": "page-module-scss-module__zZ5OZG__fillWrong",
  "green": "page-module-scss-module__zZ5OZG__green",
  "introCard": "page-module-scss-module__zZ5OZG__introCard",
  "introDesc": "page-module-scss-module__zZ5OZG__introDesc",
  "introIcon": "page-module-scss-module__zZ5OZG__introIcon",
  "introMeta": "page-module-scss-module__zZ5OZG__introMeta",
  "introMetaItem": "page-module-scss-module__zZ5OZG__introMetaItem",
  "introMetaLbl": "page-module-scss-module__zZ5OZG__introMetaLbl",
  "introMetaVal": "page-module-scss-module__zZ5OZG__introMetaVal",
  "introTitle": "page-module-scss-module__zZ5OZG__introTitle",
  "nextBtn": "page-module-scss-module__zZ5OZG__nextBtn",
  "option": "page-module-scss-module__zZ5OZG__option",
  "optionCorrect": "page-module-scss-module__zZ5OZG__optionCorrect",
  "optionLetter": "page-module-scss-module__zZ5OZG__optionLetter",
  "optionSelected": "page-module-scss-module__zZ5OZG__optionSelected",
  "optionWrong": "page-module-scss-module__zZ5OZG__optionWrong",
  "options": "page-module-scss-module__zZ5OZG__options",
  "page": "page-module-scss-module__zZ5OZG__page",
  "pageHeader": "page-module-scss-module__zZ5OZG__pageHeader",
  "pageSub": "page-module-scss-module__zZ5OZG__pageSub",
  "pageTitle": "page-module-scss-module__zZ5OZG__pageTitle",
  "qProgress": "page-module-scss-module__zZ5OZG__qProgress",
  "qProgressBar": "page-module-scss-module__zZ5OZG__qProgressBar",
  "qProgressFill": "page-module-scss-module__zZ5OZG__qProgressFill",
  "qProgressLbl": "page-module-scss-module__zZ5OZG__qProgressLbl",
  "qText": "page-module-scss-module__zZ5OZG__qText",
  "qType": "page-module-scss-module__zZ5OZG__qType",
  "questionCard": "page-module-scss-module__zZ5OZG__questionCard",
  "quizArea": "page-module-scss-module__zZ5OZG__quizArea",
  "raCorrect": "page-module-scss-module__zZ5OZG__raCorrect",
  "raIcon": "page-module-scss-module__zZ5OZG__raIcon",
  "raQ": "page-module-scss-module__zZ5OZG__raQ",
  "raWrong": "page-module-scss-module__zZ5OZG__raWrong",
  "result": "page-module-scss-module__zZ5OZG__result",
  "resultAnswer": "page-module-scss-module__zZ5OZG__resultAnswer",
  "resultAnswers": "page-module-scss-module__zZ5OZG__resultAnswers",
  "resultCard": "page-module-scss-module__zZ5OZG__resultCard",
  "resultEmoji": "page-module-scss-module__zZ5OZG__resultEmoji",
  "resultPct": "page-module-scss-module__zZ5OZG__resultPct",
  "resultScore": "page-module-scss-module__zZ5OZG__resultScore",
  "resultStat": "page-module-scss-module__zZ5OZG__resultStat",
  "resultStatLbl": "page-module-scss-module__zZ5OZG__resultStatLbl",
  "resultStatVal": "page-module-scss-module__zZ5OZG__resultStatVal",
  "resultStats": "page-module-scss-module__zZ5OZG__resultStats",
  "resultTitle": "page-module-scss-module__zZ5OZG__resultTitle",
  "retryBtn": "page-module-scss-module__zZ5OZG__retryBtn",
  "rose": "page-module-scss-module__zZ5OZG__rose",
  "scaleIn": "page-module-scss-module__zZ5OZG__scaleIn",
  "scoreDot": "page-module-scss-module__zZ5OZG__scoreDot",
  "scoreDotEmpty": "page-module-scss-module__zZ5OZG__scoreDotEmpty",
  "scoreDotGreen": "page-module-scss-module__zZ5OZG__scoreDotGreen",
  "scoreDotRed": "page-module-scss-module__zZ5OZG__scoreDotRed",
  "scoreRow": "page-module-scss-module__zZ5OZG__scoreRow",
  "slideUp": "page-module-scss-module__zZ5OZG__slideUp",
  "startBtn": "page-module-scss-module__zZ5OZG__startBtn",
  "tagBlue": "page-module-scss-module__zZ5OZG__tagBlue",
  "tagGreen": "page-module-scss-module__zZ5OZG__tagGreen",
  "topicCard": "page-module-scss-module__zZ5OZG__topicCard",
  "topicDesc": "page-module-scss-module__zZ5OZG__topicDesc",
  "topicIcon": "page-module-scss-module__zZ5OZG__topicIcon",
  "topicTag": "page-module-scss-module__zZ5OZG__topicTag",
  "topicTitle": "page-module-scss-module__zZ5OZG__topicTitle",
  "topicsGrid": "page-module-scss-module__zZ5OZG__topicsGrid",
});
}),
"[project]/apps/web/src/app/quiz/sections.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuizProgress",
    ()=>QuizProgress,
    "QuizResultStats",
    ()=>QuizResultStats,
    "QuizTopicsGrid",
    ()=>QuizTopicsGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$FeatureCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/FeatureCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProgressHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ProgressHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/StatTile.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/quiz/page.module.scss [app-client] (css module)");
'use client';
;
;
;
function QuizTopicsGrid() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].topicsGrid,
        children: [
            {
                icon: '📐',
                title: 'Second Conditional',
                desc: 'Hypothetical present/future situations',
                tag: 'Grammar'
            },
            {
                icon: '📜',
                title: 'Third Conditional',
                desc: 'Imaginary past situations and regrets',
                tag: 'Grammar'
            },
            {
                icon: '🔄',
                title: 'Passive Voice',
                desc: 'Active vs passive constructions',
                tag: 'Grammar'
            },
            {
                icon: '💼',
                title: 'Business Vocabulary',
                desc: 'Essential words for professional contexts',
                tag: 'Vocabulary'
            }
        ].map((topic, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$FeatureCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FeatureCard"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].topicCard,
                iconClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].topicIcon,
                titleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].topicTitle,
                descriptionClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].topicDesc,
                footerClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].topicFooter,
                title: topic.title,
                description: topic.desc,
                icon: topic.icon,
                tag: topic.tag,
                tagVariant: topic.tag === 'Grammar' ? 'blue' : 'green'
            }, i, false, {
                fileName: "[project]/apps/web/src/app/quiz/sections.tsx",
                lineNumber: 15,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/quiz/sections.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = QuizTopicsGrid;
function QuizResultStats({ score, total }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStats,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatTile"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStat,
                label: "Correct",
                labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStatLbl,
                value: score,
                valueClassName: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStatVal} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].green}`
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/quiz/sections.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatTile"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStat,
                label: "Wrong",
                labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStatLbl,
                value: total - score,
                valueClassName: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStatVal} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].rose}`
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/quiz/sections.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatTile"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStat,
                label: "Accuracy",
                labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStatLbl,
                value: `${total ? Math.round(score / total * 100) : 0}%`,
                valueClassName: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultStatVal} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].amber}`
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/quiz/sections.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/quiz/sections.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_c1 = QuizResultStats;
function QuizProgress({ current, total }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProgressHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProgressHeader"], {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].qProgress,
        barClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].qProgressBar,
        fillClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].qProgressFill,
        labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].qProgressLbl,
        current: current,
        total: total
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/quiz/sections.tsx",
        lineNumber: 44,
        columnNumber: 10
    }, this);
}
_c2 = QuizProgress;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "QuizTopicsGrid");
__turbopack_context__.k.register(_c1, "QuizResultStats");
__turbopack_context__.k.register(_c2, "QuizProgress");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/app/quiz/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuizPage
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$quiz$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/quiz.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/content/site-content.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/quiz/sections.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/quiz/page.module.scss [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function QuizPage() {
    _s();
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canView"])('quiz', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role)) return null;
    const [questions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$quiz$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockQuizQuestions"]);
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('intro');
    const [current, setCurrent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [fillAnswer, setFillAnswer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showExp, setShowExp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [answers, setAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [score, setScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const q = questions[current];
    const checkAnswer = ()=>{
        if (!q) return;
        let correct = false;
        if (q.type === 'multiple-choice') {
            correct = selected === q.correct;
        } else {
            correct = fillAnswer.trim().toLowerCase() === q.correct.toLowerCase();
        }
        setAnswers((prev)=>[
                ...prev,
                correct
            ]);
        if (correct) setScore((s)=>s + 1);
        setShowExp(true);
    };
    const next = ()=>{
        setSelected(null);
        setFillAnswer('');
        setShowExp(false);
        if (current + 1 >= questions.length) {
            setPhase('result');
        } else {
            setCurrent((c)=>c + 1);
        }
    };
    const restart = ()=>{
        setCurrent(0);
        setSelected(null);
        setFillAnswer('');
        setShowExp(false);
        setAnswers([]);
        setScore(0);
        setPhase('intro');
    };
    const pct = questions.length ? Math.round(score / questions.length * 100) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].page} container container--narrow`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PageHeader"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageHeader,
                titleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageTitle,
                subtitleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageSub,
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["siteContent"].quiz.title,
                subtitle: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["siteContent"].quiz.subtitle} · ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role}`
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            phase === 'intro' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].intro,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introCard,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introIcon,
                                children: "🎯"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introTitle,
                                children: "Daily Grammar & Vocabulary Quiz"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introDesc,
                                children: [
                                    questions.length,
                                    " questions covering conditionals, passive voice, and key business vocabulary. Each correct answer strengthens your memory."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMeta,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMetaItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMetaVal,
                                                children: questions.length
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                                lineNumber: 80,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMetaLbl,
                                                children: "Questions"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                                lineNumber: 81,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                        lineNumber: 79,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMetaItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMetaVal,
                                                children: "~10"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                                lineNumber: 84,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMetaLbl,
                                                children: "Minutes"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                                lineNumber: 85,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                        lineNumber: 83,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMetaItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMetaVal,
                                                children: "3"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                                lineNumber: 88,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introMetaLbl,
                                                children: "Topics"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                                lineNumber: 89,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                        lineNumber: 87,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].startBtn,
                                onClick: ()=>setPhase('quiz'),
                                children: "Start Quiz →"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuizTopicsGrid"], {}, void 0, false, {
                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this),
            phase === 'quiz' && q && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].quizArea,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuizProgress"], {
                        current: current + 1,
                        total: questions.length
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                        lineNumber: 102,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].scoreRow,
                        children: [
                            answers.map((ok, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].scoreDot} ${ok ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].scoreDotGreen : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].scoreDotRed}`
                                }, i, false, {
                                    fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                    lineNumber: 106,
                                    columnNumber: 15
                                }, this)),
                            Array.from({
                                length: questions.length - answers.length
                            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].scoreDotEmpty
                                }, `empty-${i}`, false, {
                                    fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                    lineNumber: 109,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].questionCard,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].qType,
                                children: q.type === 'multiple-choice' ? '🎯 Multiple choice' : '✍️ Fill in the blank'
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 114,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].qText,
                                children: q.question
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this),
                            q.type === 'multiple-choice' && q.options && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].options,
                                children: q.options.map((opt, i)=>{
                                    let cls = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].option;
                                    if (showExp) {
                                        if (i === q.correct) cls = `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].option} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].optionCorrect}`;
                                        else if (i === selected) cls = `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].option} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].optionWrong}`;
                                    } else if (i === selected) {
                                        cls = `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].option} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].optionSelected}`;
                                    }
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "button",
                                        className: cls,
                                        onClick: ()=>!showExp && setSelected(i),
                                        disabled: showExp,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].optionLetter,
                                                children: String.fromCharCode(65 + i)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                                lineNumber: 131,
                                                columnNumber: 23
                                            }, this),
                                            opt
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                        lineNumber: 130,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 120,
                                columnNumber: 15
                            }, this),
                            q.type === 'fill-in' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fillArea,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fillInput} ${showExp ? answers[answers.length - 1] ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fillCorrect : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fillWrong : ''}`,
                                        placeholder: "Type your answer here...",
                                        value: fillAnswer,
                                        onChange: (e)=>!showExp && setFillAnswer(e.target.value),
                                        onKeyDown: (e)=>e.key === 'Enter' && !showExp && fillAnswer && checkAnswer(),
                                        disabled: showExp
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                        lineNumber: 141,
                                        columnNumber: 17
                                    }, this),
                                    showExp && !answers[answers.length - 1] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fillCorrectAnswer,
                                        children: [
                                            "Correct: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: q.correct
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                                lineNumber: 153,
                                                columnNumber: 30
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                        lineNumber: 152,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 140,
                                columnNumber: 15
                            }, this),
                            showExp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].explanation} ${answers[answers.length - 1] ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].expCorrect : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].expWrong}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].expIcon,
                                        children: answers[answers.length - 1] ? '✓ Correct!' : '✗ Not quite'
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                        lineNumber: 161,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].expText,
                                        children: q.explanation
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                        lineNumber: 162,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 160,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].qActions,
                                children: !showExp ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "button",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkBtn,
                                    onClick: checkAnswer,
                                    disabled: q.type === 'multiple-choice' ? selected === null : !fillAnswer.trim(),
                                    children: "Check Answer"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                    lineNumber: 168,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "button",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].nextBtn,
                                    onClick: next,
                                    children: current + 1 >= questions.length ? 'See Results →' : 'Next Question →'
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                    lineNumber: 177,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                lineNumber: 101,
                columnNumber: 9
            }, this),
            phase === 'result' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].result,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultCard,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultEmoji,
                            children: pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📖'
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                            lineNumber: 189,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultTitle,
                            children: pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good job!' : 'Keep practicing!'
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                            lineNumber: 190,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultScore,
                            children: [
                                score,
                                " / ",
                                questions.length
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                            lineNumber: 191,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultPct,
                            children: [
                                pct,
                                "% correct"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                            lineNumber: 194,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuizResultStats"], {
                            score: score,
                            total: questions.length
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                            lineNumber: 196,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultAnswers,
                            children: questions.map((question, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultAnswer} ${answers[i] ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].raCorrect : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].raWrong}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].raIcon,
                                            children: answers[i] ? '✓' : '✗'
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                            lineNumber: 201,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].raQ,
                                            children: question.question.length > 60 ? `${question.question.slice(0, 60)}…` : question.question
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                            lineNumber: 202,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, question.id, true, {
                                    fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                    lineNumber: 200,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                            lineNumber: 198,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultActions,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$quiz$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].retryBtn,
                                onClick: restart,
                                children: "Try again"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                                lineNumber: 210,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                            lineNumber: 209,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                    lineNumber: 188,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/quiz/page.tsx",
                lineNumber: 187,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/quiz/page.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
_s(QuizPage, "1kRpwDM1sul8sHDJxZhqCaCoI5o=");
_c = QuizPage;
var _c;
__turbopack_context__.k.register(_c, "QuizPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_web_src_3bec6bf4._.js.map
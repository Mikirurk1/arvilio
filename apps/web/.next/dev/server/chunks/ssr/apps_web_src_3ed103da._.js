module.exports = [
"[project]/apps/web/src/components/profile/ProfileViewShell.module.scss [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "achievement": "ProfileViewShell-module-scss-module__IiFhva__achievement",
  "achievementIcon": "ProfileViewShell-module-scss-module__IiFhva__achievementIcon",
  "achievementLabel": "ProfileViewShell-module-scss-module__IiFhva__achievementLabel",
  "achievementLocked": "ProfileViewShell-module-scss-module__IiFhva__achievementLocked",
  "achievementTooltip": "ProfileViewShell-module-scss-module__IiFhva__achievementTooltip",
  "achievementUnlocked": "ProfileViewShell-module-scss-module__IiFhva__achievementUnlocked",
  "achievementsRow": "ProfileViewShell-module-scss-module__IiFhva__achievementsRow",
  "avatarBig": "ProfileViewShell-module-scss-module__IiFhva__avatarBig",
  "badge": "ProfileViewShell-module-scss-module__IiFhva__badge",
  "heroBadges": "ProfileViewShell-module-scss-module__IiFhva__heroBadges",
  "heroInfo": "ProfileViewShell-module-scss-module__IiFhva__heroInfo",
  "heroMeta": "ProfileViewShell-module-scss-module__IiFhva__heroMeta",
  "heroName": "ProfileViewShell-module-scss-module__IiFhva__heroName",
  "heroStat": "ProfileViewShell-module-scss-module__IiFhva__heroStat",
  "heroStatLbl": "ProfileViewShell-module-scss-module__IiFhva__heroStatLbl",
  "heroStatVal": "ProfileViewShell-module-scss-module__IiFhva__heroStatVal",
  "heroStats": "ProfileViewShell-module-scss-module__IiFhva__heroStats",
  "page": "ProfileViewShell-module-scss-module__IiFhva__page",
  "pageHeader": "ProfileViewShell-module-scss-module__IiFhva__pageHeader",
  "pageSub": "ProfileViewShell-module-scss-module__IiFhva__pageSub",
  "pageTitle": "ProfileViewShell-module-scss-module__IiFhva__pageTitle",
  "profileHero": "ProfileViewShell-module-scss-module__IiFhva__profileHero",
  "slideUp": "ProfileViewShell-module-scss-module__IiFhva__slideUp",
  "tabActive": "ProfileViewShell-module-scss-module__IiFhva__tabActive",
  "tabBtn": "ProfileViewShell-module-scss-module__IiFhva__tabBtn",
  "tabsRow": "ProfileViewShell-module-scss-module__IiFhva__tabsRow",
});
}),
"[project]/apps/web/src/components/profile/ProfileViewShell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileViewShell",
    ()=>ProfileViewShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AchievementCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/PageHeader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProfileHero$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ProfileHero.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/profile/ProfileViewShell.module.scss [app-ssr] (css module)");
'use client';
;
;
;
function ProfileViewShell({ title, subtitle, avatar, name, meta, badges, stats, achievements, tab, onTabChange, tabs }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].page} container container--page`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PageHeader"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].pageHeader,
                titleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].pageTitle,
                subtitleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].pageSub,
                title: title,
                subtitle: subtitle
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/profile/ProfileViewShell.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProfileHero$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProfileHero"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].profileHero,
                avatarClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].avatarBig,
                infoClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].heroInfo,
                nameClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].heroName,
                metaClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].heroMeta,
                badgesClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].heroBadges,
                statsClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].heroStats,
                statClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].heroStat,
                statValueClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].heroStatVal,
                statLabelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].heroStatLbl,
                avatar: avatar,
                name: name,
                meta: meta,
                badges: badges.map((badge, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badge,
                        variant: badge.variant ?? 'neutral',
                        children: badge.label
                    }, `${index}-${badge.label?.toString() ?? 'badge'}`, false, {
                        fileName: "[project]/apps/web/src/components/profile/ProfileViewShell.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, void 0)),
                stats: stats
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/profile/ProfileViewShell.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementsRow,
                children: achievements.map((achievement)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AchievementCard"], {
                        icon: achievement.icon,
                        label: achievement.label,
                        unlocked: achievement.unlocked,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievement,
                        unlockedClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementUnlocked,
                        lockedClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementLocked,
                        iconClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementIcon,
                        labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementLabel,
                        tooltipClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementTooltip,
                        description: achievement.description
                    }, achievement.label, false, {
                        fileName: "[project]/apps/web/src/components/profile/ProfileViewShell.tsx",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/profile/ProfileViewShell.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tabs"], {
                value: tab,
                onValueChange: onTabChange,
                ariaLabel: "Profile tabs",
                listClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabsRow,
                triggerClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabBtn,
                activeTriggerClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabActive,
                items: tabs
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/profile/ProfileViewShell.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/profile/ProfileViewShell.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/calendar/adapters/lessonCalendarAdapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateEndTime",
    ()=>calculateEndTime,
    "fromLessonFormState",
    ()=>fromLessonFormState,
    "nextLessonEntityId",
    ()=>nextLessonEntityId,
    "toLessonFormState",
    ()=>toLessonFormState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
;
function nextLessonEntityId(lessons) {
    let max = 0;
    for (const l of lessons){
        if (l.id > max) max = l.id;
    }
    return max + 1;
}
function calculateEndTime(startTime, duration) {
    const [hour, minute] = startTime.split(':').map(Number);
    const total = hour * 60 + minute + duration;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
function toLessonFormState(lesson) {
    return {
        title: lesson.title,
        date: lesson.date,
        startTime: lesson.startTime,
        timezoneId: lesson.timezoneId ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        duration: lesson.duration,
        teacherId: lesson.teacherId,
        teacherName: lesson.teacherName,
        studentId: lesson.studentId,
        studentName: lesson.studentName,
        notes: lesson.notes ?? '',
        lessonPlan: lesson.lessonPlan ?? '',
        materials: lesson.materials?.map((material)=>({
                ...material,
                kind: material.kind ?? 'text'
            })) ?? [],
        homeworkText: lesson.homework?.text ?? '',
        homeworkFiles: lesson.homework?.files ?? [],
        studentResponseText: lesson.studentResponse?.text ?? '',
        studentResponseFiles: lesson.studentResponse?.files ?? [],
        studentResponseStatus: lesson.studentResponse?.status ?? 'not_submitted',
        homeworkChecked: lesson.studentResponse?.homeworkChecked ?? false,
        teacherHomeworkFeedback: lesson.studentResponse?.teacherHomeworkFeedback ?? '',
        statusId: lesson.statusId,
        cancelReason: lesson.cancelReason,
        credited: lesson.credited,
        recurrence: lesson.recurrence,
        weeklyDays: lesson.weeklyDays ?? [],
        applyToSeries: false,
        linkedVocabularyIds: [
            ...lesson.linkedVocabularyIds ?? []
        ]
    };
}
function fromLessonFormState(form, existing, newLessonId) {
    return {
        id: existing?.id ?? newLessonId ?? Date.now(),
        lessonId: existing?.lessonId,
        title: form.title,
        date: form.date,
        startTime: form.startTime,
        endTime: calculateEndTime(form.startTime, form.duration),
        duration: form.duration,
        timezoneId: form.timezoneId ?? existing?.timezoneId ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        teacherId: form.teacherId,
        teacherName: form.teacherName,
        studentId: form.studentId,
        studentName: form.studentName,
        statusId: form.statusId,
        cancelReason: form.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? form.cancelReason : undefined,
        credited: form.credited,
        notes: form.notes,
        description: existing?.description,
        lessonPlan: form.lessonPlan,
        materials: form.materials,
        homework: {
            text: form.homeworkText,
            files: form.homeworkFiles
        },
        studentResponse: {
            text: form.studentResponseText,
            files: form.studentResponseFiles,
            status: form.studentResponseStatus,
            homeworkChecked: form.homeworkChecked,
            teacherHomeworkFeedback: form.teacherHomeworkFeedback
        },
        order: existing?.order ?? 1,
        recurrence: form.recurrence,
        weeklyDays: form.recurrence === 'weekly' ? form.weeklyDays : [],
        seriesId: existing?.seriesId ?? (form.recurrence !== 'none' ? `series-${Date.now()}` : undefined),
        linkedVocabularyIds: form.linkedVocabularyIds.length > 0 ? [
            ...form.linkedVocabularyIds
        ] : undefined
    };
}
}),
"[project]/apps/web/src/app/profile/page.module.scss [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "accountItem": "page-module-scss-module__ANyPxW__accountItem",
  "accountItemDesc": "page-module-scss-module__ANyPxW__accountItemDesc",
  "accountItemTitle": "page-module-scss-module__ANyPxW__accountItemTitle",
  "achievement": "page-module-scss-module__ANyPxW__achievement",
  "achievementIcon": "page-module-scss-module__ANyPxW__achievementIcon",
  "achievementLabel": "page-module-scss-module__ANyPxW__achievementLabel",
  "achievementLocked": "page-module-scss-module__ANyPxW__achievementLocked",
  "achievementUnlocked": "page-module-scss-module__ANyPxW__achievementUnlocked",
  "achievementsGrid": "page-module-scss-module__ANyPxW__achievementsGrid",
  "achievementsRow": "page-module-scss-module__ANyPxW__achievementsRow",
  "actionBtn": "page-module-scss-module__ANyPxW__actionBtn",
  "actionBtnDanger": "page-module-scss-module__ANyPxW__actionBtnDanger",
  "avatarBig": "page-module-scss-module__ANyPxW__avatarBig",
  "avatarFileInput": "page-module-scss-module__ANyPxW__avatarFileInput",
  "avatarModal": "page-module-scss-module__ANyPxW__avatarModal",
  "avatarModalActions": "page-module-scss-module__ANyPxW__avatarModalActions",
  "avatarModalBackdrop": "page-module-scss-module__ANyPxW__avatarModalBackdrop",
  "avatarModalClose": "page-module-scss-module__ANyPxW__avatarModalClose",
  "avatarModalPreview": "page-module-scss-module__ANyPxW__avatarModalPreview",
  "avatarModalPreviewImage": "page-module-scss-module__ANyPxW__avatarModalPreviewImage",
  "avatarModalPrimary": "page-module-scss-module__ANyPxW__avatarModalPrimary",
  "avatarModalSecondary": "page-module-scss-module__ANyPxW__avatarModalSecondary",
  "avatarModalText": "page-module-scss-module__ANyPxW__avatarModalText",
  "avatarModalTitle": "page-module-scss-module__ANyPxW__avatarModalTitle",
  "badge": "page-module-scss-module__ANyPxW__badge",
  "badgeAmber": "page-module-scss-module__ANyPxW__badgeAmber",
  "badgeGreen": "page-module-scss-module__ANyPxW__badgeGreen",
  "cropImage": "page-module-scss-module__ANyPxW__cropImage",
  "cropRect": "page-module-scss-module__ANyPxW__cropRect",
  "cropRectHint": "page-module-scss-module__ANyPxW__cropRectHint",
  "cropResizeHandle": "page-module-scss-module__ANyPxW__cropResizeHandle",
  "cropWorkspace": "page-module-scss-module__ANyPxW__cropWorkspace",
  "dangerItem": "page-module-scss-module__ANyPxW__dangerItem",
  "fieldGroup": "page-module-scss-module__ANyPxW__fieldGroup",
  "fontActive": "page-module-scss-module__ANyPxW__fontActive",
  "fontBtn": "page-module-scss-module__ANyPxW__fontBtn",
  "fontSizeRow": "page-module-scss-module__ANyPxW__fontSizeRow",
  "formCard": "page-module-scss-module__ANyPxW__formCard",
  "formFooter": "page-module-scss-module__ANyPxW__formFooter",
  "formGrid": "page-module-scss-module__ANyPxW__formGrid",
  "heroAvatarButton": "page-module-scss-module__ANyPxW__heroAvatarButton",
  "heroAvatarImage": "page-module-scss-module__ANyPxW__heroAvatarImage",
  "heroAvatarPencil": "page-module-scss-module__ANyPxW__heroAvatarPencil",
  "heroBadges": "page-module-scss-module__ANyPxW__heroBadges",
  "heroInfo": "page-module-scss-module__ANyPxW__heroInfo",
  "heroMeta": "page-module-scss-module__ANyPxW__heroMeta",
  "heroName": "page-module-scss-module__ANyPxW__heroName",
  "heroStat": "page-module-scss-module__ANyPxW__heroStat",
  "heroStatLbl": "page-module-scss-module__ANyPxW__heroStatLbl",
  "heroStatVal": "page-module-scss-module__ANyPxW__heroStatVal",
  "heroStats": "page-module-scss-module__ANyPxW__heroStats",
  "input": "page-module-scss-module__ANyPxW__input",
  "label": "page-module-scss-module__ANyPxW__label",
  "linkedBadge": "page-module-scss-module__ANyPxW__linkedBadge",
  "linkedBadgeOff": "page-module-scss-module__ANyPxW__linkedBadgeOff",
  "linkedBadgeOn": "page-module-scss-module__ANyPxW__linkedBadgeOn",
  "linkedIntro": "page-module-scss-module__ANyPxW__linkedIntro",
  "linkedMeta": "page-module-scss-module__ANyPxW__linkedMeta",
  "linkedRow": "page-module-scss-module__ANyPxW__linkedRow",
  "linkedTitle": "page-module-scss-module__ANyPxW__linkedTitle",
  "page": "page-module-scss-module__ANyPxW__page",
  "pageHeader": "page-module-scss-module__ANyPxW__pageHeader",
  "pageSub": "page-module-scss-module__ANyPxW__pageSub",
  "pageTitle": "page-module-scss-module__ANyPxW__pageTitle",
  "profileHero": "page-module-scss-module__ANyPxW__profileHero",
  "saveBtn": "page-module-scss-module__ANyPxW__saveBtn",
  "savedMsg": "page-module-scss-module__ANyPxW__savedMsg",
  "sectionLabel": "page-module-scss-module__ANyPxW__sectionLabel",
  "slideUp": "page-module-scss-module__ANyPxW__slideUp",
  "tabActive": "page-module-scss-module__ANyPxW__tabActive",
  "tabBtn": "page-module-scss-module__ANyPxW__tabBtn",
  "tabsRow": "page-module-scss-module__ANyPxW__tabsRow",
  "textarea": "page-module-scss-module__ANyPxW__textarea",
  "themeActive": "page-module-scss-module__ANyPxW__themeActive",
  "themeAuto": "page-module-scss-module__ANyPxW__themeAuto",
  "themeBar": "page-module-scss-module__ANyPxW__themeBar",
  "themeCard": "page-module-scss-module__ANyPxW__themeCard",
  "themeContent": "page-module-scss-module__ANyPxW__themeContent",
  "themeDark": "page-module-scss-module__ANyPxW__themeDark",
  "themeGrid": "page-module-scss-module__ANyPxW__themeGrid",
  "themeLabel": "page-module-scss-module__ANyPxW__themeLabel",
  "themeLight": "page-module-scss-module__ANyPxW__themeLight",
  "themePreview": "page-module-scss-module__ANyPxW__themePreview",
  "toggle": "page-module-scss-module__ANyPxW__toggle",
  "toggleDesc": "page-module-scss-module__ANyPxW__toggleDesc",
  "toggleInfo": "page-module-scss-module__ANyPxW__toggleInfo",
  "toggleLabel": "page-module-scss-module__ANyPxW__toggleLabel",
  "toggleOn": "page-module-scss-module__ANyPxW__toggleOn",
  "toggleRow": "page-module-scss-module__ANyPxW__toggleRow",
  "toggleThumb": "page-module-scss-module__ANyPxW__toggleThumb",
});
}),
"[project]/apps/web/src/components/profile/ProfileAchievementsPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileAchievementsPanel",
    ()=>ProfileAchievementsPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AchievementCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$profile$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/profile/page.module.scss [app-ssr] (css module)");
'use client';
;
;
;
function ProfileAchievementsPanel({ achievements }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SurfaceCard"], {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$profile$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].formCard,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$profile$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementsGrid,
            children: achievements.map((achievement)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AchievementCard"], {
                    icon: achievement.icon,
                    label: achievement.label,
                    description: achievement.description,
                    unlocked: achievement.unlocked,
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$profile$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievement,
                    unlockedClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$profile$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementUnlocked,
                    lockedClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$profile$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementLocked,
                    iconClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$profile$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementIcon,
                    labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$profile$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementLabel,
                    tooltipClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$profile$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].achievementTooltip
                }, achievement.label, false, {
                    fileName: "[project]/apps/web/src/components/profile/ProfileAchievementsPanel.tsx",
                    lineNumber: 23,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/profile/ProfileAchievementsPanel.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/profile/ProfileAchievementsPanel.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/app/students/[studentId]/page.module.scss [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "achievement": "page-module-scss-module__QRAcbW__achievement",
  "achievementIcon": "page-module-scss-module__QRAcbW__achievementIcon",
  "achievementLabel": "page-module-scss-module__QRAcbW__achievementLabel",
  "achievementLocked": "page-module-scss-module__QRAcbW__achievementLocked",
  "achievementUnlocked": "page-module-scss-module__QRAcbW__achievementUnlocked",
  "achievementsRow": "page-module-scss-module__QRAcbW__achievementsRow",
  "actions": "page-module-scss-module__QRAcbW__actions",
  "avatarBig": "page-module-scss-module__QRAcbW__avatarBig",
  "badge": "page-module-scss-module__QRAcbW__badge",
  "badgeAmber": "page-module-scss-module__QRAcbW__badgeAmber",
  "badgeGreen": "page-module-scss-module__QRAcbW__badgeGreen",
  "calendarEmpty": "page-module-scss-module__QRAcbW__calendarEmpty",
  "calendarItem": "page-module-scss-module__QRAcbW__calendarItem",
  "calendarItemActive": "page-module-scss-module__QRAcbW__calendarItemActive",
  "calendarItemTop": "page-module-scss-module__QRAcbW__calendarItemTop",
  "calendarList": "page-module-scss-module__QRAcbW__calendarList",
  "calendarMeta": "page-module-scss-module__QRAcbW__calendarMeta",
  "calendarTitle": "page-module-scss-module__QRAcbW__calendarTitle",
  "colorControlsRow": "page-module-scss-module__QRAcbW__colorControlsRow",
  "colorControlsRowCompact": "page-module-scss-module__QRAcbW__colorControlsRowCompact",
  "colorHueSlider": "page-module-scss-module__QRAcbW__colorHueSlider",
  "colorPalette": "page-module-scss-module__QRAcbW__colorPalette",
  "colorPaletteDisabled": "page-module-scss-module__QRAcbW__colorPaletteDisabled",
  "colorPicker": "page-module-scss-module__QRAcbW__colorPicker",
  "colorPickerThumb": "page-module-scss-module__QRAcbW__colorPickerThumb",
  "colorPickerToggleBtn": "page-module-scss-module__QRAcbW__colorPickerToggleBtn",
  "colorSwatch": "page-module-scss-module__QRAcbW__colorSwatch",
  "fieldGroup": "page-module-scss-module__QRAcbW__fieldGroup",
  "formGrid": "page-module-scss-module__QRAcbW__formGrid",
  "headerCard": "page-module-scss-module__QRAcbW__headerCard",
  "headerMeta": "page-module-scss-module__QRAcbW__headerMeta",
  "headerName": "page-module-scss-module__QRAcbW__headerName",
  "heroBadges": "page-module-scss-module__QRAcbW__heroBadges",
  "heroInfo": "page-module-scss-module__QRAcbW__heroInfo",
  "heroStat": "page-module-scss-module__QRAcbW__heroStat",
  "heroStatLbl": "page-module-scss-module__QRAcbW__heroStatLbl",
  "heroStatVal": "page-module-scss-module__QRAcbW__heroStatVal",
  "heroStats": "page-module-scss-module__QRAcbW__heroStats",
  "input": "page-module-scss-module__QRAcbW__input",
  "label": "page-module-scss-module__QRAcbW__label",
  "lessonDetailBadges": "page-module-scss-module__QRAcbW__lessonDetailBadges",
  "lessonDetailHeader": "page-module-scss-module__QRAcbW__lessonDetailHeader",
  "lessonDetailPane": "page-module-scss-module__QRAcbW__lessonDetailPane",
  "lessonDetailTitle": "page-module-scss-module__QRAcbW__lessonDetailTitle",
  "lessonFileRow": "page-module-scss-module__QRAcbW__lessonFileRow",
  "lessonFilesList": "page-module-scss-module__QRAcbW__lessonFilesList",
  "lessonFilters": "page-module-scss-module__QRAcbW__lessonFilters",
  "lessonListPane": "page-module-scss-module__QRAcbW__lessonListPane",
  "lessonMetaGrid": "page-module-scss-module__QRAcbW__lessonMetaGrid",
  "lessonMetaItem": "page-module-scss-module__QRAcbW__lessonMetaItem",
  "lessonSearch": "page-module-scss-module__QRAcbW__lessonSearch",
  "lessonSearchWrap": "page-module-scss-module__QRAcbW__lessonSearchWrap",
  "lessonSection": "page-module-scss-module__QRAcbW__lessonSection",
  "lessonSectionBody": "page-module-scss-module__QRAcbW__lessonSectionBody",
  "lessonSectionTitle": "page-module-scss-module__QRAcbW__lessonSectionTitle",
  "lessonStatusCancelled": "page-module-scss-module__QRAcbW__lessonStatusCancelled",
  "lessonStatusCompleted": "page-module-scss-module__QRAcbW__lessonStatusCompleted",
  "lessonStatusPlanned": "page-module-scss-module__QRAcbW__lessonStatusPlanned",
  "lessonStatusTag": "page-module-scss-module__QRAcbW__lessonStatusTag",
  "lessonTypeBadge": "page-module-scss-module__QRAcbW__lessonTypeBadge",
  "lessonWorkspace": "page-module-scss-module__QRAcbW__lessonWorkspace",
  "notes": "page-module-scss-module__QRAcbW__notes",
  "page": "page-module-scss-module__QRAcbW__page",
  "pageHeader": "page-module-scss-module__QRAcbW__pageHeader",
  "pageSub": "page-module-scss-module__QRAcbW__pageSub",
  "pageTitle": "page-module-scss-module__QRAcbW__pageTitle",
  "primaryBtn": "page-module-scss-module__QRAcbW__primaryBtn",
  "slideUp": "page-module-scss-module__QRAcbW__slideUp",
  "studentVocabQuickAdd": "page-module-scss-module__QRAcbW__studentVocabQuickAdd",
  "studentVocabQuickAddBtn": "page-module-scss-module__QRAcbW__studentVocabQuickAddBtn",
  "studentVocabQuickAddField": "page-module-scss-module__QRAcbW__studentVocabQuickAddField",
  "studentVocabQuickAddGrid": "page-module-scss-module__QRAcbW__studentVocabQuickAddGrid",
  "studentVocabQuickAddInput": "page-module-scss-module__QRAcbW__studentVocabQuickAddInput",
  "studentVocabQuickAddLabel": "page-module-scss-module__QRAcbW__studentVocabQuickAddLabel",
  "studentVocabQuickAddTitle": "page-module-scss-module__QRAcbW__studentVocabQuickAddTitle",
  "tabActive": "page-module-scss-module__QRAcbW__tabActive",
  "tabBtn": "page-module-scss-module__QRAcbW__tabBtn",
  "tabCard": "page-module-scss-module__QRAcbW__tabCard",
  "tabContent": "page-module-scss-module__QRAcbW__tabContent",
  "tabsRow": "page-module-scss-module__QRAcbW__tabsRow",
  "vocabTabIntro": "page-module-scss-module__QRAcbW__vocabTabIntro",
});
}),
"[project]/apps/web/src/app/students/[studentId]/sections.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StudentAchievementsTab",
    ()=>StudentAchievementsTab,
    "StudentCalendarTab",
    ()=>StudentCalendarTab,
    "StudentProfileTab",
    ()=>StudentProfileTab,
    "StudentScheduleTab",
    ()=>StudentScheduleTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/lessonTime.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AdaptiveSelect.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/EmptyStateCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileAchievementsPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/profile/ProfileAchievementsPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pipette$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pipette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pipette.js [app-ssr] (ecmascript) <export default as Pipette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2d$3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock-3.js [app-ssr] (ecmascript) <export default as Clock3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquareText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square-text.js [app-ssr] (ecmascript) <export default as MessageSquareText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-round.js [app-ssr] (ecmascript) <export default as UserRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/students/[studentId]/page.module.scss [app-ssr] (css module)");
'use client';
;
;
;
;
;
;
;
;
;
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
function clampHue(value) {
    const mod = value % 360;
    return mod < 0 ? mod + 360 : mod;
}
function hexToHsl(hex) {
    const normalized = hex.trim().replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
    const r = parseInt(normalized.slice(0, 2), 16) / 255;
    const g = parseInt(normalized.slice(2, 4), 16) / 255;
    const b = parseInt(normalized.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const l = (max + min) / 2;
    if (delta === 0) return {
        h: 0,
        s: 0,
        l
    };
    const s = delta / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (max === r) h = (g - b) / delta % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    return {
        h: clampHue(h * 60),
        s: clamp01(s),
        l: clamp01(l)
    };
}
function hslToHex(color) {
    const h = clampHue(color.h);
    const s = clamp01(color.s);
    const l = clamp01(color.l);
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(h / 60 % 2 - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (h < 60) [r, g, b] = [
        c,
        x,
        0
    ];
    else if (h < 120) [r, g, b] = [
        x,
        c,
        0
    ];
    else if (h < 180) [r, g, b] = [
        0,
        c,
        x
    ];
    else if (h < 240) [r, g, b] = [
        0,
        x,
        c
    ];
    else if (h < 300) [r, g, b] = [
        x,
        0,
        c
    ];
    else [r, g, b] = [
        c,
        0,
        x
    ];
    const toHex = (v)=>Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function CalendarColorPicker({ value, disabled, onChange }) {
    const [hsl, setHsl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>hexToHsl(value) ?? {
            h: 210,
            s: 0.54,
            l: 0.5
        });
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const paletteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const applyHsl = (next)=>{
        setHsl(next);
        onChange(hslToHex(next));
    };
    const updateFromPalettePointer = (clientX, clientY)=>{
        const rect = paletteRef.current?.getBoundingClientRect();
        if (!rect) return;
        const s = clamp01((clientX - rect.left) / rect.width);
        const l = clamp01(1 - (clientY - rect.top) / rect.height);
        applyHsl({
            ...hsl,
            s,
            l
        });
    };
    const startPaletteDrag = (event)=>{
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromPalettePointer(event.clientX, event.clientY);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].colorPicker,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].colorControlsRowCompact,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].colorSwatch,
                        style: {
                            backgroundColor: hslToHex(hsl)
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                        value: value,
                        readOnly: disabled,
                        placeholder: "#3b82c4",
                        onChange: (e)=>{
                            const next = e.target.value;
                            onChange(next);
                            const parsed = hexToHsl(next);
                            if (parsed) setHsl(parsed);
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].colorPickerToggleBtn,
                        disabled: disabled,
                        onClick: ()=>setOpen((v)=>!v),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pipette$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pipette$3e$__["Pipette"], {
                            size: 16,
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                            lineNumber: 139,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this),
            open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: paletteRef,
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].colorPalette} ${disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].colorPaletteDisabled : ''}`,
                        style: {
                            backgroundColor: `hsl(${hsl.h} 100% 50%)`
                        },
                        onPointerDown: startPaletteDrag,
                        onPointerMove: (event)=>{
                            if (!disabled && event.buttons === 1) updateFromPalettePointer(event.clientX, event.clientY);
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].colorPickerThumb,
                            style: {
                                left: `${hsl.s * 100}%`,
                                top: `${(1 - hsl.l) * 100}%`
                            }
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                            lineNumber: 153,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].colorControlsRow,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "range",
                            min: 0,
                            max: 360,
                            value: Math.round(hsl.h),
                            disabled: disabled,
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].colorHueSlider,
                            onChange: (event)=>applyHsl({
                                    ...hsl,
                                    h: Number(event.target.value)
                                })
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                            lineNumber: 159,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
        lineNumber: 122,
        columnNumber: 5
    }, this);
}
function StudentProfileTab({ student, onChange, canEdit, viewerRole, onSave }) {
    const isStudentViewer = viewerRole === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id;
    const isTeacherViewer = viewerRole === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SurfaceCard"], {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabCard,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].formGrid,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Full name"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 194,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: student.fullName,
                                readOnly: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        fullName: e.target.value
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 195,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Email"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 198,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: student.email,
                                readOnly: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        email: e.target.value
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 199,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 197,
                        columnNumber: 9
                    }, this),
                    !isStudentViewer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Level"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 203,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: String(student.proficiencyLevelId),
                                readOnly: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        proficiencyLevelId: Number(e.target.value)
                                    }),
                                children: Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"]).map((key)=>{
                                    const L = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"][key];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: L.id,
                                        children: [
                                            L.code,
                                            " — ",
                                            L.label
                                        ]
                                    }, L.id, true, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 218,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 204,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 202,
                        columnNumber: 11
                    }, this) : null,
                    !isTeacherViewer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Phone"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 228,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: student.phone,
                                readOnly: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        phone: e.target.value
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 229,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 227,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Timezone"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 233,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: String(student.timezoneId),
                                readOnly: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        timezoneId: Number(e.target.value)
                                    }),
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE_ID_LIST"].map((id)=>{
                                    const tz = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTimeZoneById"])(id);
                                    return tz ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: id,
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTimeZoneOptionLabel"])(tz)
                                    }, id, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 245,
                                        columnNumber: 17
                                    }, this) : null;
                                })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this),
                    !isStudentViewer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Status"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 254,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: String(student.statusId),
                                readOnly: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        statusId: Number(e.target.value)
                                    }),
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ACCOUNT_STATUS_ID_LIST"].map((id)=>{
                                    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserAccountStatusById"])(id);
                                    return s ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: id,
                                        children: s.name
                                    }, id, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 269,
                                        columnNumber: 19
                                    }, this) : null;
                                })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 255,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 253,
                        columnNumber: 11
                    }, this) : null,
                    !isStudentViewer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Schedule type"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 279,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: String(student.scheduleType),
                                readOnly: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        scheduleType: e.target.value === 'true'
                                    }),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "true",
                                        children: "Fixed schedule"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 288,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "false",
                                        children: "Flexible schedule"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 289,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 280,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 278,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Calendar color (HEX)"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 294,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarColorPicker, {
                                value: student.color ?? '',
                                disabled: !canEdit,
                                onChange: (nextHex)=>onChange({
                                        ...student,
                                        color: nextHex
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 295,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 293,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actions,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].primaryBtn,
                    disabled: !canEdit,
                    onClick: onSave,
                    children: "Save student data"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                    lineNumber: 303,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 302,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
        lineNumber: 191,
        columnNumber: 5
    }, this);
}
function StudentCalendarTab({ lessons }) {
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const viewerIana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getIanaForTimeZoneId"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].timezoneId);
    const sortedLessons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...lessons
        ].sort((a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lessonStartUtc"])(a).getTime() - (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lessonStartUtc"])(b).getTime()), [
        lessons
    ]);
    const filteredLessons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>sortedLessons.filter((lesson)=>{
            const normalizedQuery = query.trim().toLowerCase();
            const queryMatch = normalizedQuery.length === 0 || lesson.title.toLowerCase().includes(normalizedQuery) || lesson.teacherName.toLowerCase().includes(normalizedQuery);
            const statusMatch = statusFilter === 'all' || lesson.statusId === statusFilter;
            return queryMatch && statusMatch;
        }), [
        query,
        sortedLessons,
        statusFilter
    ]);
    const [selectedLessonId, setSelectedLessonId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(sortedLessons[0]?.id);
    if (!lessons.length) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
            title: "No lessons yet",
            description: "Plan a lesson in the Schedule tab."
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
            lineNumber: 341,
            columnNumber: 12
        }, this);
    }
    const selectedLesson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>filteredLessons.find((lesson)=>lesson.id === selectedLessonId) ?? filteredLessons[0] ?? null, [
        filteredLessons,
        selectedLessonId
    ]);
    const statusLabel = (statusId)=>{
        if (statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id) return 'Planned';
        if (statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id) return 'Completed';
        return 'Cancelled';
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonWorkspace,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SurfaceCard"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonListPane,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonFilters,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSearchWrap,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 15
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 360,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSearch,
                                        value: query,
                                        onChange: (event)=>setQuery(event.target.value),
                                        placeholder: "Search lessons or teacher..."
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 361,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 359,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: statusFilter,
                                onChange: (event)=>{
                                    const next = event.target.value;
                                    setStatusFilter(next === 'all' ? 'all' : Number(next));
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: "All statuses"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 378,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id,
                                        children: "Planned"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 379,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id,
                                        children: "Completed"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 380,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id,
                                        children: "Cancelled"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 381,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 368,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 358,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calendarList,
                        children: [
                            filteredLessons.map((lesson)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calendarItem} ${selectedLesson?.id === lesson.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calendarItemActive : ''}`,
                                    onClick: ()=>setSelectedLessonId(lesson.id),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calendarItemTop,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calendarTitle,
                                                    children: lesson.title
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                                    lineNumber: 394,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonStatusTag} ${lesson.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonStatusPlanned : ''} ${lesson.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonStatusCompleted : ''} ${lesson.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonStatusCancelled : ''}`,
                                                    children: statusLabel(lesson.statusId)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                                    lineNumber: 395,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 393,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calendarMeta,
                                            children: [
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lessonDateKeyInZone"])(lesson, viewerIana),
                                                " · ",
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lessonStartTimeInZone"])(lesson, viewerIana),
                                                " ·",
                                                ' ',
                                                lesson.duration,
                                                " min"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 401,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calendarMeta,
                                            children: lesson.teacherName
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 405,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, lesson.id, true, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 387,
                                    columnNumber: 13
                                }, this)),
                            filteredLessons.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calendarEmpty,
                                children: "No lessons match your filters."
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 409,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 385,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 357,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SurfaceCard"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonDetailPane,
                children: selectedLesson ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonDetailHeader,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonDetailTitle,
                                    children: selectedLesson.title
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 418,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonDetailBadges,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonStatusTag} ${selectedLesson.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonStatusPlanned : ''} ${selectedLesson.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonStatusCompleted : ''} ${selectedLesson.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonStatusCancelled : ''}`,
                                        children: statusLabel(selectedLesson.statusId)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 420,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 419,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                            lineNumber: 417,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonMetaGrid,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonMetaItem,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                            size: 15
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 430,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lessonDateKeyInZone"])(selectedLesson, viewerIana)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 431,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 429,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonMetaItem,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2d$3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock3$3e$__["Clock3"], {
                                            size: 15
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 434,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lessonStartTimeInZone"])(selectedLesson, viewerIana),
                                                " –",
                                                ' ',
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lessonEndTimeInZone"])(selectedLesson, viewerIana)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 435,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 433,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonMetaItem,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"], {
                                            size: 15
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 441,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: selectedLesson.teacherName
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 442,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 440,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                            lineNumber: 428,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSection,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSectionTitle,
                                    children: "Lesson plan"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 447,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSectionBody,
                                    children: selectedLesson.lessonPlan || selectedLesson.notes || 'No lesson plan yet.'
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 448,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                            lineNumber: 446,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSection,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSectionTitle,
                                    children: "Materials"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 454,
                                    columnNumber: 15
                                }, this),
                                selectedLesson.materials && selectedLesson.materials.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonFilesList,
                                    children: selectedLesson.materials.map((material)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonFileRow,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                                    lineNumber: 459,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: material.text || `${material.kind} material`
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                                    lineNumber: 460,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, material.id, true, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 458,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 456,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSectionBody,
                                    children: "No materials added."
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 465,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                            lineNumber: 453,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSection,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSectionTitle,
                                    children: "Homework"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 470,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSectionBody,
                                    children: selectedLesson.homework?.text || 'No homework assigned.'
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 471,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                            lineNumber: 469,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSection,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSectionTitle,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquareText$3e$__["MessageSquareText"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 476,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Student response"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                            lineNumber: 477,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 475,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonSectionBody,
                                    children: selectedLesson.studentResponse?.text || 'No student response yet.'
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                    lineNumber: 479,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                            lineNumber: 474,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calendarEmpty,
                    children: "Pick a lesson from the list to see details."
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                    lineNumber: 485,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 414,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
        lineNumber: 356,
        columnNumber: 5
    }, this);
}
function StudentScheduleTab({ canEdit, date, setDate, time, setTime, recurrence, setRecurrence, comment, setComment, onPlan }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SurfaceCard"], {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabCard,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].formGrid,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Date"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 519,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                                type: "date",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: date,
                                readOnly: !canEdit,
                                onChange: (e)=>setDate(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 520,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 518,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Time"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 523,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                                type: "time",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: time,
                                readOnly: !canEdit,
                                onChange: (e)=>setTime(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 524,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 522,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                                children: "Recurrence"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 527,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                                value: recurrence,
                                readOnly: !canEdit,
                                onChange: (e)=>setRecurrence(e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "none",
                                        children: "No repeat"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 529,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "weekly",
                                        children: "Weekly"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 530,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "monthly",
                                        children: "Monthly"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 531,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 528,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 526,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 517,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                        children: "Comment"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 536,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                        as: "textarea",
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].notes}`,
                        value: comment,
                        readOnly: !canEdit,
                        onChange: (e)=>setComment(e.target.value),
                        rows: 3
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 537,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 535,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actions,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].primaryBtn,
                    disabled: !canEdit || !date || !time,
                    onClick: onPlan,
                    children: "Plan lesson"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                    lineNumber: 540,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 539,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
        lineNumber: 516,
        columnNumber: 5
    }, this);
}
function StudentAchievementsTab({ achievements }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileAchievementsPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProfileAchievementsPanel"], {
        achievements: achievements
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
        lineNumber: 553,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/mocks/domains/vocabulary.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VOCABULARY_WORD_STATUS_IDS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"],
    "createVocabularyWord",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createVocabularyWord"],
    "getVocabularyWordById",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVocabularyWordById"],
    "legacyStatusToVocabularyStatusId",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["legacyStatusToVocabularyStatusId"],
    "mockVocabularyWords",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["mockVocabularyWords"],
    "vocabularyStatusIdToLegacy",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["vocabularyStatusIdToLegacy"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
}),
"[project]/apps/web/src/app/vocabulary/page.module.scss [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "addWordCard": "page-module-scss-module__wiHsxG__addWordCard",
  "addWordInner": "page-module-scss-module__wiHsxG__addWordInner",
  "amber": "page-module-scss-module__wiHsxG__amber",
  "blue": "page-module-scss-module__wiHsxG__blue",
  "catActive": "page-module-scss-module__wiHsxG__catActive",
  "catBtn": "page-module-scss-module__wiHsxG__catBtn",
  "catFilters": "page-module-scss-module__wiHsxG__catFilters",
  "empty": "page-module-scss-module__wiHsxG__empty",
  "fadeIn": "page-module-scss-module__wiHsxG__fadeIn",
  "fcBack": "page-module-scss-module__wiHsxG__fcBack",
  "fcBar": "page-module-scss-module__wiHsxG__fcBar",
  "fcBarFill": "page-module-scss-module__wiHsxG__fcBarFill",
  "fcBtn": "page-module-scss-module__wiHsxG__fcBtn",
  "fcBtnAmber": "page-module-scss-module__wiHsxG__fcBtnAmber",
  "fcBtnGreen": "page-module-scss-module__wiHsxG__fcBtnGreen",
  "fcBtnRed": "page-module-scss-module__wiHsxG__fcBtnRed",
  "fcButtons": "page-module-scss-module__wiHsxG__fcButtons",
  "fcCategory": "page-module-scss-module__wiHsxG__fcCategory",
  "fcComplete": "page-module-scss-module__wiHsxG__fcComplete",
  "fcCompleteIcon": "page-module-scss-module__wiHsxG__fcCompleteIcon",
  "fcCompleteSub": "page-module-scss-module__wiHsxG__fcCompleteSub",
  "fcCompleteTitle": "page-module-scss-module__wiHsxG__fcCompleteTitle",
  "fcDef": "page-module-scss-module__wiHsxG__fcDef",
  "fcExample": "page-module-scss-module__wiHsxG__fcExample",
  "fcFront": "page-module-scss-module__wiHsxG__fcFront",
  "fcHint": "page-module-scss-module__wiHsxG__fcHint",
  "fcNav": "page-module-scss-module__wiHsxG__fcNav",
  "fcNavBtn": "page-module-scss-module__wiHsxG__fcNavBtn",
  "fcPhonetic": "page-module-scss-module__wiHsxG__fcPhonetic",
  "fcProgress": "page-module-scss-module__wiHsxG__fcProgress",
  "fcRestartBtn": "page-module-scss-module__wiHsxG__fcRestartBtn",
  "fcWord": "page-module-scss-module__wiHsxG__fcWord",
  "filters": "page-module-scss-module__wiHsxG__filters",
  "flashcard": "page-module-scss-module__wiHsxG__flashcard",
  "flashcardMode": "page-module-scss-module__wiHsxG__flashcardMode",
  "green": "page-module-scss-module__wiHsxG__green",
  "modeActive": "page-module-scss-module__wiHsxG__modeActive",
  "modeBtn": "page-module-scss-module__wiHsxG__modeBtn",
  "modeToggle": "page-module-scss-module__wiHsxG__modeToggle",
  "page": "page-module-scss-module__wiHsxG__page",
  "pageHeader": "page-module-scss-module__wiHsxG__pageHeader",
  "pageSub": "page-module-scss-module__wiHsxG__pageSub",
  "pageTitle": "page-module-scss-module__wiHsxG__pageTitle",
  "searchInput": "page-module-scss-module__wiHsxG__searchInput",
  "slideUp": "page-module-scss-module__wiHsxG__slideUp",
  "statAmber": "page-module-scss-module__wiHsxG__statAmber",
  "statBlue": "page-module-scss-module__wiHsxG__statBlue",
  "statChip": "page-module-scss-module__wiHsxG__statChip",
  "statGreen": "page-module-scss-module__wiHsxG__statGreen",
  "statLbl": "page-module-scss-module__wiHsxG__statLbl",
  "statNum": "page-module-scss-module__wiHsxG__statNum",
  "statsRow": "page-module-scss-module__wiHsxG__statsRow",
  "wcActions": "page-module-scss-module__wiHsxG__wcActions",
  "wcBtn": "page-module-scss-module__wiHsxG__wcBtn",
  "wcBtnActive": "page-module-scss-module__wiHsxG__wcBtnActive",
  "wcDef": "page-module-scss-module__wiHsxG__wcDef",
  "wcExample": "page-module-scss-module__wiHsxG__wcExample",
  "wcPhonetic": "page-module-scss-module__wiHsxG__wcPhonetic",
  "wcPos": "page-module-scss-module__wiHsxG__wcPos",
  "wcStatus": "page-module-scss-module__wiHsxG__wcStatus",
  "wcTop": "page-module-scss-module__wiHsxG__wcTop",
  "wcWord": "page-module-scss-module__wiHsxG__wcWord",
  "wordCard": "page-module-scss-module__wiHsxG__wordCard",
  "wordGrid": "page-module-scss-module__wiHsxG__wordGrid",
});
}),
"[project]/apps/web/src/app/vocabulary/sections.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VocabularyFlashcardSection",
    ()=>VocabularyFlashcardSection,
    "VocabularyListSection",
    ()=>VocabularyListSection,
    "VocabularyModeToggle",
    ()=>VocabularyModeToggle,
    "VocabularyStatsRow",
    ()=>VocabularyStatsRow,
    "VocabularyWordCards",
    ()=>VocabularyWordCards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$party$2d$popper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PartyPopper$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/party-popper.js [app-ssr] (ecmascript) <export default as PartyPopper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/EmptyStateCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProgressHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ProgressHeader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SegmentedControl.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/StatTile.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/vocabulary/page.module.scss [app-ssr] (css module)");
'use client';
;
;
;
;
function VocabularyModeToggle({ mode, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SegmentedControl"], {
        value: mode,
        onValueChange: onChange,
        ariaLabel: "Vocabulary mode",
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].modeToggle,
        optionClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].modeBtn,
        activeOptionClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].modeActive,
        options: [
            {
                value: 'list',
                label: 'List',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    width: "16",
                    height: "16",
                    viewBox: "0 0 16 16",
                    fill: "none",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M2 4h12M2 8h12M2 12h8",
                        stroke: "currentColor",
                        strokeWidth: "1.5",
                        strokeLinecap: "round"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 31,
                        columnNumber: 15
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                    lineNumber: 30,
                    columnNumber: 13
                }, void 0)
            },
            {
                value: 'flashcard',
                label: 'Flashcards',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    width: "16",
                    height: "16",
                    viewBox: "0 0 16 16",
                    fill: "none",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: "2",
                            y: "4",
                            width: "12",
                            height: "9",
                            rx: "1.5",
                            stroke: "currentColor",
                            strokeWidth: "1.5"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                            lineNumber: 40,
                            columnNumber: 15
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1",
                            stroke: "currentColor",
                            strokeWidth: "1.5"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                            lineNumber: 41,
                            columnNumber: 15
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                    lineNumber: 39,
                    columnNumber: 13
                }, void 0)
            }
        ]
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
function VocabularyStatsRow({ total, stats, onFilter }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statsRow,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatTile"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statChip,
                interactive: true,
                onClick: ()=>onFilter('all'),
                label: "Total",
                labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statLbl,
                value: total,
                valueClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statNum
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatTile"], {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statChip} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statBlue}`,
                interactive: true,
                onClick: ()=>onFilter('new'),
                label: "New",
                labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statLbl,
                value: stats.new,
                valueClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statNum
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatTile"], {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statChip} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statAmber}`,
                interactive: true,
                onClick: ()=>onFilter('learning'),
                label: "Learning",
                labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statLbl,
                value: stats.learning,
                valueClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statNum
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatTile"], {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statChip} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statGreen}`,
                interactive: true,
                onClick: ()=>onFilter('known'),
                label: "Known",
                labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statLbl,
                value: stats.known,
                valueClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statNum
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
function VocabularyWordCards({ items, onSetStatus, canSetKnown, animationIndexOffset = 0 }) {
    const statusOptions = canSetKnown ? [
        'new',
        'learning',
        'known'
    ] : [
        'new',
        'learning'
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: items.map(({ row, word, status }, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wordCard,
                style: {
                    animationDelay: `${(animationIndexOffset + i) * 0.03}s`
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcTop,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcWord,
                                        children: word.word
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 95,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcPhonetic,
                                        children: word.phonetic
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 96,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcStatus} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"][status === 'new' ? 'blue' : status === 'learning' ? 'amber' : 'green']}`,
                                variant: status === 'new' ? 'blue' : status === 'learning' ? 'amber' : 'green',
                                children: status
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 93,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcPos,
                        children: word.pos
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcDef,
                        children: word.definition
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcExample,
                        children: [
                            '"',
                            word.example,
                            '"'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcActions,
                        children: statusOptions.map((nextStatus)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcBtn} ${status === nextStatus ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wcBtnActive : ''}`,
                                onClick: ()=>onSetStatus(row.id, nextStatus),
                                children: nextStatus
                            }, nextStatus, false, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 110,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this)
                ]
            }, row.id, true, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 88,
                columnNumber: 9
            }, this))
    }, void 0, false);
}
function VocabularyListSection({ search, setSearch, categories, filter, setFilter, filtered, onSetStatus, canSetKnown, prependSlot, totalSourceCount }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].filters,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].searchInput,
                        placeholder: "Search words...",
                        value: search,
                        onChange: (e)=>setSearch(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SegmentedControl"], {
                        value: filter,
                        onValueChange: setFilter,
                        ariaLabel: "Vocabulary categories",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].catFilters,
                        optionClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].catBtn,
                        activeOptionClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].catActive,
                        options: categories.map((category)=>({
                                value: category,
                                label: category.charAt(0).toUpperCase() + category.slice(1)
                            }))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 153,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wordGrid,
                children: [
                    prependSlot,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(VocabularyWordCards, {
                        items: filtered,
                        onSetStatus: onSetStatus,
                        canSetKnown: canSetKnown,
                        animationIndexOffset: prependSlot ? 1 : 0
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this),
            filtered.length === 0 && totalSourceCount > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].empty,
                title: "No words match filters",
                description: "Try a different filter or clear search."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 179,
                columnNumber: 9
            }, this) : null,
            filtered.length === 0 && totalSourceCount === 0 && !prependSlot ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].empty,
                title: "No words found",
                description: "Try a different filter."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 186,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true);
}
function VocabularyFlashcardSection({ cardIndex, total, currentItem, flipped, setFlipped, markStatus, setCardIndex, canSetKnown }) {
    const word = currentItem?.word;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `container container--form ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flashcardMode}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProgressHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProgressHeader"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcProgress,
                barClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcBar,
                fillClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcBarFill,
                current: cardIndex + 1,
                total: total
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 214,
                columnNumber: 7
            }, this),
            word ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flashcard} ${flipped ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flipped : ''}`,
                        onClick: ()=>setFlipped(!flipped),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcFront,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcHint,
                                        children: "Click to reveal definition"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 219,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcWord,
                                        children: word.word
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 220,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcPhonetic,
                                        children: word.phonetic
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 221,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcCategory,
                                        children: [
                                            word.category,
                                            " · ",
                                            word.pos
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 222,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 218,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcBack,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcDef,
                                        children: word.definition
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 227,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcExample,
                                        children: [
                                            '"',
                                            word.example,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 228,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 226,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 217,
                        columnNumber: 11
                    }, this),
                    flipped ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcButtons,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcBtn} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcBtnRed}`,
                                onClick: ()=>markStatus('new'),
                                children: "Still learning"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 233,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcBtn} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcBtnAmber}`,
                                onClick: ()=>markStatus('learning'),
                                children: "Almost got it"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 234,
                                columnNumber: 15
                            }, this),
                            canSetKnown ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcBtn} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcBtnGreen}`,
                                onClick: ()=>markStatus('known'),
                                children: [
                                    "Know it! ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 237,
                                        columnNumber: 28
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 236,
                                columnNumber: 17
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 232,
                        columnNumber: 13
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcNav,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcNavBtn,
                                onClick: ()=>{
                                    setCardIndex((i)=>Math.max(0, i - 1));
                                    setFlipped(false);
                                },
                                disabled: cardIndex === 0,
                                children: "← Prev"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 243,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcNavBtn,
                                onClick: ()=>{
                                    setCardIndex((i)=>Math.min(total - 1, i + 1));
                                    setFlipped(false);
                                },
                                disabled: cardIndex === total - 1,
                                children: [
                                    "Next ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                        lineNumber: 245,
                                        columnNumber: 20
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                                lineNumber: 244,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 242,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcComplete,
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcCompleteIcon,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$party$2d$popper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PartyPopper$3e$__["PartyPopper"], {
                        size: 22
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                        lineNumber: 250,
                        columnNumber: 100
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                    lineNumber: 250,
                    columnNumber: 61
                }, void 0),
                title: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcCompleteTitle,
                    children: "All done!"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                    lineNumber: 250,
                    columnNumber: 140
                }, void 0),
                description: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fcCompleteSub,
                    children: [
                        "You reviewed all ",
                        total,
                        " words. Great work!"
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                    lineNumber: 250,
                    columnNumber: 210
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
                lineNumber: 250,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/vocabulary/sections.tsx",
        lineNumber: 213,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StudentVocabularyTab",
    ()=>StudentVocabularyTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$sections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/vocabulary/sections.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/students/[studentId]/page.module.scss [app-ssr] (css module)");
'use client';
;
;
;
;
;
;
function StudentVocabularyTab({ studentUserId }) {
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["joinProfileVocabulary"])(studentUserId));
    const refresh = ()=>setItems((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["joinProfileVocabulary"])(studentUserId));
    const [draftWord, setDraftWord] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [draftDef, setDraftDef] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('All');
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const categories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const unique = [
            ...new Set(items.map(({ word })=>word.category))
        ].sort((a, b)=>a.localeCompare(b));
        return [
            'All',
            ...unique
        ];
    }, [
        items
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!categories.includes(filter)) setFilter('All');
    }, [
        categories,
        filter
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>items.filter(({ word, status })=>{
            const catOk = filter === 'All' || word.category === filter;
            const statusOk = statusFilter === 'all' || status === statusFilter;
            const searchOk = !search || word.word.toLowerCase().includes(search.toLowerCase()) || word.definition.toLowerCase().includes(search.toLowerCase());
            return catOk && statusOk && searchOk;
        }), [
        items,
        filter,
        statusFilter,
        search
    ]);
    const stats = {
        new: items.filter(({ status })=>status === 'new').length,
        learning: items.filter(({ status })=>status === 'learning').length,
        known: items.filter(({ status })=>status === 'known').length
    };
    const onSetStatus = (entryId, status)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateProfileVocabularyStatus"])(entryId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["legacyStatusToVocabularyStatusId"])(status));
        refresh();
    };
    const onAddWord = ()=>{
        const lemma = draftWord.trim();
        if (!lemma) return;
        const vid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createVocabularyWord"])({
            word: lemma,
            definition: draftDef.trim() || '—',
            example: '',
            phonetic: '',
            pos: '—',
            category: 'general'
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addProfileVocabularyEntry"])({
            userId: studentUserId,
            vocabularyId: vid,
            status: 'new'
        });
        setDraftWord('');
        setDraftDef('');
        refresh();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SurfaceCard"], {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabCard,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].vocabTabIntro,
                children: [
                    "Manage this student's vocabulary progress. Staff can set any status, including ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "known"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                        lineNumber: 86,
                        columnNumber: 93
                    }, this),
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAdd,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAddTitle,
                        children: "Add word"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAddGrid,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAddField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAddLabel,
                                        htmlFor: `student-vocab-word-${studentUserId}`,
                                        children: "Word"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                                        lineNumber: 92,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                                        id: `student-vocab-word-${studentUserId}`,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAddInput,
                                        value: draftWord,
                                        placeholder: "e.g. articulate",
                                        onChange: (e)=>setDraftWord(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                                        lineNumber: 95,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAddField,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAddLabel,
                                        htmlFor: `student-vocab-def-${studentUserId}`,
                                        children: "Definition (optional)"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                                        lineNumber: 104,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                                        id: `student-vocab-def-${studentUserId}`,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAddInput,
                                        value: draftDef,
                                        placeholder: "Short gloss",
                                        onChange: (e)=>setDraftDef(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                                        lineNumber: 107,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].studentVocabQuickAddBtn,
                        disabled: !draftWord.trim(),
                        onClick: onAddWord,
                        children: "Add to student vocabulary"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$sections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VocabularyStatsRow"], {
                total: items.length,
                stats: stats,
                onFilter: setStatusFilter
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$sections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VocabularyListSection"], {
                search: search,
                setSearch: setSearch,
                categories: categories,
                filter: filter,
                setFilter: setFilter,
                filtered: filtered,
                onSetStatus: onSetStatus,
                canSetKnown: true,
                totalSourceCount: items.length
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx",
        lineNumber: 84,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/app/students/[studentId]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StudentDetailsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/EmptyStateCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/profile/ProfileViewShell.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/adapters/lessonCalendarAdapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/achievements.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/lessons.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$avatar$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/avatar.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/students/[studentId]/sections.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$StudentVocabularyTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/students/[studentId]/StudentVocabularyTab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$badge$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BadgeCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/badge-check.js [app-ssr] (ecmascript) <export default as BadgeCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/brain.js [app-ssr] (ecmascript) <export default as Brain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-check.js [app-ssr] (ecmascript) <export default as CalendarCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.js [app-ssr] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gem$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gem.js [app-ssr] (ecmascript) <export default as Gem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-ssr] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquareText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square-text.js [app-ssr] (ecmascript) <export default as MessageSquareText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic.js [app-ssr] (ecmascript) <export default as Mic>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mountain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mountain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mountain.js [app-ssr] (ecmascript) <export default as Mountain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rocket.js [app-ssr] (ecmascript) <export default as Rocket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-ssr] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-ssr] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
function StudentDetailsPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const rawStudentId = params?.studentId;
    const studentIdNum = rawStudentId !== undefined && rawStudentId !== '' ? Number(rawStudentId) : Number.NaN;
    const student = Number.isFinite(studentIdNum) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProfileByUserId"])(studentIdNum) : undefined;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canView"])('dashboard', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role)) return null;
    const allowedRoles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTeacherAdminOrSuper"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role);
    if (!allowedRoles) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
            title: "No permission",
            description: "Students section is not available for your role."
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 59,
            columnNumber: 12
        }, this);
    }
    if (!student) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
            title: "Student not found",
            description: "Check the student link and try again."
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 62,
            columnNumber: 12
        }, this);
    }
    const canManage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canManageProfile"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"], student);
    if (!canManage) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
            title: "No permission",
            description: "You cannot manage this student."
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 66,
            columnNumber: 12
        }, this);
    }
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('profile');
    const [studentForm, setStudentForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(student);
    const [lessons, setLessons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStudentScheduledLessons"])(student.id));
    const [date, setDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [time, setTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [recurrence, setRecurrence] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('none');
    const [comment, setComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const pageSubtitle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>'Manage student profile, calendar and scheduling', []);
    const achievementIconMap = {
        sparkles: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 79,
            columnNumber: 15
        }, this),
        'graduation-cap': /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 80,
            columnNumber: 23
        }, this),
        'calendar-check': /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarCheck$3e$__["CalendarCheck"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 81,
            columnNumber: 23
        }, this),
        flame: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 82,
            columnNumber: 12
        }, this),
        'book-open': /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 83,
            columnNumber: 18
        }, this),
        brain: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__["Brain"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 84,
            columnNumber: 12
        }, this),
        'messages-square': /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquareText$3e$__["MessageSquareText"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 85,
            columnNumber: 24
        }, this),
        mic: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 86,
            columnNumber: 10
        }, this),
        target: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 87,
            columnNumber: 13
        }, this),
        'badge-check': /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$badge$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BadgeCheck$3e$__["BadgeCheck"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 88,
            columnNumber: 20
        }, this),
        star: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 89,
            columnNumber: 11
        }, this),
        rocket: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__["Rocket"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 90,
            columnNumber: 13
        }, this),
        trophy: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 91,
            columnNumber: 13
        }, this),
        crown: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 92,
            columnNumber: 12
        }, this),
        mountain: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mountain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mountain$3e$__["Mountain"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 93,
            columnNumber: 15
        }, this),
        gem: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gem$3e$__["Gem"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 94,
            columnNumber: 10
        }, this)
    };
    const studentStats = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockProfileStatsByUserId"].find((entry)=>entry.userId === studentForm.userId)?.stats ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emptyProfileStats"];
    const studentAchievements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProfileAchievements"])(studentStats).map((achievement)=>({
            icon: achievementIconMap[achievement.icon],
            label: achievement.label,
            description: achievement.description,
            unlocked: achievement.unlocked
        }));
    const recentUnlockedAchievements = studentAchievements.filter((achievement)=>achievement.unlocked).slice(-10);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProfileViewShell"], {
        title: "Student Details",
        subtitle: pageSubtitle,
        avatar: (()=>{
            const u = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"].find((row)=>row.id === studentForm.id);
            return u?.avatar.url ? // eslint-disable-next-line @next/next/no-img-element
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: u.avatar.url,
                alt: "",
                width: 72,
                height: 72,
                style: {
                    borderRadius: '50%',
                    objectFit: 'cover'
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
                lineNumber: 117,
                columnNumber: 11
            }, void 0) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$avatar$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAvatarFallbackInitials"])(studentForm.fullName);
        })(),
        name: studentForm.fullName,
        meta: `Teacher: ${studentForm.teacherName}`,
        badges: [
            {
                label: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProficiencyLevelById"])(studentForm.proficiencyLevelId)?.code ?? '—'
            },
            {
                label: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserAccountStatusById"])(studentForm.statusId)?.name ?? '—',
                variant: studentForm.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ACCOUNT_STATUS"].active.id ? 'green' : 'amber'
            },
            {
                label: studentForm.scheduleType ? 'Fixed schedule' : 'Flexible schedule'
            }
        ],
        stats: [
            {
                value: studentForm.wordsLearned,
                label: 'Words'
            },
            {
                value: studentForm.lessonsCompleted,
                label: 'Lessons'
            },
            {
                value: studentForm.streakDays,
                label: 'Streak'
            }
        ],
        achievements: recentUnlockedAchievements,
        tab: tab,
        onTabChange: setTab,
        tabs: [
            {
                value: 'profile',
                label: 'Profile',
                panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StudentProfileTab"], {
                    student: studentForm,
                    onChange: setStudentForm,
                    canEdit: canManage,
                    viewerRole: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role,
                    onSave: ()=>{}
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
                    lineNumber: 145,
                    columnNumber: 15
                }, void 0)
            },
            {
                value: 'calendar',
                label: 'Calendar',
                panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StudentCalendarTab"], {
                    lessons: lessons
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
                    lineNumber: 157,
                    columnNumber: 20
                }, void 0)
            },
            {
                value: 'schedule',
                label: 'Schedule',
                panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StudentScheduleTab"], {
                    canEdit: canManage,
                    date: date,
                    setDate: setDate,
                    time: time,
                    setTime: setTime,
                    recurrence: recurrence,
                    setRecurrence: setRecurrence,
                    comment: comment,
                    setComment: setComment,
                    onPlan: ()=>{
                        const newLesson = {
                            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nextLessonEntityId"])([
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockScheduledLessons"],
                                ...lessons
                            ]),
                            title: comment.trim() ? comment.trim().slice(0, 80) : 'Scheduled lesson',
                            date,
                            startTime: time,
                            endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateEndTime"])(time, 55),
                            duration: 55,
                            timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].timezoneId,
                            teacherId: studentForm.teacherId,
                            teacherName: studentForm.teacherName,
                            studentId: studentForm.id,
                            studentName: studentForm.fullName,
                            statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id,
                            credited: false,
                            notes: comment,
                            order: 1,
                            recurrence,
                            weeklyDays: recurrence === 'weekly' ? [] : []
                        };
                        setLessons((prev)=>[
                                ...prev,
                                newLesson
                            ]);
                        setDate('');
                        setTime('');
                        setRecurrence('none');
                        setComment('');
                        setTab('calendar');
                    }
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
                    lineNumber: 163,
                    columnNumber: 15
                }, void 0)
            },
            {
                value: 'achievements',
                label: 'Achievements',
                panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StudentAchievementsTab"], {
                    achievements: studentAchievements
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
                    lineNumber: 206,
                    columnNumber: 20
                }, void 0)
            },
            {
                value: 'vocabulary',
                label: 'Vocabulary',
                panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$StudentVocabularyTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StudentVocabularyTab"], {
                    studentUserId: studentForm.userId
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
                    lineNumber: 212,
                    columnNumber: 15
                }, void 0)
            }
        ]
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_3ed103da._.js.map
(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web/src/components/profile/ProfileViewShell.module.scss [app-client] (css module)", ((__turbopack_context__) => {

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
"[project]/apps/web/src/components/profile/ProfileViewShell.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileViewShell",
    ()=>ProfileViewShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AchievementCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/PageHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProfileHero$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ProfileHero.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tabs.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/profile/ProfileViewShell.module.scss [app-client] (css module)");
'use client';
;
;
;
function ProfileViewShell({ title, subtitle, avatar, name, meta, badges, stats, achievements, tab, onTabChange, tabs }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].page} container container--page`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PageHeader"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageHeader,
                titleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageTitle,
                subtitleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageSub,
                title: title,
                subtitle: subtitle
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/profile/ProfileViewShell.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProfileHero$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProfileHero"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileHero,
                avatarClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].avatarBig,
                infoClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroInfo,
                nameClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroName,
                metaClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroMeta,
                badgesClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroBadges,
                statsClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroStats,
                statClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroStat,
                statValueClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroStatVal,
                statLabelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroStatLbl,
                avatar: avatar,
                name: name,
                meta: meta,
                badges: badges.map((badge, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badge,
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementsRow,
                children: achievements.map((achievement)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AchievementCard"], {
                        icon: achievement.icon,
                        label: achievement.label,
                        unlocked: achievement.unlocked,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievement,
                        unlockedClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementUnlocked,
                        lockedClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementLocked,
                        iconClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementIcon,
                        labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementLabel,
                        tooltipClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementTooltip,
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tabs"], {
                value: tab,
                onValueChange: onTabChange,
                ariaLabel: "Profile tabs",
                listClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabsRow,
                triggerClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabBtn,
                activeTriggerClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabActive,
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
_c = ProfileViewShell;
var _c;
__turbopack_context__.k.register(_c, "ProfileViewShell");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/calendar/adapters/lessonCalendarAdapter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateEndTime",
    ()=>calculateEndTime,
    "fromLessonFormState",
    ()=>fromLessonFormState,
    "toLessonFormState",
    ()=>toLessonFormState
]);
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
        type: lesson.type,
        date: lesson.date,
        startTime: lesson.startTime,
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
        status: lesson.status,
        cancelReason: lesson.cancelReason,
        credited: lesson.credited,
        recurrence: lesson.recurrence,
        weeklyDays: lesson.weeklyDays ?? [],
        applyToSeries: false
    };
}
function fromLessonFormState(form, existing) {
    return {
        id: existing?.id ?? `lesson-cal-${Date.now()}`,
        lessonId: existing?.lessonId,
        title: form.title,
        type: form.type,
        date: form.date,
        startTime: form.startTime,
        endTime: calculateEndTime(form.startTime, form.duration),
        duration: form.duration,
        teacherId: form.teacherId,
        teacherName: form.teacherName,
        studentId: form.studentId,
        studentName: form.studentName,
        status: form.status,
        cancelReason: form.status === 'cancelled' ? form.cancelReason : undefined,
        credited: form.credited,
        notes: form.notes,
        lessonPlan: form.lessonPlan,
        materials: form.materials,
        homework: {
            text: form.homeworkText,
            files: form.homeworkFiles
        },
        studentResponse: {
            text: form.studentResponseText,
            files: form.studentResponseFiles,
            status: form.studentResponseStatus
        },
        order: existing?.order ?? 1,
        recurrence: form.recurrence,
        weeklyDays: form.recurrence === 'weekly' ? form.weeklyDays : [],
        seriesId: existing?.seriesId ?? (form.recurrence !== 'none' ? `series-${Date.now()}` : undefined)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/app/students/[studentId]/page.module.scss [app-client] (css module)", ((__turbopack_context__) => {

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
  "calendarItem": "page-module-scss-module__QRAcbW__calendarItem",
  "calendarList": "page-module-scss-module__QRAcbW__calendarList",
  "calendarMeta": "page-module-scss-module__QRAcbW__calendarMeta",
  "calendarTitle": "page-module-scss-module__QRAcbW__calendarTitle",
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
  "notes": "page-module-scss-module__QRAcbW__notes",
  "page": "page-module-scss-module__QRAcbW__page",
  "pageHeader": "page-module-scss-module__QRAcbW__pageHeader",
  "pageSub": "page-module-scss-module__QRAcbW__pageSub",
  "pageTitle": "page-module-scss-module__QRAcbW__pageTitle",
  "primaryBtn": "page-module-scss-module__QRAcbW__primaryBtn",
  "slideUp": "page-module-scss-module__QRAcbW__slideUp",
  "tabActive": "page-module-scss-module__QRAcbW__tabActive",
  "tabBtn": "page-module-scss-module__QRAcbW__tabBtn",
  "tabCard": "page-module-scss-module__QRAcbW__tabCard",
  "tabContent": "page-module-scss-module__QRAcbW__tabContent",
  "tabsRow": "page-module-scss-module__QRAcbW__tabsRow",
});
}),
"[project]/apps/web/src/app/students/[studentId]/sections.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AchievementCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/EmptyStateCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/students/[studentId]/page.module.scss [app-client] (css module)");
'use client';
;
;
;
function StudentProfileTab({ student, onChange, canEdit, viewerRole, onSave }) {
    const isStudentViewer = viewerRole === 'student';
    const isTeacherViewer = viewerRole === 'teacher';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SurfaceCard"], {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabCard,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].formGrid,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Full name"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: student.fullName,
                                disabled: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        fullName: e.target.value
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 28,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Email"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 31,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: student.email,
                                disabled: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        email: e.target.value
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    !isStudentViewer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Level"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 36,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                as: "select",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: student.level,
                                disabled: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        level: e.target.value
                                    }),
                                children: [
                                    'A1',
                                    'A2',
                                    'B1',
                                    'B2',
                                    'C1',
                                    'C2'
                                ].map((level)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: level,
                                        children: level
                                    }, level, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 39,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 37,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this) : null,
                    !isTeacherViewer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Phone"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 48,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: student.phone,
                                disabled: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        phone: e.target.value
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Timezone"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                as: "select",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: student.timezone,
                                disabled: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        timezone: e.target.value
                                    }),
                                children: [
                                    'Europe/Kyiv',
                                    'Europe/Warsaw',
                                    'Europe/London',
                                    'America/New_York'
                                ].map((timezone)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: timezone,
                                        children: timezone
                                    }, timezone, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 56,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 54,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    !isStudentViewer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Status"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 64,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                as: "select",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: student.status,
                                disabled: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        status: e.target.value
                                    }),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "active",
                                        children: "active"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 66,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "paused",
                                        children: "paused"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 67,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this) : null,
                    !isStudentViewer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Schedule type"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                as: "select",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: student.scheduleType,
                                disabled: !canEdit,
                                onChange: (e)=>onChange({
                                        ...student,
                                        scheduleType: e.target.value
                                    }),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "fixed",
                                        children: "fixed"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 81,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "flexible",
                                        children: "flexible"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 82,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Calendar color (HEX)"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                type: "text",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: student.calendarColor ?? '',
                                disabled: !canEdit,
                                placeholder: "#3b82c4",
                                onChange: (e)=>onChange({
                                        ...student,
                                        calendarColor: e.target.value
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        children: "Notes"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        as: "textarea",
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notes}`,
                        value: student.notes,
                        disabled: !canEdit,
                        onChange: (e)=>onChange({
                                ...student,
                                notes: e.target.value
                            }),
                        rows: 4
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actions,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].primaryBtn,
                    disabled: !canEdit,
                    onClick: onSave,
                    children: "Save student data"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = StudentProfileTab;
function StudentCalendarTab({ lessons }) {
    if (!lessons.length) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
            title: "No lessons yet",
            description: "Plan a lesson in the Schedule tab."
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
            lineNumber: 113,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calendarList,
        children: lessons.map((lesson)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SurfaceCard"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calendarItem,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calendarTitle,
                        children: lesson.title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 120,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calendarMeta,
                        children: [
                            lesson.date,
                            " · ",
                            lesson.startTime,
                            " · ",
                            lesson.teacherName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this)
                ]
            }, lesson.id, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 119,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
        lineNumber: 117,
        columnNumber: 5
    }, this);
}
_c1 = StudentCalendarTab;
function StudentScheduleTab({ canEdit, lessonType, setLessonType, date, setDate, time, setTime, recurrence, setRecurrence, comment, setComment, onPlan }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SurfaceCard"], {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabCard,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].formGrid,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Lesson type"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 161,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                as: "select",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: lessonType,
                                disabled: !canEdit,
                                onChange: (e)=>setLessonType(e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "grammar",
                                        children: "Grammar"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 163,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "vocabulary",
                                        children: "Vocabulary"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 164,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "speaking",
                                        children: "Speaking"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 165,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "listening",
                                        children: "Listening"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 166,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 162,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Date"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 170,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                type: "date",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: date,
                                disabled: !canEdit,
                                onChange: (e)=>setDate(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Time"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 174,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                type: "time",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: time,
                                disabled: !canEdit,
                                onChange: (e)=>setTime(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 175,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                children: "Recurrence"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                as: "select",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                value: recurrence,
                                disabled: !canEdit,
                                onChange: (e)=>setRecurrence(e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "none",
                                        children: "No repeat"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 180,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "weekly",
                                        children: "Weekly"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 181,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "monthly",
                                        children: "Monthly"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                        lineNumber: 182,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        children: "Comment"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        as: "textarea",
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notes}`,
                        value: comment,
                        disabled: !canEdit,
                        onChange: (e)=>setComment(e.target.value),
                        rows: 3
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 186,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actions,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].primaryBtn,
                    disabled: !canEdit || !date || !time,
                    onClick: onPlan,
                    children: "Plan lesson"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                    lineNumber: 191,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                lineNumber: 190,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
        lineNumber: 158,
        columnNumber: 5
    }, this);
}
_c2 = StudentScheduleTab;
function StudentAchievementsTab({ achievements }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SurfaceCard"], {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabCard,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementsGrid,
            children: achievements.map((achievement)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AchievementCard"], {
                    icon: achievement.icon,
                    label: achievement.label,
                    description: achievement.description,
                    unlocked: achievement.unlocked,
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievement,
                    unlockedClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementUnlocked,
                    lockedClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementLocked,
                    iconClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementIcon,
                    labelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].achievementLabel
                }, achievement.label, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
                    lineNumber: 208,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
            lineNumber: 206,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/sections.tsx",
        lineNumber: 205,
        columnNumber: 5
    }, this);
}
_c3 = StudentAchievementsTab;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "StudentProfileTab");
__turbopack_context__.k.register(_c1, "StudentCalendarTab");
__turbopack_context__.k.register(_c2, "StudentScheduleTab");
__turbopack_context__.k.register(_c3, "StudentAchievementsTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/app/students/[studentId]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StudentDetailsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/EmptyStateCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/profile/ProfileViewShell.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/adapters/lessonCalendarAdapter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$students$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/students.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/calendar.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/students/[studentId]/sections.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function StudentDetailsPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const studentId = params?.studentId;
    const student = studentId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$students$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStudentById"])(studentId) : undefined;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canView"])('dashboard', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role)) return null;
    const allowedRoles = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'teacher' || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'admin' || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'super-admin';
    if (!allowedRoles) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
            title: "No permission",
            description: "Students section is not available for your role."
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 29,
            columnNumber: 12
        }, this);
    }
    if (!student) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
            title: "Student not found",
            description: "Check the student link and try again."
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 32,
            columnNumber: 12
        }, this);
    }
    const canManage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$students$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canManageStudent"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"], student);
    if (!canManage) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyStateCard"], {
            title: "No permission",
            description: "You cannot manage this student."
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 36,
            columnNumber: 12
        }, this);
    }
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('profile');
    const [studentForm, setStudentForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(student);
    const [lessons, setLessons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStudentScheduledLessons"])(student.id));
    const [lessonType, setLessonType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('grammar');
    const [date, setDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [time, setTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [recurrence, setRecurrence] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('none');
    const [comment, setComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const pageSubtitle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "StudentDetailsPage.useMemo[pageSubtitle]": ()=>`Manage student profile, calendar and scheduling · ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role}`
    }["StudentDetailsPage.useMemo[pageSubtitle]"], []);
    const achievementIcons = {
        flame: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 53,
            columnNumber: 12
        }, this),
        book: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 54,
            columnNumber: 11
        }, this),
        target: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 55,
            columnNumber: 13
        }, this),
        trophy: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 56,
            columnNumber: 13
        }, this),
        message: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
            size: 20
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
            lineNumber: 57,
            columnNumber: 14
        }, this)
    };
    const achievementMetaById = {
        'streak-3-days': {
            icon: 'flame',
            label: '3-Day Streak',
            description: 'Keep a 3-day learning streak.'
        },
        'streak-7-days': {
            icon: 'flame',
            label: '7-Day Streak',
            description: 'Keep a 7-day learning streak.'
        },
        'streak-14-days': {
            icon: 'flame',
            label: '14-Day Streak',
            description: 'Keep a 14-day learning streak.'
        },
        'words-100': {
            icon: 'book',
            label: '100 Words',
            description: 'Learn 100 words.'
        },
        'words-500': {
            icon: 'book',
            label: '500 Words',
            description: 'Learn 500 words.'
        },
        'quiz-first': {
            icon: 'target',
            label: 'First Quiz',
            description: 'Complete the first quiz.'
        },
        'quiz-perfect-1': {
            icon: 'trophy',
            label: 'Perfect Quiz',
            description: 'Get one perfect quiz score.'
        },
        'speaking-starter': {
            icon: 'message',
            label: 'Speaking Starter',
            description: 'Complete your first speaking session.'
        }
    };
    const studentAchievements = studentForm.achievements.map((achievement)=>({
            icon: achievementIcons[achievementMetaById[achievement.achievementId]?.icon ?? 'target'],
            label: achievementMetaById[achievement.achievementId]?.label ?? achievement.achievementId,
            description: achievementMetaById[achievement.achievementId]?.description ?? 'Achievement details are not specified yet.',
            unlocked: achievement.unlocked
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$profile$2f$ProfileViewShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProfileViewShell"], {
        title: "Student Details",
        subtitle: pageSubtitle,
        avatar: studentForm.fullName.split(' ').map((part)=>part[0]).join('').slice(0, 2),
        name: studentForm.fullName,
        meta: `Teacher: ${studentForm.teacherName}`,
        badges: [
            {
                label: studentForm.level
            },
            {
                label: studentForm.status,
                variant: studentForm.status === 'active' ? 'green' : 'amber'
            },
            {
                label: studentForm.scheduleType === 'fixed' ? 'Fixed schedule' : 'Flexible schedule'
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
        achievements: studentAchievements,
        tab: tab,
        onTabChange: setTab,
        tabs: [
            {
                value: 'profile',
                label: 'Profile',
                panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StudentProfileTab"], {
                    student: studentForm,
                    onChange: setStudentForm,
                    canEdit: canManage,
                    viewerRole: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role,
                    onSave: ()=>{}
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
                    lineNumber: 106,
                    columnNumber: 15
                }, void 0)
            },
            {
                value: 'calendar',
                label: 'Calendar',
                panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StudentCalendarTab"], {
                    lessons: lessons
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
                    lineNumber: 118,
                    columnNumber: 20
                }, void 0)
            },
            {
                value: 'schedule',
                label: 'Schedule',
                panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StudentScheduleTab"], {
                    canEdit: canManage,
                    lessonType: lessonType,
                    setLessonType: setLessonType,
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
                            id: `lesson-local-${Date.now()}`,
                            title: `${lessonType.charAt(0).toUpperCase() + lessonType.slice(1)} Lesson`,
                            type: lessonType,
                            date,
                            startTime: time,
                            endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateEndTime"])(time, 55),
                            duration: 55,
                            teacherId: studentForm.teacherId,
                            teacherName: studentForm.teacherName,
                            studentId: studentForm.id,
                            studentName: studentForm.fullName,
                            status: 'planned',
                            credited: false,
                            notes: comment,
                            order: 1,
                            recurrence
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
                    lineNumber: 124,
                    columnNumber: 15
                }, void 0)
            },
            {
                value: 'achievements',
                label: 'Achievements',
                panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$students$2f5b$studentId$5d2f$sections$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StudentAchievementsTab"], {
                    achievements: studentAchievements
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
                    lineNumber: 168,
                    columnNumber: 20
                }, void 0)
            }
        ]
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/students/[studentId]/page.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
_s(StudentDetailsPage, "UKD2FFkXqI9Xr5ellonXKVBWTVo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = StudentDetailsPage;
var _c;
__turbopack_context__.k.register(_c, "StudentDetailsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_web_src_6a05588c._.js.map
(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web/src/features/calendar/adapters/lessonCalendarAdapter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-client] (ecmascript)");
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
        timezoneId: lesson.timezoneId ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
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
        timezoneId: form.timezoneId ?? existing?.timezoneId ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        teacherId: form.teacherId,
        teacherName: form.teacherName,
        studentId: form.studentId,
        studentName: form.studentName,
        statusId: form.statusId,
        cancelReason: form.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? form.cancelReason : undefined,
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/lesson-modal/LessonModal.module.scss [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "fieldGroup": "LessonModal-module-scss-module__6WeJaW__fieldGroup",
  "fieldGroupFull": "LessonModal-module-scss-module__6WeJaW__fieldGroupFull",
  "fieldInput": "LessonModal-module-scss-module__6WeJaW__fieldInput",
  "fieldLabel": "LessonModal-module-scss-module__6WeJaW__fieldLabel",
  "fileButton": "LessonModal-module-scss-module__6WeJaW__fileButton",
  "fileChip": "LessonModal-module-scss-module__6WeJaW__fileChip",
  "fileChipImage": "LessonModal-module-scss-module__6WeJaW__fileChipImage",
  "fileChipRemove": "LessonModal-module-scss-module__6WeJaW__fileChipRemove",
  "fileChipType": "LessonModal-module-scss-module__6WeJaW__fileChipType",
  "fileError": "LessonModal-module-scss-module__6WeJaW__fileError",
  "fileGrid": "LessonModal-module-scss-module__6WeJaW__fileGrid",
  "homeworkCard": "LessonModal-module-scss-module__6WeJaW__homeworkCard",
  "homeworkCheckedBadge": "LessonModal-module-scss-module__6WeJaW__homeworkCheckedBadge",
  "homeworkCheckedRow": "LessonModal-module-scss-module__6WeJaW__homeworkCheckedRow",
  "homeworkReviewBlock": "LessonModal-module-scss-module__6WeJaW__homeworkReviewBlock",
  "homeworkReviewHeading": "LessonModal-module-scss-module__6WeJaW__homeworkReviewHeading",
  "imagePreviewClose": "LessonModal-module-scss-module__6WeJaW__imagePreviewClose",
  "imagePreviewImg": "LessonModal-module-scss-module__6WeJaW__imagePreviewImg",
  "imagePreviewModal": "LessonModal-module-scss-module__6WeJaW__imagePreviewModal",
  "imagePreviewOverlay": "LessonModal-module-scss-module__6WeJaW__imagePreviewOverlay",
  "lessonPlanCard": "LessonModal-module-scss-module__6WeJaW__lessonPlanCard",
  "lessonVocabAddBtn": "LessonModal-module-scss-module__6WeJaW__lessonVocabAddBtn",
  "lessonVocabCard": "LessonModal-module-scss-module__6WeJaW__lessonVocabCard",
  "lessonVocabFormGrid": "LessonModal-module-scss-module__6WeJaW__lessonVocabFormGrid",
  "lessonVocabHint": "LessonModal-module-scss-module__6WeJaW__lessonVocabHint",
  "lessonVocabWordGrid": "LessonModal-module-scss-module__6WeJaW__lessonVocabWordGrid",
  "markHomeworkCheckedBtn": "LessonModal-module-scss-module__6WeJaW__markHomeworkCheckedBtn",
  "materialActionsRow": "LessonModal-module-scss-module__6WeJaW__materialActionsRow",
  "materialEditorCard": "LessonModal-module-scss-module__6WeJaW__materialEditorCard",
  "materialItem": "LessonModal-module-scss-module__6WeJaW__materialItem",
  "materialRemoveBtn": "LessonModal-module-scss-module__6WeJaW__materialRemoveBtn",
  "materialTypeBtn": "LessonModal-module-scss-module__6WeJaW__materialTypeBtn",
  "materialTypeBtnActive": "LessonModal-module-scss-module__6WeJaW__materialTypeBtnActive",
  "materialTypeRow": "LessonModal-module-scss-module__6WeJaW__materialTypeRow",
  "materialsAddBtn": "LessonModal-module-scss-module__6WeJaW__materialsAddBtn",
  "materialsCard": "LessonModal-module-scss-module__6WeJaW__materialsCard",
  "materialsEmpty": "LessonModal-module-scss-module__6WeJaW__materialsEmpty",
  "materialsFileStatus": "LessonModal-module-scss-module__6WeJaW__materialsFileStatus",
  "materialsHeader": "LessonModal-module-scss-module__6WeJaW__materialsHeader",
  "materialsHint": "LessonModal-module-scss-module__6WeJaW__materialsHint",
  "modal": "LessonModal-module-scss-module__6WeJaW__modal",
  "modalActions": "LessonModal-module-scss-module__6WeJaW__modalActions",
  "modalActionsHint": "LessonModal-module-scss-module__6WeJaW__modalActionsHint",
  "modalActionsSingle": "LessonModal-module-scss-module__6WeJaW__modalActionsSingle",
  "modalActionsWithLink": "LessonModal-module-scss-module__6WeJaW__modalActionsWithLink",
  "modalCloseBtn": "LessonModal-module-scss-module__6WeJaW__modalCloseBtn",
  "modalConfirmBtn": "LessonModal-module-scss-module__6WeJaW__modalConfirmBtn",
  "modalContentColumns": "LessonModal-module-scss-module__6WeJaW__modalContentColumns",
  "modalContentLayout": "LessonModal-module-scss-module__6WeJaW__modalContentLayout",
  "modalFieldsGrid": "LessonModal-module-scss-module__6WeJaW__modalFieldsGrid",
  "modalHeader": "LessonModal-module-scss-module__6WeJaW__modalHeader",
  "modalHeaderActions": "LessonModal-module-scss-module__6WeJaW__modalHeaderActions",
  "modalIconBtn": "LessonModal-module-scss-module__6WeJaW__modalIconBtn",
  "modalIconBtnDanger": "LessonModal-module-scss-module__6WeJaW__modalIconBtnDanger",
  "modalLesson": "LessonModal-module-scss-module__6WeJaW__modalLesson",
  "modalLessonLinkBtn": "LessonModal-module-scss-module__6WeJaW__modalLessonLinkBtn",
  "modalOverlay": "LessonModal-module-scss-module__6WeJaW__modalOverlay",
  "modalScroll": "LessonModal-module-scss-module__6WeJaW__modalScroll",
  "modalSectionCard": "LessonModal-module-scss-module__6WeJaW__modalSectionCard",
  "modalSetupGrid": "LessonModal-module-scss-module__6WeJaW__modalSetupGrid",
  "modalSubtitle": "LessonModal-module-scss-module__6WeJaW__modalSubtitle",
  "modalTabsList": "LessonModal-module-scss-module__6WeJaW__modalTabsList",
  "modalTabsPanel": "LessonModal-module-scss-module__6WeJaW__modalTabsPanel",
  "modalTabsRoot": "LessonModal-module-scss-module__6WeJaW__modalTabsRoot",
  "modalTabsTrigger": "LessonModal-module-scss-module__6WeJaW__modalTabsTrigger",
  "modalTabsTriggerActive": "LessonModal-module-scss-module__6WeJaW__modalTabsTriggerActive",
  "modalTitle": "LessonModal-module-scss-module__6WeJaW__modalTitle",
  "saveMaterialBtn": "LessonModal-module-scss-module__6WeJaW__saveMaterialBtn",
  "savedMaterialItem": "LessonModal-module-scss-module__6WeJaW__savedMaterialItem",
  "savedMaterialMeta": "LessonModal-module-scss-module__6WeJaW__savedMaterialMeta",
  "savedMaterialText": "LessonModal-module-scss-module__6WeJaW__savedMaterialText",
  "savedMaterialsList": "LessonModal-module-scss-module__6WeJaW__savedMaterialsList",
  "studentResponseCard": "LessonModal-module-scss-module__6WeJaW__studentResponseCard",
  "weekDayChip": "LessonModal-module-scss-module__6WeJaW__weekDayChip",
  "weekDayChipActive": "LessonModal-module-scss-module__6WeJaW__weekDayChipActive",
  "weekDaysRow": "LessonModal-module-scss-module__6WeJaW__weekDaysRow",
});
}),
"[project]/apps/web/src/features/lesson-modal/ImagePreviewOverlay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImagePreviewOverlay",
    ()=>ImagePreviewOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonModal.module.scss [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
'use client';
;
;
;
;
function ImagePreviewOverlay({ imagePreviewUrl, text, onClose }) {
    if (!imagePreviewUrl) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].imagePreviewOverlay,
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].imagePreviewModal,
            onClick: (event)=>event.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].imagePreviewClose,
                    "aria-label": text.aria.closeImagePreview,
                    onClick: onClose,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/ImagePreviewOverlay.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/lesson-modal/ImagePreviewOverlay.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: imagePreviewUrl,
                    alt: text.imagePreviewAlt,
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].imagePreviewImg
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/lesson-modal/ImagePreviewOverlay.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/lesson-modal/ImagePreviewOverlay.tsx",
            lineNumber: 19,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/lesson-modal/ImagePreviewOverlay.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c = ImagePreviewOverlay;
var _c;
__turbopack_context__.k.register(_c, "ImagePreviewOverlay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/vocabulary.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VOCABULARY_WORD_STATUS_IDS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"],
    "createVocabularyWord",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createVocabularyWord"],
    "getVocabularyWordById",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVocabularyWordById"],
    "legacyStatusToVocabularyStatusId",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["legacyStatusToVocabularyStatusId"],
    "mockVocabularyWords",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["mockVocabularyWords"],
    "vocabularyStatusIdToLegacy",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["vocabularyStatusIdToLegacy"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-client] (ecmascript)");
}),
"[project]/apps/web/src/app/vocabulary/page.module.scss [app-client] (css module)", ((__turbopack_context__) => {

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
"[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LessonContentTab",
    ()=>LessonContentTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-check.js [app-client] (ecmascript) <export default as ClipboardCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file.js [app-client] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-client] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AdaptiveSelect.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/vocabulary/page.module.scss [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonModal.module.scss [app-client] (css module)");
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
const defaultKinds = [
    {
        value: 'text',
        label: 'Text',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"]
    },
    {
        value: 'photo',
        label: 'Photo',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"]
    },
    {
        value: 'test',
        label: 'Test',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__["ClipboardCheck"]
    },
    {
        value: 'file',
        label: 'File',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"]
    },
    {
        value: 'presentation',
        label: 'Presentation',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"]
    }
];
function LessonContentTab({ text, canEdit, role, form, materialKinds = defaultKinds, materialDraft, setMaterialDraft, materialDraftPreviews, setMaterialDraftPreviews, savedMaterialPreviews, setSavedMaterialPreviews, homeworkPreviews, setHomeworkPreviews, studentResponsePreviews, setStudentResponsePreviews, materialsFileStatus, canSaveMaterial, materialsFileInputRef, getFilePlaceholder, setImagePreviewUrl, onChange, onMaterialsFilesSelected, onHomeworkFilesSelected, onStudentResponseFilesSelected, onSaveStudentResponse, hideStudentSaveButton = false, lessonEntityId = null }) {
    _s();
    const canStudentSubmitResponse = role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id && form.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id;
    const canEditStudentResponse = canEdit || canStudentSubmitResponse;
    const studentStatusPlaceholder = role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id && !canStudentSubmitResponse;
    const canSaveStudentResponse = form.studentResponseText.trim().length > 0 || form.studentResponseFiles.length > 0;
    const canEditMaterials = canEdit && role !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id;
    const canEditHomework = canEdit && role !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id;
    const canReview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canReviewHomework"])(role);
    const showHomeworkReviewBlock = canReview || role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id && form.homeworkChecked;
    const [lessonVocabLemma, setLessonVocabLemma] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [lessonVocabDef, setLessonVocabDef] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    /** Fresh read each render so mock profile mutations after “Add word” show updated status. */ const lessonProfileVocabRows = lessonEntityId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProfileVocabularyForUser"])(form.studentId) : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalContentLayout,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroupFull} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalSectionCard} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonPlanCard}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.lessonPlan
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        as: "textarea",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        rows: 4,
                        value: form.lessonPlan,
                        readOnly: !canEdit,
                        onChange: (e)=>onChange({
                                ...form,
                                lessonPlan: e.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalContentColumns,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroupFull} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalSectionCard} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialsCard}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialsHeader,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                                        children: text.fields.materials
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 124,
                                        columnNumber: 13
                                    }, this),
                                    role !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialsHint,
                                        children: text.materialsHint
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 125,
                                        columnNumber: 46
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 123,
                                columnNumber: 11
                            }, this),
                            canEditMaterials ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialTypeRow,
                                        children: materialKinds.map((kind)=>{
                                            const Icon = kind.icon;
                                            const isActive = materialDraft.kind === kind.value;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                type: "button",
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialTypeBtn} ${isActive ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialTypeBtnActive : ''}`,
                                                disabled: !canEditMaterials,
                                                onClick: ()=>setMaterialDraft((prev)=>({
                                                            ...prev,
                                                            kind: kind.value
                                                        })),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                        size: 14
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                        lineNumber: 141,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: kind.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                        lineNumber: 142,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, kind.value, true, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 134,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 129,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialEditorCard,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                as: "textarea",
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                                                rows: 3,
                                                placeholder: text.placeholders.addText,
                                                value: materialDraft.text,
                                                readOnly: !canEditMaterials,
                                                onChange: (e)=>setMaterialDraft((prev)=>({
                                                            ...prev,
                                                            text: e.target.value
                                                        }))
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 148,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                type: "file",
                                                multiple: true,
                                                ref: materialsFileInputRef,
                                                style: {
                                                    display: 'none'
                                                },
                                                disabled: !canEditMaterials,
                                                onChange: (e)=>{
                                                    onMaterialsFilesSelected(e.target.files);
                                                    e.currentTarget.value = '';
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 157,
                                                columnNumber: 17
                                            }, this),
                                            materialsFileStatus ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialsFileStatus,
                                                children: materialsFileStatus
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 168,
                                                columnNumber: 40
                                            }, this) : null,
                                            materialDraft.files.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileGrid,
                                                children: materialDraft.files.map((fileName, fileIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChip} ${materialDraftPreviews[fileIndex] ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipImage : ''}`,
                                                        style: materialDraftPreviews[fileIndex] ? {
                                                            backgroundImage: `url(${materialDraftPreviews[fileIndex]})`
                                                        } : undefined,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                type: "button",
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipRemove,
                                                                "aria-label": text.aria.removeFile,
                                                                onClick: ()=>{
                                                                    setMaterialDraft((prev)=>({
                                                                            ...prev,
                                                                            files: prev.files.filter((_, idx)=>idx !== fileIndex)
                                                                        }));
                                                                    setMaterialDraftPreviews((prev)=>prev.filter((_, idx)=>idx !== fileIndex));
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                    size: 12
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                                    lineNumber: 186,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                                lineNumber: 177,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: fileName
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                                lineNumber: 188,
                                                                columnNumber: 25
                                                            }, this),
                                                            !materialDraftPreviews[fileIndex] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipType,
                                                                children: getFilePlaceholder(fileName)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                                lineNumber: 189,
                                                                columnNumber: 62
                                                            }, this) : null
                                                        ]
                                                    }, `draft-${fileName}-${fileIndex}`, true, {
                                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 170,
                                                columnNumber: 19
                                            }, this) : null,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialActionsRow,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        type: "button",
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileButton,
                                                        disabled: !canEditMaterials,
                                                        onClick: ()=>materialsFileInputRef.current?.click(),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                                lineNumber: 201,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: text.actions.addFile
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                                lineNumber: 202,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                        lineNumber: 195,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        type: "button",
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].saveMaterialBtn,
                                                        disabled: !canEditMaterials || !canSaveMaterial,
                                                        onClick: ()=>{
                                                            if (!canSaveMaterial) return;
                                                            const newMaterialId = `mat-${Date.now()}`;
                                                            onChange({
                                                                ...form,
                                                                materials: [
                                                                    ...form.materials,
                                                                    {
                                                                        id: newMaterialId,
                                                                        kind: materialDraft.kind,
                                                                        text: materialDraft.text.trim(),
                                                                        files: materialDraft.files
                                                                    }
                                                                ]
                                                            });
                                                            setSavedMaterialPreviews((prev)=>({
                                                                    ...prev,
                                                                    [newMaterialId]: materialDraftPreviews
                                                                }));
                                                            setMaterialDraft({
                                                                kind: materialDraft.kind,
                                                                text: '',
                                                                files: []
                                                            });
                                                            setMaterialDraftPreviews([]);
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: text.actions.saveMaterial
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                            lineNumber: 223,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                        lineNumber: 204,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 194,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 147,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true) : null,
                            form.materials.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialsEmpty,
                                children: text.noMaterials
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 230,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].savedMaterialsList,
                                children: form.materials.map((material)=>{
                                    const kindMeta = materialKinds.find((kind)=>kind.value === material.kind);
                                    const KindIcon = kindMeta?.icon ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].savedMaterialItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].savedMaterialMeta,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(KindIcon, {
                                                        size: 14
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                        lineNumber: 239,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: kindMeta?.label ?? text.fallbackMaterialLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                        lineNumber: 240,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 238,
                                                columnNumber: 21
                                            }, this),
                                            canEditMaterials ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                type: "button",
                                                "aria-label": text.aria.removeMaterial,
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].materialRemoveBtn,
                                                onClick: ()=>{
                                                    onChange({
                                                        ...form,
                                                        materials: form.materials.filter((item)=>item.id !== material.id)
                                                    });
                                                    setSavedMaterialPreviews((prev)=>{
                                                        const next = {
                                                            ...prev
                                                        };
                                                        delete next[material.id];
                                                        return next;
                                                    });
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                    lineNumber: 256,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 243,
                                                columnNumber: 23
                                            }, this) : null,
                                            material.text ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].savedMaterialText,
                                                children: material.text
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 259,
                                                columnNumber: 38
                                            }, this) : null,
                                            material.files.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileGrid,
                                                children: material.files.map((fileName, fileIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChip} ${savedMaterialPreviews[material.id]?.[fileIndex] ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipImage : ''}`,
                                                        style: savedMaterialPreviews[material.id]?.[fileIndex] ? {
                                                            backgroundImage: `url(${savedMaterialPreviews[material.id][fileIndex]})`
                                                        } : undefined,
                                                        role: savedMaterialPreviews[material.id]?.[fileIndex] ? 'button' : undefined,
                                                        tabIndex: savedMaterialPreviews[material.id]?.[fileIndex] ? 0 : -1,
                                                        onClick: ()=>{
                                                            const preview = savedMaterialPreviews[material.id]?.[fileIndex];
                                                            if (preview) setImagePreviewUrl(preview);
                                                        },
                                                        onKeyDown: (event)=>{
                                                            if (event.key !== 'Enter' && event.key !== ' ') return;
                                                            const preview = savedMaterialPreviews[material.id]?.[fileIndex];
                                                            if (preview) setImagePreviewUrl(preview);
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: fileName
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                                lineNumber: 279,
                                                                columnNumber: 29
                                                            }, this),
                                                            !savedMaterialPreviews[material.id]?.[fileIndex] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipType,
                                                                children: getFilePlaceholder(fileName)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                                lineNumber: 280,
                                                                columnNumber: 81
                                                            }, this) : null
                                                        ]
                                                    }, `${material.id}-${fileName}-${fileIndex}`, true, {
                                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                        lineNumber: 263,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 261,
                                                columnNumber: 23
                                            }, this) : null
                                        ]
                                    }, material.id, true, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 237,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 232,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroupFull} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalSectionCard} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].homeworkCard}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                                children: text.fields.homework
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 292,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                as: "textarea",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                                rows: 4,
                                value: form.homeworkText,
                                readOnly: !canEditHomework,
                                onChange: (e)=>onChange({
                                        ...form,
                                        homeworkText: e.target.value
                                    })
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 293,
                                columnNumber: 9
                            }, this),
                            canEditHomework ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                as: "file-button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileButton,
                                buttonLabel: text.actions.addFile,
                                multiple: true,
                                disabled: !canEditHomework,
                                onFilesSelected: onHomeworkFilesSelected
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 295,
                                columnNumber: 11
                            }, this) : null,
                            form.homeworkFiles.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileGrid,
                                children: form.homeworkFiles.map((fileName, fileIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChip} ${homeworkPreviews[fileIndex] ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipImage : ''}`,
                                        style: homeworkPreviews[fileIndex] ? {
                                            backgroundImage: `url(${homeworkPreviews[fileIndex]})`
                                        } : undefined,
                                        role: homeworkPreviews[fileIndex] ? 'button' : undefined,
                                        tabIndex: homeworkPreviews[fileIndex] ? 0 : -1,
                                        onClick: ()=>{
                                            const preview = homeworkPreviews[fileIndex];
                                            if (preview) setImagePreviewUrl(preview);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                type: "button",
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipRemove,
                                                "aria-label": text.aria.removeFile,
                                                onClick: (event)=>{
                                                    event.stopPropagation();
                                                    onChange({
                                                        ...form,
                                                        homeworkFiles: form.homeworkFiles.filter((_, idx)=>idx !== fileIndex)
                                                    });
                                                    setHomeworkPreviews((prev)=>prev.filter((_, idx)=>idx !== fileIndex));
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                    lineNumber: 321,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 311,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: fileName
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 323,
                                                columnNumber: 17
                                            }, this),
                                            !homeworkPreviews[fileIndex] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipType,
                                                children: getFilePlaceholder(fileName)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                lineNumber: 324,
                                                columnNumber: 49
                                            }, this) : null
                                        ]
                                    }, `hw-${fileName}-${fileIndex}`, true, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 300,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 298,
                                columnNumber: 11
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 291,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this),
            canEditHomework ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroupFull} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalSectionCard} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonVocabCard}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: "Lesson vocabulary"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 335,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonVocabHint,
                        children: "Adds entries to the shared dictionary and links them to this lesson and the student (status: new)."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 336,
                        columnNumber: 11
                    }, this),
                    form.linkedVocabularyIds.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonVocabWordGrid,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wordGrid,
                            children: form.linkedVocabularyIds.map((vid, i)=>{
                                const w = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVocabularyWordById"])(vid);
                                if (!w) return null;
                                const profileRow = lessonEntityId ? lessonProfileVocabRows.find((r)=>r.vocabularyId === vid && r.lessonId === lessonEntityId) : undefined;
                                const status = profileRow ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["vocabularyStatusIdToLegacy"])(profileRow.statusId) : 'new';
                                const statusTone = status === 'new' ? 'blue' : status === 'learning' ? 'amber' : 'green';
                                const badgeVariant = status === 'new' ? 'blue' : status === 'learning' ? 'amber' : 'green';
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wordCard,
                                    style: {
                                        animationDelay: `${i * 0.03}s`
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wcTop,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wcWord,
                                                            children: w.word
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                            lineNumber: 366,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wcPhonetic,
                                                            children: w.phonetic
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                            lineNumber: 367,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                    lineNumber: 365,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wcStatus} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"][statusTone]}`,
                                                    variant: badgeVariant,
                                                    children: status
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                                    lineNumber: 369,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                            lineNumber: 364,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wcPos,
                                            children: w.pos
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                            lineNumber: 376,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wcDef,
                                            children: w.definition
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                            lineNumber: 377,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$vocabulary$2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wcExample,
                                            children: [
                                                '"',
                                                w.example,
                                                '"'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                            lineNumber: 378,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, vid, true, {
                                    fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                    lineNumber: 359,
                                    columnNumber: 21
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                            lineNumber: 342,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 341,
                        columnNumber: 13
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonVocabFormGrid,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                                        htmlFor: "lesson-vocab-word",
                                        children: "Word"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 387,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                        id: "lesson-vocab-word",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                                        value: lessonVocabLemma,
                                        placeholder: "e.g. articulate",
                                        onChange: (e)=>setLessonVocabLemma(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 390,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 386,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                                        htmlFor: "lesson-vocab-def",
                                        children: "Definition (optional)"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 399,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                        id: "lesson-vocab-def",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                                        value: lessonVocabDef,
                                        placeholder: "Short gloss",
                                        onChange: (e)=>setLessonVocabDef(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 402,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 398,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 385,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonVocabAddBtn,
                        disabled: !lessonVocabLemma.trim(),
                        onClick: ()=>{
                            const lemma = lessonVocabLemma.trim();
                            if (!lemma) return;
                            const vid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createVocabularyWord"])({
                                word: lemma,
                                definition: lessonVocabDef.trim() || '—',
                                example: '',
                                phonetic: '',
                                pos: '—',
                                category: 'general'
                            });
                            onChange({
                                ...form,
                                linkedVocabularyIds: [
                                    ...form.linkedVocabularyIds,
                                    vid
                                ]
                            });
                            setLessonVocabLemma('');
                            setLessonVocabDef('');
                            if (lessonEntityId) {
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureLessonVocabularyForStudent"])({
                                    userId: form.studentId,
                                    lessonId: lessonEntityId,
                                    vocabularyId: vid
                                });
                            }
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                size: 14,
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 438,
                                columnNumber: 13
                            }, this),
                            "Add word to lesson & student"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 411,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                lineNumber: 332,
                columnNumber: 9
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroupFull} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalSectionCard} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].studentResponseCard}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.studentResponse
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 444,
                        columnNumber: 9
                    }, this),
                    studentStatusPlaceholder ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        readOnly: true,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: "",
                        formatValue: ()=>form.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? '—' : 'Opens after the lesson is completed'
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 446,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: form.studentResponseStatus,
                        readOnly: !canEditStudentResponse,
                        onChange: (e)=>onChange({
                                ...form,
                                studentResponseStatus: e.target.value
                            }),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "not_submitted",
                                children: "Not submitted"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 468,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "submitted",
                                children: "Submitted"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 469,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "needs_rework",
                                children: "Reopen (needs rework)"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 470,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "accepted",
                                children: "Accepted"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 471,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 457,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        as: "textarea",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        rows: 4,
                        value: form.studentResponseText,
                        readOnly: !canEditStudentResponse,
                        onChange: (e)=>onChange({
                                ...form,
                                studentResponseText: e.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 474,
                        columnNumber: 9
                    }, this),
                    role !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id || canStudentSubmitResponse ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        as: "file-button",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileButton,
                        buttonLabel: text.actions.addFile,
                        multiple: true,
                        disabled: !canEditStudentResponse,
                        onFilesSelected: onStudentResponseFilesSelected
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 476,
                        columnNumber: 11
                    }, this) : null,
                    form.studentResponseFiles.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileGrid,
                        children: form.studentResponseFiles.map((fileName, fileIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChip} ${studentResponsePreviews[fileIndex] ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipImage : ''}`,
                                style: studentResponsePreviews[fileIndex] ? {
                                    backgroundImage: `url(${studentResponsePreviews[fileIndex]})`
                                } : undefined,
                                role: studentResponsePreviews[fileIndex] ? 'button' : undefined,
                                tabIndex: studentResponsePreviews[fileIndex] ? 0 : -1,
                                onClick: ()=>{
                                    const preview = studentResponsePreviews[fileIndex];
                                    if (preview) setImagePreviewUrl(preview);
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "button",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipRemove,
                                        "aria-label": text.aria.removeFile,
                                        onClick: (event)=>{
                                            event.stopPropagation();
                                            onChange({
                                                ...form,
                                                studentResponseFiles: form.studentResponseFiles.filter((_, idx)=>idx !== fileIndex)
                                            });
                                            setStudentResponsePreviews((prev)=>prev.filter((_, idx)=>idx !== fileIndex));
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 12
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                            lineNumber: 502,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 492,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: fileName
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 504,
                                        columnNumber: 17
                                    }, this),
                                    !studentResponsePreviews[fileIndex] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileChipType,
                                        children: getFilePlaceholder(fileName)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 505,
                                        columnNumber: 56
                                    }, this) : null
                                ]
                            }, `resp-${fileName}-${fileIndex}`, true, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 481,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 479,
                        columnNumber: 11
                    }, this) : null,
                    showHomeworkReviewBlock ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].homeworkReviewBlock,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].homeworkReviewHeading,
                                children: text.fields.homeworkReview
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 512,
                                columnNumber: 13
                            }, this),
                            canReview && !form.homeworkChecked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].markHomeworkCheckedBtn,
                                onClick: ()=>onChange({
                                        ...form,
                                        homeworkChecked: true
                                    }),
                                children: text.actions.markHomeworkChecked
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                lineNumber: 514,
                                columnNumber: 15
                            }, this) : null,
                            form.homeworkChecked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].homeworkCheckedRow,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].homeworkCheckedBadge,
                                            children: text.homeworkCheckedStatus
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                            lineNumber: 525,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 524,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                                        children: text.fields.teacherHomeworkFeedback
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 527,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                        as: "textarea",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                                        rows: 4,
                                        value: form.teacherHomeworkFeedback,
                                        readOnly: !canReview,
                                        onChange: (e)=>onChange({
                                                ...form,
                                                teacherHomeworkFeedback: e.target.value
                                            })
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                                        lineNumber: 528,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 511,
                        columnNumber: 11
                    }, this) : null,
                    role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id && canStudentSubmitResponse && !hideStudentSaveButton ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].saveMaterialBtn,
                        disabled: !canSaveStudentResponse,
                        onClick: onSaveStudentResponse,
                        children: "Save"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                        lineNumber: 543,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
                lineNumber: 443,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
_s(LessonContentTab, "RLFCngfuYnWKbdeyndbj5zba7JQ=");
_c = LessonContentTab;
var _c;
__turbopack_context__.k.register(_c, "LessonContentTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LessonModalHeader",
    ()=>LessonModalHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$unlink$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlink2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/unlink-2.js [app-client] (ecmascript) <export default as Unlink2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonModal.module.scss [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
;
function LessonModalHeader({ mode, role, text, canUnlinkSeries, onUnlinkSeries, canDeleteLesson, onDeleteLesson, onClose }) {
    const isStudent = role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id;
    const canShowUnlink = role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id && canUnlinkSeries;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalHeader,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalTitle,
                        children: isStudent ? 'Lesson' : mode === 'create' ? text.titleCreate : text.titleEdit
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalSubtitle,
                        children: isStudent ? 'View lesson details, homework and your response.' : text.subtitle
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalHeaderActions,
                children: [
                    canShowUnlink ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        "aria-label": text.aria.unlinkSeries,
                        title: text.aria.unlinkSeries,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalIconBtn,
                        onClick: onUnlinkSeries,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$unlink$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlink2$3e$__["Unlink2"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                            lineNumber: 50,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this) : null,
                    canDeleteLesson ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        "aria-label": text.aria.deleteLesson,
                        title: text.aria.deleteLesson,
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalIconBtn} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalIconBtnDanger}`,
                        onClick: onDeleteLesson,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                            lineNumber: 61,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        "aria-label": text.aria.closeModal,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalCloseBtn,
                        onClick: onClose,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = LessonModalHeader;
var _c;
__turbopack_context__.k.register(_c, "LessonModalHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LessonSetupTab",
    ()=>LessonSetupTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AdaptiveSelect.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonModal.module.scss [app-client] (css module)");
'use client';
;
;
;
;
;
function LessonSetupTab({ text, canEdit, role, form, students, teachers, weekDayOptions, onChange }) {
    const showTeacherField = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isAdminOrSuper"])(role);
    const canEditWeekDays = canEdit && role !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalFieldsGrid} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalSetupGrid}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: form.title,
                        readOnly: !canEdit,
                        onChange: (e)=>onChange({
                                ...form,
                                title: e.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.date
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        type: "date",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: form.date,
                        readOnly: !canEdit,
                        onChange: (e)=>onChange({
                                ...form,
                                date: e.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.startTime
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        type: "time",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: form.startTime,
                        readOnly: !canEdit,
                        onChange: (e)=>onChange({
                                ...form,
                                startTime: e.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.duration
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                        type: "number",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        min: 55,
                        step: 5,
                        value: String(form.duration),
                        readOnly: !canEdit,
                        onChange: (e)=>onChange({
                                ...form,
                                duration: Math.max(55, Number(e.target.value) || 55)
                            })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.recurrence
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: form.recurrence,
                        readOnly: !canEdit,
                        onChange: (e)=>onChange({
                                ...form,
                                recurrence: e.target.value
                            }),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "none",
                                children: text.options.noRepeat
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 43,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "daily",
                                children: text.options.daily
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "weekly",
                                children: text.options.weekly
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "monthly",
                                children: text.options.monthly
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.status
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: String(form.statusId),
                        readOnly: !canEdit,
                        onChange: (e)=>{
                            const nextStatusId = Number(e.target.value);
                            onChange({
                                ...form,
                                statusId: nextStatusId,
                                cancelReason: nextStatusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? form.cancelReason : undefined
                            });
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id,
                                children: text.options.planned
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id,
                                children: text.options.completed
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 63,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id,
                                children: text.options.cancelled
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            form.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.cancelReason
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: form.cancelReason ?? 'student_absent',
                        readOnly: !canEdit,
                        onChange: (e)=>onChange({
                                ...form,
                                cancelReason: e.target.value
                            }),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "student_absent",
                                children: text.options.studentAbsent
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "student_requested_cancel",
                                children: text.options.studentRequestedCancel
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "teacher_absent",
                                children: text.options.teacherAbsent
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 68,
                columnNumber: 9
            }, this) : null,
            form.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.credited
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: form.credited ? 'yes' : 'no',
                        readOnly: !canEdit,
                        onChange: (e)=>onChange({
                                ...form,
                                credited: e.target.value === 'yes'
                            }),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "yes",
                                children: text.options.credited
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "no",
                                children: text.options.notCredited
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 80,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, this) : null,
            form.recurrence === 'weekly' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.weekDays
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekDaysRow,
                        children: weekDayOptions.map((day)=>{
                            const selected = form.weeklyDays.includes(day.value);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekDayChip} ${selected ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].weekDayChipActive : ''}`,
                                disabled: !canEditWeekDays,
                                onClick: ()=>{
                                    if (!canEditWeekDays) return;
                                    const next = selected ? form.weeklyDays.filter((weekday)=>weekday !== day.value) : [
                                        ...form.weeklyDays,
                                        day.value
                                    ];
                                    onChange({
                                        ...form,
                                        weeklyDays: next.sort((a, b)=>a - b)
                                    });
                                },
                                children: day.label
                            }, day.value, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 93,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 87,
                columnNumber: 9
            }, this) : null,
            showTeacherField ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: "Teacher"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: String(form.teacherId),
                        readOnly: !canEdit,
                        onChange: (e)=>{
                            const nextTeacher = teachers.find((teacher)=>teacher.id === Number(e.target.value));
                            if (!nextTeacher) return;
                            onChange({
                                ...form,
                                teacherId: nextTeacher.id,
                                teacherName: nextTeacher.fullName
                            });
                        },
                        children: teachers.map((teacher)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: teacher.id,
                                children: teacher.fullName
                            }, teacher.id, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 131,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 114,
                columnNumber: 9
            }, this) : null,
            role !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldLabel,
                        children: text.fields.student
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 140,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldInput,
                        value: String(form.studentId),
                        readOnly: !canEdit,
                        onChange: (e)=>{
                            const nextStudent = students.find((student)=>student.id === Number(e.target.value));
                            if (!nextStudent) return;
                            onChange({
                                ...form,
                                studentId: nextStudent.id,
                                studentName: nextStudent.fullName
                            });
                        },
                        children: students.map((student)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: student.id,
                                children: student.fullName
                            }, student.id, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                                lineNumber: 151,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
                lineNumber: 139,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = LessonSetupTab;
var _c;
__turbopack_context__.k.register(_c, "LessonSetupTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/lesson-modal/fileUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_FILE_SIZE_MB",
    ()=>MAX_FILE_SIZE_MB,
    "filterSafeFiles",
    ()=>filterSafeFiles,
    "formatMessage",
    ()=>formatMessage,
    "getFilePlaceholder",
    ()=>getFilePlaceholder
]);
const MAX_FILE_SIZE_MB = 5;
function filterSafeFiles(files) {
    if (!files) return {
        safe: [],
        rejected: [],
        maxFileSizeMb: MAX_FILE_SIZE_MB
    };
    const allowedMimePrefixes = [
        'image/',
        'application/pdf',
        'text/',
        'application/vnd',
        'application/msword'
    ];
    const allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
        '.gif',
        '.heic',
        '.heif',
        '.svg',
        '.pdf',
        '.txt',
        '.doc',
        '.docx',
        '.ppt',
        '.pptx',
        '.xls',
        '.xlsx'
    ];
    const safe = [];
    const rejected = [];
    Array.from(files).forEach((file)=>{
        const lower = file.name.toLowerCase();
        const hasAllowedExt = allowedExtensions.some((ext)=>lower.endsWith(ext));
        const hasAllowedMime = allowedMimePrefixes.some((prefix)=>file.type.startsWith(prefix));
        const sizeMb = file.size / (1024 * 1024);
        if ((hasAllowedExt || hasAllowedMime) && sizeMb <= MAX_FILE_SIZE_MB) {
            safe.push({
                name: file.name.replace(/[^\w.\-()\s]/g, '_'),
                previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            });
        } else {
            rejected.push(file.name);
        }
    });
    return {
        safe,
        rejected,
        maxFileSizeMb: MAX_FILE_SIZE_MB
    };
}
function formatMessage(template, values) {
    return Object.entries(values).reduce((acc, [key, value])=>acc.replaceAll(`{${key}}`, String(value)), template);
}
function getFilePlaceholder(fileName) {
    const lower = fileName.toLowerCase();
    if (/\.(pdf)$/.test(lower)) return 'PDF';
    if (/\.(doc|docx|txt)$/.test(lower)) return 'DOC';
    if (/\.(ppt|pptx)$/.test(lower)) return 'PPT';
    if (/\.(xls|xlsx)$/.test(lower)) return 'XLS';
    if (/\.(jpg|jpeg|png|webp|gif|heic|heif|svg)$/.test(lower)) return 'IMG';
    return 'FILE';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/lesson-modal/LessonModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LessonModal",
    ()=>LessonModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tabs.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/content/site-content.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonModal.module.scss [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ImagePreviewOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/ImagePreviewOverlay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonContentTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModalHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonModalHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonSetupTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonSetupTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/fileUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-check.js [app-client] (ecmascript) <export default as ClipboardCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file.js [app-client] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-client] (ecmascript) <export default as Monitor>");
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
;
;
;
;
function LessonModal({ mode, canEdit, form, onChange, onClose, onSubmit, onSaveStudentResponse, students, teachers, role, canUnlinkSeries, onUnlinkSeries, canDeleteLesson, onDeleteLesson, persistedLessonId = null }) {
    _s();
    const text = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["siteContent"].calendar.lessonModal;
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('setup');
    const [fileError, setFileError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [materialsFileStatus, setMaterialsFileStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [imagePreviewUrl, setImagePreviewUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const materialsFileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [materialDraft, setMaterialDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        kind: 'text',
        text: '',
        files: []
    });
    const [materialDraftPreviews, setMaterialDraftPreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [savedMaterialPreviews, setSavedMaterialPreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [homeworkPreviews, setHomeworkPreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [studentResponsePreviews, setStudentResponsePreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const weekDayOptions = [
        {
            value: 1,
            label: text.weekDays.mon
        },
        {
            value: 2,
            label: text.weekDays.tue
        },
        {
            value: 3,
            label: text.weekDays.wed
        },
        {
            value: 4,
            label: text.weekDays.thu
        },
        {
            value: 5,
            label: text.weekDays.fri
        },
        {
            value: 6,
            label: text.weekDays.sat
        },
        {
            value: 7,
            label: text.weekDays.sun
        }
    ];
    const handleHomeworkFilesSelected = (files)=>{
        const { safe, rejected, maxFileSizeMb } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterSafeFiles"])(files);
        if (safe.length > 0) {
            onChange({
                ...form,
                homeworkFiles: [
                    ...form.homeworkFiles,
                    ...safe.map((item)=>item.name)
                ]
            });
            setHomeworkPreviews((prev)=>[
                    ...prev,
                    ...safe.map((item)=>item.previewUrl)
                ]);
        }
        setFileError(rejected.length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMessage"])(text.messages.blockedUnsafeFiles, {
            files: rejected.join(', '),
            max: maxFileSizeMb
        }) : null);
    };
    const handleStudentResponseFilesSelected = (files)=>{
        const { safe, rejected, maxFileSizeMb } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterSafeFiles"])(files);
        if (safe.length > 0) {
            onChange({
                ...form,
                studentResponseFiles: [
                    ...form.studentResponseFiles,
                    ...safe.map((item)=>item.name)
                ]
            });
            setStudentResponsePreviews((prev)=>[
                    ...prev,
                    ...safe.map((item)=>item.previewUrl)
                ]);
        }
        setFileError(rejected.length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMessage"])(text.messages.blockedUnsafeFiles, {
            files: rejected.join(', '),
            max: maxFileSizeMb
        }) : null);
    };
    const handleMaterialsFilesSelected = (files)=>{
        const { safe, rejected, maxFileSizeMb } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterSafeFiles"])(files);
        if (safe.length > 0) {
            setMaterialDraft((prev)=>({
                    ...prev,
                    files: [
                        ...prev.files,
                        ...safe.map((item)=>item.name)
                    ]
                }));
            setMaterialDraftPreviews((prev)=>[
                    ...prev,
                    ...safe.map((item)=>item.previewUrl)
                ]);
        }
        if (rejected.length > 0) {
            setMaterialsFileStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMessage"])(text.messages.rejectedFiles, {
                files: rejected.join(', '),
                max: maxFileSizeMb
            }));
        } else {
            setMaterialsFileStatus(null);
        }
    };
    const materialKinds = [
        {
            value: 'text',
            label: text.materialTypes.text,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"]
        },
        {
            value: 'photo',
            label: text.materialTypes.photo,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"]
        },
        {
            value: 'test',
            label: text.materialTypes.test,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__["ClipboardCheck"]
        },
        {
            value: 'file',
            label: text.materialTypes.file,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"]
        },
        {
            value: 'presentation',
            label: text.materialTypes.presentation,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"]
        }
    ];
    const canSaveMaterial = materialDraft.text.trim().length > 0 || materialDraft.files.length > 0;
    const showLessonLink = Boolean(persistedLessonId);
    const showConfirmButton = role !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LessonModal.useEffect": ()=>{
            setMounted(true);
            return ({
                "LessonModal.useEffect": ()=>setMounted(false)
            })["LessonModal.useEffect"];
        }
    }["LessonModal.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LessonModal.useEffect": ()=>{
            const onKeyDown = {
                "LessonModal.useEffect.onKeyDown": (event)=>{
                    if (event.key === 'Escape') setImagePreviewUrl(null);
                }
            }["LessonModal.useEffect.onKeyDown"];
            window.addEventListener('keydown', onKeyDown);
            return ({
                "LessonModal.useEffect": ()=>window.removeEventListener('keydown', onKeyDown)
            })["LessonModal.useEffect"];
        }
    }["LessonModal.useEffect"], []);
    if (!mounted) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalOverlay,
        onClick: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modal,
                onClick: (e)=>e.stopPropagation(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModalHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LessonModalHeader"], {
                        mode: mode,
                        role: role,
                        text: text,
                        canUnlinkSeries: canUnlinkSeries,
                        onUnlinkSeries: onUnlinkSeries,
                        canDeleteLesson: canDeleteLesson,
                        onDeleteLesson: onDeleteLesson,
                        onClose: onClose
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalScroll,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tabs"], {
                                value: tab,
                                onValueChange: setTab,
                                ariaLabel: text.aria.sections,
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalTabsRoot,
                                listClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalTabsList,
                                triggerClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalTabsTrigger,
                                activeTriggerClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalTabsTriggerActive,
                                panelClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalTabsPanel,
                                items: [
                                    {
                                        value: 'setup',
                                        label: text.sections.setup,
                                        panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonSetupTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LessonSetupTab"], {
                                            text: text,
                                            canEdit: canEdit,
                                            role: role,
                                            form: form,
                                            students: students,
                                            teachers: teachers,
                                            weekDayOptions: weekDayOptions,
                                            onChange: onChange
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                                            lineNumber: 186,
                                            columnNumber: 19
                                        }, void 0)
                                    },
                                    {
                                        value: 'content',
                                        label: text.sections.content,
                                        panel: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonContentTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LessonContentTab"], {
                                            text: text,
                                            canEdit: canEdit,
                                            role: role,
                                            form: form,
                                            materialKinds: materialKinds,
                                            materialDraft: materialDraft,
                                            setMaterialDraft: setMaterialDraft,
                                            materialDraftPreviews: materialDraftPreviews,
                                            setMaterialDraftPreviews: setMaterialDraftPreviews,
                                            savedMaterialPreviews: savedMaterialPreviews,
                                            setSavedMaterialPreviews: setSavedMaterialPreviews,
                                            homeworkPreviews: homeworkPreviews,
                                            setHomeworkPreviews: setHomeworkPreviews,
                                            studentResponsePreviews: studentResponsePreviews,
                                            setStudentResponsePreviews: setStudentResponsePreviews,
                                            materialsFileStatus: materialsFileStatus,
                                            canSaveMaterial: canSaveMaterial,
                                            materialsFileInputRef: materialsFileInputRef,
                                            getFilePlaceholder: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFilePlaceholder"],
                                            setImagePreviewUrl: setImagePreviewUrl,
                                            onChange: onChange,
                                            onMaterialsFilesSelected: handleMaterialsFilesSelected,
                                            onHomeworkFilesSelected: handleHomeworkFilesSelected,
                                            onStudentResponseFilesSelected: handleStudentResponseFilesSelected,
                                            onSaveStudentResponse: onSaveStudentResponse,
                                            lessonEntityId: persistedLessonId
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                                            lineNumber: 201,
                                            columnNumber: 24
                                        }, void 0)
                                    }
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                                lineNumber: 172,
                                columnNumber: 11
                            }, this),
                            fileError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileError,
                                children: fileError
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                                lineNumber: 232,
                                columnNumber: 24
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalActions,
                            showLessonLink && showConfirmButton ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalActionsWithLink : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalActionsSingle
                        ].filter(Boolean).join(' '),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalActionsHint,
                                children: role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id ? 'You can review lesson details and submit your response.' : 'Changes are applied immediately after saving.'
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                                lineNumber: 242,
                                columnNumber: 11
                            }, this),
                            showLessonLink ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/lessons/${persistedLessonId}`,
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalLessonLinkBtn,
                                onClick: onClose,
                                children: "Open lesson page"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                                lineNumber: 248,
                                columnNumber: 13
                            }, this) : null,
                            showConfirmButton ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalConfirmBtn,
                                onClick: onSubmit,
                                disabled: !canEdit,
                                children: mode === 'create' ? text.actions.saveLesson : text.actions.updateLesson
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                                lineNumber: 253,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ImagePreviewOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImagePreviewOverlay"], {
                imagePreviewUrl: imagePreviewUrl,
                text: text,
                onClose: ()=>setImagePreviewUrl(null)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
                lineNumber: 259,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/lesson-modal/LessonModal.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this), document.body);
}
_s(LessonModal, "okS4JVz69QWavkBSprjl7eVC1Mk=");
_c = LessonModal;
var _c;
__turbopack_context__.k.register(_c, "LessonModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/calendar/rules/conflicts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasTimeConflict",
    ()=>hasTimeConflict,
    "isPastSlot",
    ()=>isPastSlot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/lessonTime.ts [app-client] (ecmascript)");
;
function hasTimeConflict(lessons, candidate, ignoreLessonId, strategy = 'any-overlap') {
    const c0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lessonStartUtc"])(candidate).getTime();
    const c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lessonEndUtc"])(candidate).getTime();
    return lessons.filter((lesson)=>lesson.id !== ignoreLessonId).filter((lesson)=>strategy === 'same-teacher-overlap' ? lesson.teacherId === candidate.teacherId : true).some((lesson)=>{
        const l0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lessonStartUtc"])(lesson).getTime();
        const l1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lessonEndUtc"])(lesson).getTime();
        return c0 < l1 && c1 > l0;
    });
}
function isPastSlot(lesson) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lessonStartUtc"])(lesson).getTime() < Date.now();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/lesson-modal/useLessonEditor.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLessonEditor",
    ()=>useLessonEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/adapters/lessonCalendarAdapter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$rules$2f$conflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/rules/conflicts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ScheduledLessonsProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/ScheduledLessonsProvider.tsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function toDateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function useLessonEditor(options = {}) {
    _s();
    const { onAfterDelete, onLessonCreated } = options;
    const role = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role;
    const { lessons, setLessons } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ScheduledLessonsProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScheduledLessons"])();
    const canManageLessons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canSchedule"])('lessons', role);
    const visibleStudents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useLessonEditor.useMemo[visibleStudents]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVisibleProfiles"])(role, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id)
    }["useLessonEditor.useMemo[visibleStudents]"], [
        role
    ]);
    const assignableTeachers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useLessonEditor.useMemo[assignableTeachers]": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsers"].filter({
                "useLessonEditor.useMemo[assignableTeachers]": (user)=>user.role !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id
            }["useLessonEditor.useMemo[assignableTeachers]"]).map({
                "useLessonEditor.useMemo[assignableTeachers]": (user)=>({
                        id: user.id,
                        fullName: user.fullName
                    })
            }["useLessonEditor.useMemo[assignableTeachers]"])
    }["useLessonEditor.useMemo[assignableTeachers]"], []);
    const [modalMode, setModalMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('create');
    const [editingLesson, setEditingLesson] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const openCreateModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLessonEditor.useCallback[openCreateModal]": (date, startTime = '10:00')=>{
            const defaultStudent = visibleStudents[0];
            const defaultTeacher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isAdminOrSuper"])(role) ? assignableTeachers[0] : {
                id: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id,
                fullName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].fullName
            };
            setModalMode('create');
            setEditingLesson(null);
            setForm({
                title: 'New lesson',
                date,
                startTime,
                duration: 55,
                teacherId: defaultTeacher?.id ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id,
                teacherName: defaultTeacher?.fullName ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].fullName,
                studentId: role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id : defaultStudent?.id ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id,
                studentName: role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].fullName : defaultStudent?.fullName ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].fullName,
                notes: '',
                lessonPlan: '',
                materials: [],
                homeworkText: '',
                homeworkFiles: [],
                studentResponseText: '',
                studentResponseFiles: [],
                studentResponseStatus: 'not_submitted',
                homeworkChecked: false,
                teacherHomeworkFeedback: '',
                linkedVocabularyIds: [],
                statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id,
                credited: false,
                recurrence: 'none',
                weeklyDays: [],
                applyToSeries: false,
                timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].timezoneId
            });
        }
    }["useLessonEditor.useCallback[openCreateModal]"], [
        role,
        visibleStudents,
        assignableTeachers
    ]);
    const openEditModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLessonEditor.useCallback[openEditModal]": (lesson)=>{
            setModalMode('edit');
            setEditingLesson(lesson);
            setForm((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toLessonFormState"])(lesson));
        }
    }["useLessonEditor.useCallback[openEditModal]"], []);
    const closeModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLessonEditor.useCallback[closeModal]": ()=>{
            setForm(null);
            setEditingLesson(null);
        }
    }["useLessonEditor.useCallback[closeModal]"], []);
    const tryApplyLesson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLessonEditor.useCallback[tryApplyLesson]": (nextLesson, sourceLesson)=>{
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$rules$2f$conflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasTimeConflict"])(lessons, nextLesson, sourceLesson?.id, 'any-overlap')) {
                window.alert('This time slot is already booked.');
                return false;
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$rules$2f$conflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPastSlot"])(nextLesson)) {
                window.alert('You cannot schedule a lesson in the past.');
                return false;
            }
            if (!sourceLesson) {
                setLessons({
                    "useLessonEditor.useCallback[tryApplyLesson]": (prev)=>[
                            ...prev,
                            nextLesson
                        ]
                }["useLessonEditor.useCallback[tryApplyLesson]"]);
                onLessonCreated?.(nextLesson);
            } else {
                setLessons({
                    "useLessonEditor.useCallback[tryApplyLesson]": (prev)=>prev.map({
                            "useLessonEditor.useCallback[tryApplyLesson]": (lesson)=>lesson.id === sourceLesson.id ? nextLesson : lesson
                        }["useLessonEditor.useCallback[tryApplyLesson]"])
                }["useLessonEditor.useCallback[tryApplyLesson]"]);
            }
            return true;
        }
    }["useLessonEditor.useCallback[tryApplyLesson]"], [
        lessons,
        setLessons,
        onLessonCreated
    ]);
    const submitModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLessonEditor.useCallback[submitModal]": ()=>{
            if (!form) return;
            const seq = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextLessonEntityId"])(lessons);
            const candidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fromLessonFormState"])(form, editingLesson ?? undefined, editingLesson ? undefined : seq);
            if (!canManageLessons) candidate.statusId = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id;
            if (!tryApplyLesson(candidate, editingLesson ?? undefined)) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["syncLessonVocabularyToProfile"])(candidate);
            if (!editingLesson && form.recurrence === 'weekly' && form.weeklyDays.length > 0) {
                const baseDate = new Date(form.date);
                let cloneOffset = 1;
                form.weeklyDays.forEach({
                    "useLessonEditor.useCallback[submitModal]": (weekday, index)=>{
                        if (index === 0) return;
                        const delta = (weekday - (baseDate.getDay() === 0 ? 7 : baseDate.getDay()) + 7) % 7;
                        const nextDate = new Date(baseDate);
                        nextDate.setDate(baseDate.getDate() + delta);
                        tryApplyLesson({
                            ...candidate,
                            id: seq + cloneOffset,
                            date: toDateString(nextDate)
                        }, undefined);
                        cloneOffset += 1;
                    }
                }["useLessonEditor.useCallback[submitModal]"]);
            }
            closeModal();
        }
    }["useLessonEditor.useCallback[submitModal]"], [
        form,
        editingLesson,
        lessons,
        canManageLessons,
        tryApplyLesson,
        closeModal
    ]);
    const saveStudentResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLessonEditor.useCallback[saveStudentResponse]": ()=>{
            if (!form || !editingLesson) return;
            const nextResponse = {
                ...editingLesson.studentResponse ?? {
                    text: '',
                    files: []
                },
                text: form.studentResponseText,
                files: form.studentResponseFiles,
                status: form.studentResponseStatus,
                homeworkChecked: form.homeworkChecked,
                teacherHomeworkFeedback: form.teacherHomeworkFeedback
            };
            setLessons({
                "useLessonEditor.useCallback[saveStudentResponse]": (prev)=>prev.map({
                        "useLessonEditor.useCallback[saveStudentResponse]": (lesson)=>lesson.id === editingLesson.id ? {
                                ...lesson,
                                studentResponse: nextResponse
                            } : lesson
                    }["useLessonEditor.useCallback[saveStudentResponse]"])
            }["useLessonEditor.useCallback[saveStudentResponse]"]);
            setEditingLesson({
                "useLessonEditor.useCallback[saveStudentResponse]": (prev)=>prev ? {
                        ...prev,
                        studentResponse: nextResponse
                    } : prev
            }["useLessonEditor.useCallback[saveStudentResponse]"]);
        }
    }["useLessonEditor.useCallback[saveStudentResponse]"], [
        form,
        editingLesson,
        setLessons
    ]);
    const handleUnlinkSeries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLessonEditor.useCallback[handleUnlinkSeries]": ()=>{
            if (!editingLesson?.seriesId) return;
            if (!window.confirm('Unlink this lesson from the series? Only this lesson will be detached; other series lessons stay as they are.')) {
                return;
            }
            setLessons({
                "useLessonEditor.useCallback[handleUnlinkSeries]": (prev)=>prev.map({
                        "useLessonEditor.useCallback[handleUnlinkSeries]": (lesson)=>lesson.id === editingLesson.id ? {
                                ...lesson,
                                seriesId: undefined,
                                recurrence: 'none',
                                weeklyDays: []
                            } : lesson
                    }["useLessonEditor.useCallback[handleUnlinkSeries]"])
            }["useLessonEditor.useCallback[handleUnlinkSeries]"]);
            setEditingLesson({
                "useLessonEditor.useCallback[handleUnlinkSeries]": (prev)=>prev ? {
                        ...prev,
                        seriesId: undefined,
                        recurrence: 'none',
                        weeklyDays: []
                    } : prev
            }["useLessonEditor.useCallback[handleUnlinkSeries]"]);
            setForm({
                "useLessonEditor.useCallback[handleUnlinkSeries]": (prev)=>prev ? {
                        ...prev,
                        recurrence: 'none',
                        weeklyDays: [],
                        applyToSeries: false
                    } : prev
            }["useLessonEditor.useCallback[handleUnlinkSeries]"]);
        }
    }["useLessonEditor.useCallback[handleUnlinkSeries]"], [
        editingLesson,
        setLessons
    ]);
    const handleDeleteLesson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLessonEditor.useCallback[handleDeleteLesson]": ()=>{
            if (!editingLesson) return;
            if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
            const id = editingLesson.id;
            setLessons({
                "useLessonEditor.useCallback[handleDeleteLesson]": (prev)=>prev.filter({
                        "useLessonEditor.useCallback[handleDeleteLesson]": (lesson)=>lesson.id !== id
                    }["useLessonEditor.useCallback[handleDeleteLesson]"])
            }["useLessonEditor.useCallback[handleDeleteLesson]"]);
            onAfterDelete?.(id);
            closeModal();
        }
    }["useLessonEditor.useCallback[handleDeleteLesson]"], [
        editingLesson,
        setLessons,
        onAfterDelete,
        closeModal
    ]);
    return {
        role,
        canManageLessons,
        canCreateLesson: canManageLessons,
        lessons,
        visibleStudents,
        assignableTeachers,
        modalMode,
        editingLesson,
        form,
        setForm,
        openCreateModal,
        openEditModal,
        closeModal,
        submitModal,
        saveStudentResponse,
        handleUnlinkSeries,
        handleDeleteLesson
    };
}
_s(useLessonEditor, "sekWxyRbCSxcXDz+1hHGTyWa5JA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ScheduledLessonsProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScheduledLessons"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/lesson-modal/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ScheduledLessonsProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/ScheduledLessonsProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$useLessonEditor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/useLessonEditor.ts [app-client] (ecmascript)");
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/app/lessons/[lessonId]/page.module.scss [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "backLink": "page-module-scss-module__DZIKJW__backLink",
  "calendarButton": "page-module-scss-module__DZIKJW__calendarButton",
  "content": "page-module-scss-module__DZIKJW__content",
  "description": "page-module-scss-module__DZIKJW__description",
  "descriptionWrap": "page-module-scss-module__DZIKJW__descriptionWrap",
  "editLessonBtn": "page-module-scss-module__DZIKJW__editLessonBtn",
  "fileError": "page-module-scss-module__DZIKJW__fileError",
  "fileTag": "page-module-scss-module__DZIKJW__fileTag",
  "fileTagRemove": "page-module-scss-module__DZIKJW__fileTagRemove",
  "fileTags": "page-module-scss-module__DZIKJW__fileTags",
  "heroBadges": "page-module-scss-module__DZIKJW__heroBadges",
  "heroBlock": "page-module-scss-module__DZIKJW__heroBlock",
  "heroIcon": "page-module-scss-module__DZIKJW__heroIcon",
  "heroMain": "page-module-scss-module__DZIKJW__heroMain",
  "heroTitle": "page-module-scss-module__DZIKJW__heroTitle",
  "heroTitleInput": "page-module-scss-module__DZIKJW__heroTitleInput",
  "heroTitleWrap": "page-module-scss-module__DZIKJW__heroTitleWrap",
  "inlineRow": "page-module-scss-module__DZIKJW__inlineRow",
  "layout": "page-module-scss-module__DZIKJW__layout",
  "materialComposer": "page-module-scss-module__DZIKJW__materialComposer",
  "materialDeleteBtn": "page-module-scss-module__DZIKJW__materialDeleteBtn",
  "materialIcon": "page-module-scss-module__DZIKJW__materialIcon",
  "materialItem": "page-module-scss-module__DZIKJW__materialItem",
  "materialList": "page-module-scss-module__DZIKJW__materialList",
  "materialMeta": "page-module-scss-module__DZIKJW__materialMeta",
  "materialTitle": "page-module-scss-module__DZIKJW__materialTitle",
  "meetButton": "page-module-scss-module__DZIKJW__meetButton",
  "metaGrid": "page-module-scss-module__DZIKJW__metaGrid",
  "metaIcon": "page-module-scss-module__DZIKJW__metaIcon",
  "metaLabel": "page-module-scss-module__DZIKJW__metaLabel",
  "metaRow": "page-module-scss-module__DZIKJW__metaRow",
  "metaText": "page-module-scss-module__DZIKJW__metaText",
  "metaValue": "page-module-scss-module__DZIKJW__metaValue",
  "page": "page-module-scss-module__DZIKJW__page",
  "pageHeader": "page-module-scss-module__DZIKJW__pageHeader",
  "pageHeaderActions": "page-module-scss-module__DZIKJW__pageHeaderActions",
  "pageSub": "page-module-scss-module__DZIKJW__pageSub",
  "pageTitle": "page-module-scss-module__DZIKJW__pageTitle",
  "sectionCard": "page-module-scss-module__DZIKJW__sectionCard",
  "sectionCardHighlight": "page-module-scss-module__DZIKJW__sectionCardHighlight",
  "sectionIcon": "page-module-scss-module__DZIKJW__sectionIcon",
  "sectionKicker": "page-module-scss-module__DZIKJW__sectionKicker",
  "sectionMuted": "page-module-scss-module__DZIKJW__sectionMuted",
  "sectionText": "page-module-scss-module__DZIKJW__sectionText",
  "sectionTitle": "page-module-scss-module__DZIKJW__sectionTitle",
  "sectionTop": "page-module-scss-module__DZIKJW__sectionTop",
  "sidebarActions": "page-module-scss-module__DZIKJW__sidebarActions",
  "sidebarCard": "page-module-scss-module__DZIKJW__sidebarCard",
  "slideUp": "page-module-scss-module__DZIKJW__slideUp",
  "statusBadge": "page-module-scss-module__DZIKJW__statusBadge",
  "statusCancelled": "page-module-scss-module__DZIKJW__statusCancelled",
  "statusCompleted": "page-module-scss-module__DZIKJW__statusCompleted",
  "statusPlanned": "page-module-scss-module__DZIKJW__statusPlanned",
});
}),
"[project]/apps/web/src/app/lessons/[lessonId]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LessonPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-check.js [app-client] (ecmascript) <export default as ClipboardCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2d$3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock-3.js [app-client] (ecmascript) <export default as Clock3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file.js [app-client] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-client] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-round.js [app-client] (ecmascript) <export default as UserRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/video.js [app-client] (ecmascript) <export default as Video>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AdaptiveSelect.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/PageHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/content/site-content.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/adapters/lessonCalendarAdapter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ScheduledLessonsProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/ScheduledLessonsProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ImagePreviewOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/ImagePreviewOverlay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonContentTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/LessonContentTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lesson-modal/fileUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/lessons/[lessonId]/page.module.scss [app-client] (css module)");
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
;
;
;
;
;
function formatLongDate(isoDate) {
    const d = new Date(`${isoDate}T12:00:00`);
    return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}
function LessonPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const rawLessonId = params?.lessonId;
    const lessonIdNum = rawLessonId !== undefined && rawLessonId !== '' ? Number(rawLessonId) : Number.NaN;
    const role = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role;
    const hasAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canView"])('dashboard', role);
    const canManageLessons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canSchedule"])('lessons', role);
    const { lessons, setLessons } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ScheduledLessonsProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScheduledLessons"])();
    const [draft, setDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [fileError, setFileError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [materialsFileStatus, setMaterialsFileStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [imagePreviewUrl, setImagePreviewUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [newMaterialText, setNewMaterialText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [newMaterialFiles, setNewMaterialFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [newMaterialKind, setNewMaterialKind] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('text');
    const [materialDraftPreviews, setMaterialDraftPreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [savedMaterialPreviews, setSavedMaterialPreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [homeworkPreviews, setHomeworkPreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [studentResponsePreviews, setStudentResponsePreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const materialsFileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const studentOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LessonPage.useMemo[studentOptions]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVisibleProfiles"])(role, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id)
    }["LessonPage.useMemo[studentOptions]"], [
        role
    ]);
    const lesson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LessonPage.useMemo[lesson]": ()=>{
            if (!Number.isFinite(lessonIdNum)) return null;
            const candidate = lessons.find({
                "LessonPage.useMemo[lesson].candidate": (item)=>item.id === lessonIdNum
            }["LessonPage.useMemo[lesson].candidate"]);
            if (!candidate) return null;
            if (role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id && candidate.studentId !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id) return null;
            if (role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id && candidate.teacherId !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id) return null;
            return candidate;
        }
    }["LessonPage.useMemo[lesson]"], [
        lessonIdNum,
        lessons,
        role
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LessonPage.useEffect": ()=>{
            if (!lesson) {
                setDraft(null);
                return;
            }
            setDraft({
                ...lesson,
                materials: lesson.materials?.map({
                    "LessonPage.useEffect": (m)=>({
                            ...m,
                            files: [
                                ...m.files ?? []
                            ]
                        })
                }["LessonPage.useEffect"]) ?? [],
                homework: {
                    text: lesson.homework?.text ?? '',
                    files: [
                        ...lesson.homework?.files ?? []
                    ]
                },
                studentResponse: {
                    text: lesson.studentResponse?.text ?? '',
                    files: [
                        ...lesson.studentResponse?.files ?? []
                    ],
                    status: lesson.studentResponse?.status ?? 'not_submitted',
                    homeworkChecked: lesson.studentResponse?.homeworkChecked ?? false,
                    teacherHomeworkFeedback: lesson.studentResponse?.teacherHomeworkFeedback ?? ''
                }
            });
        }
    }["LessonPage.useEffect"], [
        lesson
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LessonPage.useEffect": ()=>{
            setMaterialDraftPreviews([]);
            setSavedMaterialPreviews({});
            setHomeworkPreviews([]);
            setStudentResponsePreviews([]);
            setFileError(null);
            setMaterialsFileStatus(null);
        }
    }["LessonPage.useEffect"], [
        lesson?.id
    ]);
    const statusLabel = draft?.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id ? 'Planned' : draft?.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id ? 'Completed' : 'Cancelled';
    const canStudentSubmitHomework = role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id && draft?.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id;
    if (!hasAccess || !lesson || !draft) return null;
    const applyUpdate = (next)=>setDraft(next);
    const text = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["siteContent"].calendar.lessonModal;
    const statusOrder = [
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id,
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id,
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id
    ];
    const handleStatusBadgeClick = ()=>{
        if (!canManageLessons) return;
        const currentIdx = statusOrder.indexOf(draft.statusId);
        const nextStatusId = statusOrder[(currentIdx + 1) % statusOrder.length];
        applyUpdate({
            ...draft,
            statusId: nextStatusId,
            cancelReason: nextStatusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? draft.cancelReason ?? 'student_absent' : undefined,
            credited: nextStatusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? draft.credited : false
        });
    };
    const materialKinds = [
        {
            value: 'text',
            label: text.materialTypes.text,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"]
        },
        {
            value: 'photo',
            label: text.materialTypes.photo,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"]
        },
        {
            value: 'test',
            label: text.materialTypes.test,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__["ClipboardCheck"]
        },
        {
            value: 'file',
            label: text.materialTypes.file,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"]
        },
        {
            value: 'presentation',
            label: text.materialTypes.presentation,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"]
        }
    ];
    const materialDraft = {
        kind: newMaterialKind,
        text: newMaterialText,
        files: newMaterialFiles
    };
    const setMaterialDraft = (next)=>{
        const prev = {
            kind: newMaterialKind,
            text: newMaterialText,
            files: newMaterialFiles
        };
        const resolved = typeof next === 'function' ? next(prev) : next;
        setNewMaterialKind(resolved.kind);
        setNewMaterialText(resolved.text);
        setNewMaterialFiles(resolved.files);
    };
    const canSaveMaterial = newMaterialText.trim().length > 0 || newMaterialFiles.length > 0;
    const handleHomeworkFilesSelected = (files)=>{
        const { safe, rejected, maxFileSizeMb } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterSafeFiles"])(files);
        if (safe.length > 0) {
            applyUpdate({
                ...draft,
                homework: {
                    text: draft.homework?.text ?? '',
                    files: [
                        ...draft.homework?.files ?? [],
                        ...safe.map((item)=>item.name)
                    ]
                }
            });
            setHomeworkPreviews((prev)=>[
                    ...prev,
                    ...safe.map((item)=>item.previewUrl)
                ]);
        }
        setFileError(rejected.length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMessage"])(text.messages.blockedUnsafeFiles, {
            files: rejected.join(', '),
            max: maxFileSizeMb
        }) : null);
    };
    const handleStudentResponseFilesSelected = (files)=>{
        const { safe, rejected, maxFileSizeMb } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterSafeFiles"])(files);
        if (safe.length > 0) {
            applyUpdate({
                ...draft,
                studentResponse: {
                    text: draft.studentResponse?.text ?? '',
                    files: [
                        ...draft.studentResponse?.files ?? [],
                        ...safe.map((item)=>item.name)
                    ],
                    status: draft.studentResponse?.status ?? 'submitted',
                    homeworkChecked: draft.studentResponse?.homeworkChecked ?? false,
                    teacherHomeworkFeedback: draft.studentResponse?.teacherHomeworkFeedback ?? ''
                }
            });
            setStudentResponsePreviews((prev)=>[
                    ...prev,
                    ...safe.map((item)=>item.previewUrl)
                ]);
        }
        setFileError(rejected.length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMessage"])(text.messages.blockedUnsafeFiles, {
            files: rejected.join(', '),
            max: maxFileSizeMb
        }) : null);
    };
    const handleMaterialsFilesSelected = (files)=>{
        const { safe, rejected, maxFileSizeMb } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterSafeFiles"])(files);
        if (safe.length > 0) {
            setMaterialDraft((prev)=>({
                    ...prev,
                    files: [
                        ...prev.files,
                        ...safe.map((item)=>item.name)
                    ]
                }));
            setMaterialDraftPreviews((prev)=>[
                    ...prev,
                    ...safe.map((item)=>item.previewUrl)
                ]);
        }
        if (rejected.length > 0) {
            setMaterialsFileStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMessage"])(text.messages.rejectedFiles, {
                files: rejected.join(', '),
                max: maxFileSizeMb
            }));
        } else {
            setMaterialsFileStatus(null);
        }
    };
    const saveAllLessonData = ()=>{
        if (!canManageLessons) return;
        const normalized = {
            ...draft,
            endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateEndTime"])(draft.startTime, draft.duration),
            studentResponse: {
                text: draft.studentResponse?.text ?? '',
                files: [
                    ...draft.studentResponse?.files ?? []
                ],
                status: draft.studentResponse?.status ?? 'not_submitted',
                homeworkChecked: draft.studentResponse?.homeworkChecked ?? false,
                teacherHomeworkFeedback: draft.studentResponse?.teacherHomeworkFeedback ?? ''
            }
        };
        setLessons((prev)=>prev.map((item)=>item.id === normalized.id ? normalized : item));
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["syncLessonVocabularyToProfile"])(normalized);
    };
    const saveStudentHomework = ()=>{
        if (!canStudentSubmitHomework) return;
        const normalized = {
            ...draft,
            endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$adapters$2f$lessonCalendarAdapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateEndTime"])(draft.startTime, draft.duration),
            studentResponse: {
                text: draft.studentResponse?.text ?? '',
                files: [
                    ...draft.studentResponse?.files ?? []
                ],
                status: draft.studentResponse?.status ?? 'submitted',
                homeworkChecked: draft.studentResponse?.homeworkChecked ?? false,
                teacherHomeworkFeedback: draft.studentResponse?.teacherHomeworkFeedback ?? ''
            }
        };
        setLessons((prev)=>prev.map((item)=>item.id === normalized.id ? normalized : item));
        setDraft(normalized);
    };
    const persistLesson = ()=>{
        if (canManageLessons) saveAllLessonData();
        else if (canStudentSubmitHomework) saveStudentHomework();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].page} container container--page`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PageHeader"], {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageHeader,
                titleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageTitle,
                subtitleClassName: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageSub,
                title: draft.title,
                subtitle: "Edit lesson directly on this page"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                lineNumber: 261,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].layout,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SurfaceCard"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sidebarCard,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/lessons",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].backLink,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                        size: 16,
                                        "aria-hidden": true
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 272,
                                        columnNumber: 13
                                    }, this),
                                    "Back to lessons"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                lineNumber: 271,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroBlock,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroIcon,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                            size: 22,
                                            strokeWidth: 2
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                            lineNumber: 278,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 277,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroMain,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroTitleWrap,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                    as: "input",
                                                    className: canManageLessons ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroTitleInput : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroTitle,
                                                    value: draft.title,
                                                    readOnly: !canManageLessons,
                                                    onChange: (event)=>applyUpdate({
                                                            ...draft,
                                                            title: event.target.value
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 281,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroBadges,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: handleStatusBadgeClick,
                                                    disabled: !canManageLessons,
                                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statusBadge} ${draft.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].planned.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statusPlanned : ''} ${draft.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].completed.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statusCompleted : ''} ${draft.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statusCancelled : ''}`,
                                                    children: statusLabel
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                    lineNumber: 291,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 290,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 280,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                lineNumber: 276,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaGrid,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaRow,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaIcon,
                                                "data-accent": "calendar",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                    size: 16,
                                                    "aria-hidden": true
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                    lineNumber: 306,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 305,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaText,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaLabel,
                                                        children: "Date"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 309,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        type: "date",
                                                        className: !canManageLessons ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaValue : undefined,
                                                        value: draft.date,
                                                        readOnly: !canManageLessons,
                                                        formatValue: (value)=>typeof value === 'string' && value ? formatLongDate(value) : '—',
                                                        onChange: (event)=>applyUpdate({
                                                                ...draft,
                                                                date: event.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 310,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 308,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 304,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaRow,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaIcon,
                                                "data-accent": "clock",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2d$3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock3$3e$__["Clock3"], {
                                                    size: 16,
                                                    "aria-hidden": true
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                    lineNumber: 324,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 323,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaText,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaLabel,
                                                        children: "Time"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 327,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inlineRow,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                                type: "time",
                                                                className: !canManageLessons ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaValue : undefined,
                                                                value: draft.startTime,
                                                                readOnly: !canManageLessons,
                                                                onChange: (event)=>applyUpdate({
                                                                        ...draft,
                                                                        startTime: event.target.value
                                                                    })
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                lineNumber: 329,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                                type: "number",
                                                                min: 15,
                                                                step: 5,
                                                                className: !canManageLessons ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaValue : undefined,
                                                                value: draft.duration,
                                                                readOnly: !canManageLessons,
                                                                formatValue: (value)=>`${Number(value) || 0} min`,
                                                                onChange: (event)=>applyUpdate({
                                                                        ...draft,
                                                                        duration: Math.max(15, Number(event.target.value) || 15)
                                                                    })
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                lineNumber: 336,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 328,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 326,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 322,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaRow,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaIcon,
                                                "data-accent": "teacher",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"], {
                                                    size: 16,
                                                    "aria-hidden": true
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                    lineNumber: 353,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 352,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaText,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaLabel,
                                                        children: "Teacher"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 356,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        as: "input",
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaValue,
                                                        value: lesson.teacherName,
                                                        readOnly: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 357,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 355,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 351,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaRow,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaIcon,
                                                "data-accent": "student",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"], {
                                                    size: 16,
                                                    "aria-hidden": true
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                    lineNumber: 367,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 366,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaText,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaLabel,
                                                        children: "Student"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 370,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                                                        className: !canManageLessons ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaValue : undefined,
                                                        value: String(draft.studentId),
                                                        readOnly: !canManageLessons,
                                                        onChange: (event)=>{
                                                            const next = studentOptions.find((item)=>item.id === Number(event.target.value));
                                                            if (!next) return;
                                                            applyUpdate({
                                                                ...draft,
                                                                studentId: next.id,
                                                                studentName: next.fullName
                                                            });
                                                        },
                                                        children: studentOptions.map((student)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: student.id,
                                                                children: student.fullName
                                                            }, student.id, false, {
                                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                lineNumber: 382,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 371,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 369,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 365,
                                        columnNumber: 13
                                    }, this),
                                    canManageLessons && draft.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LESSON_STATUS"].cancelled.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaRow,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaIcon,
                                                        "data-accent": "clock",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2d$3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock3$3e$__["Clock3"], {
                                                            size: 16,
                                                            "aria-hidden": true
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                            lineNumber: 394,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 393,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaText,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaLabel,
                                                                children: "Cancel reason"
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                lineNumber: 397,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                                                                value: draft.cancelReason ?? 'student_absent',
                                                                onChange: (event)=>applyUpdate({
                                                                        ...draft,
                                                                        cancelReason: event.target.value
                                                                    }),
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "student_absent",
                                                                        children: "Student absent"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                        lineNumber: 407,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "student_requested_cancel",
                                                                        children: "Student requested cancel"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                        lineNumber: 408,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "teacher_absent",
                                                                        children: "Teacher absent"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                        lineNumber: 409,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                lineNumber: 398,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 396,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 392,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaRow,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaIcon,
                                                        "data-accent": "teacher",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"], {
                                                            size: 16,
                                                            "aria-hidden": true
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                            lineNumber: 415,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 414,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaText,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metaLabel,
                                                                children: "Credited"
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                lineNumber: 418,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AdaptiveSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveSelect"], {
                                                                value: draft.credited ? 'yes' : 'no',
                                                                onChange: (event)=>applyUpdate({
                                                                        ...draft,
                                                                        credited: event.target.value === 'yes'
                                                                    }),
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "yes",
                                                                        children: "Yes"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                        lineNumber: 423,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "no",
                                                                        children: "No"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                        lineNumber: 424,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                                lineNumber: 419,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                        lineNumber: 417,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 413,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                lineNumber: 303,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sidebarActions,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "#",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].meetButton,
                                        onClick: (event)=>event.preventDefault(),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__["Video"], {
                                                size: 17
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 434,
                                                columnNumber: 15
                                            }, this),
                                            "Join lesson call"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 433,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/calendar",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].calendarButton,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                size: 17
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                                lineNumber: 438,
                                                columnNumber: 15
                                            }, this),
                                            "Open in Calendar"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 437,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                lineNumber: 432,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].descriptionWrap,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                    as: "textarea",
                                    className: !canManageLessons ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].description : undefined,
                                    rows: 4,
                                    value: draft.description ?? '',
                                    readOnly: !canManageLessons,
                                    formatValue: (value)=>value && String(value).trim().length > 0 ? String(value) : lesson.notes ?? 'Materials and homework are listed on the right — use this page as your lesson hub.',
                                    placeholder: "Short summary for this lesson hub…",
                                    onChange: (event)=>applyUpdate({
                                            ...draft,
                                            description: event.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                    lineNumber: 444,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                lineNumber: 443,
                                columnNumber: 11
                            }, this),
                            canManageLessons || canStudentSubmitHomework ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].editLessonBtn,
                                onClick: persistLesson,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                        lineNumber: 462,
                                        columnNumber: 15
                                    }, this),
                                    "Save"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                lineNumber: 461,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                        lineNumber: 270,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].content,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$LessonContentTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LessonContentTab"], {
                                text: text,
                                canEdit: canManageLessons,
                                role: role,
                                form: {
                                    title: draft.title,
                                    date: draft.date,
                                    startTime: draft.startTime,
                                    timezoneId: draft.timezoneId,
                                    duration: draft.duration,
                                    teacherId: draft.teacherId,
                                    teacherName: draft.teacherName,
                                    studentId: draft.studentId,
                                    studentName: draft.studentName,
                                    notes: draft.notes ?? '',
                                    lessonPlan: draft.lessonPlan ?? '',
                                    materials: draft.materials ?? [],
                                    homeworkText: draft.homework?.text ?? '',
                                    homeworkFiles: draft.homework?.files ?? [],
                                    studentResponseText: draft.studentResponse?.text ?? '',
                                    studentResponseFiles: draft.studentResponse?.files ?? [],
                                    studentResponseStatus: draft.studentResponse?.status ?? 'not_submitted',
                                    homeworkChecked: draft.studentResponse?.homeworkChecked ?? false,
                                    teacherHomeworkFeedback: draft.studentResponse?.teacherHomeworkFeedback ?? '',
                                    statusId: draft.statusId,
                                    cancelReason: draft.cancelReason,
                                    credited: draft.credited,
                                    recurrence: draft.recurrence,
                                    weeklyDays: draft.weeklyDays ?? [],
                                    applyToSeries: false,
                                    linkedVocabularyIds: draft.linkedVocabularyIds ?? []
                                },
                                lessonEntityId: lesson.id,
                                materialKinds: materialKinds,
                                materialDraft: materialDraft,
                                setMaterialDraft: setMaterialDraft,
                                materialDraftPreviews: materialDraftPreviews,
                                setMaterialDraftPreviews: setMaterialDraftPreviews,
                                savedMaterialPreviews: savedMaterialPreviews,
                                setSavedMaterialPreviews: setSavedMaterialPreviews,
                                homeworkPreviews: homeworkPreviews,
                                setHomeworkPreviews: setHomeworkPreviews,
                                studentResponsePreviews: studentResponsePreviews,
                                setStudentResponsePreviews: setStudentResponsePreviews,
                                materialsFileStatus: materialsFileStatus,
                                canSaveMaterial: canSaveMaterial,
                                materialsFileInputRef: materialsFileInputRef,
                                getFilePlaceholder: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$fileUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFilePlaceholder"],
                                setImagePreviewUrl: setImagePreviewUrl,
                                onChange: (form)=>applyUpdate({
                                        ...draft,
                                        timezoneId: form.timezoneId,
                                        lessonPlan: form.lessonPlan,
                                        materials: form.materials,
                                        linkedVocabularyIds: form.linkedVocabularyIds,
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
                                        }
                                    }),
                                onMaterialsFilesSelected: handleMaterialsFilesSelected,
                                onHomeworkFilesSelected: handleHomeworkFilesSelected,
                                onStudentResponseFilesSelected: handleStudentResponseFilesSelected,
                                onSaveStudentResponse: saveStudentHomework,
                                hideStudentSaveButton: true
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                lineNumber: 469,
                                columnNumber: 11
                            }, this),
                            fileError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$lessons$2f5b$lessonId$5d2f$page$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileError,
                                children: fileError
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                                lineNumber: 544,
                                columnNumber: 24
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                        lineNumber: 468,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                lineNumber: 269,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ImagePreviewOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImagePreviewOverlay"], {
                imagePreviewUrl: imagePreviewUrl,
                text: text,
                onClose: ()=>setImagePreviewUrl(null)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
                lineNumber: 547,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/lessons/[lessonId]/page.tsx",
        lineNumber: 260,
        columnNumber: 5
    }, this);
}
_s(LessonPage, "JGzw4x951y1lfDaT/Wh9+w1GG64=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lesson$2d$modal$2f$ScheduledLessonsProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScheduledLessons"]
    ];
});
_c = LessonPage;
var _c;
__turbopack_context__.k.register(_c, "LessonPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_web_src_881c53ac._.js.map
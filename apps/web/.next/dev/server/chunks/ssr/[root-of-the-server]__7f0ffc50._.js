module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/web/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/web/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/apps/web/src/app/practice/page.module.scss [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "card": "page-module-scss-module___Ww9ua__card",
  "cardDesc": "page-module-scss-module___Ww9ua__cardDesc",
  "cardDisabled": "page-module-scss-module___Ww9ua__cardDisabled",
  "cardFooter": "page-module-scss-module___Ww9ua__cardFooter",
  "cardIcon": "page-module-scss-module___Ww9ua__cardIcon",
  "cardTitle": "page-module-scss-module___Ww9ua__cardTitle",
  "cta": "page-module-scss-module___Ww9ua__cta",
  "grid": "page-module-scss-module___Ww9ua__grid",
  "page": "page-module-scss-module___Ww9ua__page",
  "pageHeader": "page-module-scss-module___Ww9ua__pageHeader",
  "pageSub": "page-module-scss-module___Ww9ua__pageSub",
  "pageTitle": "page-module-scss-module___Ww9ua__pageTitle",
  "slideUp": "page-module-scss-module___Ww9ua__slideUp",
  "tag": "page-module-scss-module___Ww9ua__tag",
  "tagAmber": "page-module-scss-module___Ww9ua__tagAmber",
  "tagBlue": "page-module-scss-module___Ww9ua__tagBlue",
  "tagGreen": "page-module-scss-module___Ww9ua__tagGreen",
  "tagMuted": "page-module-scss-module___Ww9ua__tagMuted",
});
}),
"[project]/apps/web/src/app/practice/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PracticePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/app/practice/page.module.scss [app-rsc] (css module)");
;
;
;
const activities = [
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
function PracticePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].page} container container--page`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].pageHeader,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].pageTitle,
                        children: "Practice"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/practice/page.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].pageSub,
                        children: "Pick an activity: build vocabulary like in the Vocabulary area, or run drills like in the Quiz — all from one place."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/practice/page.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/practice/page.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].grid,
                children: activities.map((activity)=>{
                    const tagStyle = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"][activity.tagClass];
                    const body = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardIcon,
                                "aria-hidden": true,
                                children: activity.icon
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/practice/page.tsx",
                                lineNumber: 61,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardTitle,
                                children: activity.title
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/practice/page.tsx",
                                lineNumber: 64,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardDesc,
                                children: activity.description
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/practice/page.tsx",
                                lineNumber: 65,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardFooter,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].tag} ${tagStyle}`,
                                        children: activity.tag
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/practice/page.tsx",
                                        lineNumber: 67,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cta,
                                        children: activity.disabled ? 'Coming soon' : 'Open →'
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/practice/page.tsx",
                                        lineNumber: 68,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/practice/page.tsx",
                                lineNumber: 66,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true);
                    if (activity.disabled) {
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardDisabled}`,
                            children: body
                        }, activity.title, false, {
                            fileName: "[project]/apps/web/src/app/practice/page.tsx",
                            lineNumber: 75,
                            columnNumber: 15
                        }, this);
                    }
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: activity.href,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$app$2f$practice$2f$page$2e$module$2e$scss__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].card,
                        children: body
                    }, activity.href, false, {
                        fileName: "[project]/apps/web/src/app/practice/page.tsx",
                        lineNumber: 82,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/practice/page.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/practice/page.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/app/practice/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/web/src/app/practice/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7f0ffc50._.js.map
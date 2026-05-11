module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/apps/web/src/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QueryProvider",
    ()=>QueryProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
function QueryProvider({ children }) {
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClient"]({
            defaultOptions: {
                queries: {
                    staleTime: 60_000,
                    refetchOnWindowFocus: false
                }
            }
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/providers.tsx",
        lineNumber: 23,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const Button = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(function Button({ type = 'button', ...props }, ref) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ref: ref,
        type: type,
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/Button.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
});
Button.displayName = 'Button';
}),
"[project]/apps/web/src/components/ui/Field.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Field",
    ()=>Field
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const Field = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(function Field(props, ref) {
    if (props.as === 'textarea') {
        const { as, ...t } = props;
        void as;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
            ref: ref,
            ...t
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ui/Field.tsx",
            lineNumber: 29,
            columnNumber: 12
        }, this);
    }
    if (props.as === 'select') {
        const { as, children, ...s } = props;
        void as;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
            ref: ref,
            ...s,
            children: children
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ui/Field.tsx",
            lineNumber: 36,
            columnNumber: 7
        }, this);
    }
    if (props.as === 'checkbox') {
        const { as, ...c } = props;
        void as;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
            ref: ref,
            type: "checkbox",
            ...c
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ui/Field.tsx",
            lineNumber: 45,
            columnNumber: 12
        }, this);
    }
    const { as, ...i } = props;
    void as;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        ref: ref,
        ...i
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/Field.tsx",
        lineNumber: 50,
        columnNumber: 10
    }, this);
});
Field.displayName = 'Field';
}),
"[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "actionRow": "ui-module-scss-module__zUuJUW__actionRow",
  "actionRowAction": "ui-module-scss-module__zUuJUW__actionRowAction",
  "actionRowDescription": "ui-module-scss-module__zUuJUW__actionRowDescription",
  "actionRowInfo": "ui-module-scss-module__zUuJUW__actionRowInfo",
  "actionRowTitle": "ui-module-scss-module__zUuJUW__actionRowTitle",
  "badge": "ui-module-scss-module__zUuJUW__badge",
  "badgeAmber": "ui-module-scss-module__zUuJUW__badgeAmber",
  "badgeBlue": "ui-module-scss-module__zUuJUW__badgeBlue",
  "badgeGreen": "ui-module-scss-module__zUuJUW__badgeGreen",
  "badgeMd": "ui-module-scss-module__zUuJUW__badgeMd",
  "badgeNeutral": "ui-module-scss-module__zUuJUW__badgeNeutral",
  "badgeRose": "ui-module-scss-module__zUuJUW__badgeRose",
  "badgeSm": "ui-module-scss-module__zUuJUW__badgeSm",
  "emptyState": "ui-module-scss-module__zUuJUW__emptyState",
  "emptyStateDescription": "ui-module-scss-module__zUuJUW__emptyStateDescription",
  "emptyStateIcon": "ui-module-scss-module__zUuJUW__emptyStateIcon",
  "emptyStateTitle": "ui-module-scss-module__zUuJUW__emptyStateTitle",
  "featureCard": "ui-module-scss-module__zUuJUW__featureCard",
  "featureCardBody": "ui-module-scss-module__zUuJUW__featureCardBody",
  "featureCardDescription": "ui-module-scss-module__zUuJUW__featureCardDescription",
  "featureCardDisabled": "ui-module-scss-module__zUuJUW__featureCardDisabled",
  "featureCardFooter": "ui-module-scss-module__zUuJUW__featureCardFooter",
  "featureCardIcon": "ui-module-scss-module__zUuJUW__featureCardIcon",
  "featureCardTitle": "ui-module-scss-module__zUuJUW__featureCardTitle",
  "pageHeader": "ui-module-scss-module__zUuJUW__pageHeader",
  "pageHeaderSubtitle": "ui-module-scss-module__zUuJUW__pageHeaderSubtitle",
  "pageHeaderText": "ui-module-scss-module__zUuJUW__pageHeaderText",
  "pageHeaderTitle": "ui-module-scss-module__zUuJUW__pageHeaderTitle",
  "progressBar": "ui-module-scss-module__zUuJUW__progressBar",
  "progressFill": "ui-module-scss-module__zUuJUW__progressFill",
  "progressHeader": "ui-module-scss-module__zUuJUW__progressHeader",
  "progressLabel": "ui-module-scss-module__zUuJUW__progressLabel",
  "sectionHeader": "ui-module-scss-module__zUuJUW__sectionHeader",
  "sectionHeaderTitle": "ui-module-scss-module__zUuJUW__sectionHeaderTitle",
  "segmentedIcon": "ui-module-scss-module__zUuJUW__segmentedIcon",
  "segmentedOption": "ui-module-scss-module__zUuJUW__segmentedOption",
  "segmentedOptionActive": "ui-module-scss-module__zUuJUW__segmentedOptionActive",
  "segmentedRoot": "ui-module-scss-module__zUuJUW__segmentedRoot",
  "statIcon": "ui-module-scss-module__zUuJUW__statIcon",
  "statLabel": "ui-module-scss-module__zUuJUW__statLabel",
  "statSubtext": "ui-module-scss-module__zUuJUW__statSubtext",
  "statTile": "ui-module-scss-module__zUuJUW__statTile",
  "statTileInteractive": "ui-module-scss-module__zUuJUW__statTileInteractive",
  "statValue": "ui-module-scss-module__zUuJUW__statValue",
  "surfaceCard": "ui-module-scss-module__zUuJUW__surfaceCard",
  "surfaceCardCompact": "ui-module-scss-module__zUuJUW__surfaceCardCompact",
  "surfaceCardDefault": "ui-module-scss-module__zUuJUW__surfaceCardDefault",
  "switchThumb": "ui-module-scss-module__zUuJUW__switchThumb",
  "switchToggle": "ui-module-scss-module__zUuJUW__switchToggle",
  "switchToggleOn": "ui-module-scss-module__zUuJUW__switchToggleOn",
  "tabsList": "ui-module-scss-module__zUuJUW__tabsList",
  "tabsPanel": "ui-module-scss-module__zUuJUW__tabsPanel",
  "tabsRoot": "ui-module-scss-module__zUuJUW__tabsRoot",
  "tabsTrigger": "ui-module-scss-module__zUuJUW__tabsTrigger",
  "tabsTriggerActive": "ui-module-scss-module__zUuJUW__tabsTriggerActive",
});
}),
"[project]/apps/web/src/components/ui/PageHeader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PageHeader",
    ()=>PageHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
function PageHeader({ title, subtitle, actions, titleAs: TitleTag = 'h1', className, textClassName, titleClassName, subtitleClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].pageHeader,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].pageHeaderText,
                    textClassName
                ].filter(Boolean).join(' '),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TitleTag, {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].pageHeaderTitle,
                            titleClassName
                        ].filter(Boolean).join(' '),
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/PageHeader.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    subtitle ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].pageHeaderSubtitle,
                            subtitleClassName
                        ].filter(Boolean).join(' '),
                        children: subtitle
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/PageHeader.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ui/PageHeader.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            actions
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/PageHeader.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/Badge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
const variantClass = {
    neutral: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeNeutral,
    blue: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeBlue,
    green: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeGreen,
    amber: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeAmber,
    rose: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeRose
};
const sizeClass = {
    sm: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeSm,
    md: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeMd
};
function Badge({ children, variant = 'neutral', size = 'md', className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badge,
            sizeClass[size],
            variantClass[variant],
            className
        ].filter(Boolean).join(' '),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/Badge.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/StatTile.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatTile",
    ()=>StatTile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
function StatTile({ as: Tag = 'div', icon, label, value, subtext, interactive = false, className, iconClassName, labelClassName, valueClassName, subtextClassName, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tag, {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statTile,
            interactive ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statTileInteractive : '',
            className
        ].filter(Boolean).join(' '),
        ...props,
        children: [
            icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statIcon,
                    iconClassName
                ].filter(Boolean).join(' '),
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/StatTile.tsx",
                lineNumber: 36,
                columnNumber: 15
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statLabel,
                    labelClassName
                ].filter(Boolean).join(' '),
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/StatTile.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statValue,
                    valueClassName
                ].filter(Boolean).join(' '),
                children: value
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/StatTile.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            subtext ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statSubtext,
                    subtextClassName
                ].filter(Boolean).join(' '),
                children: subtext
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/StatTile.tsx",
                lineNumber: 39,
                columnNumber: 18
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/StatTile.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SurfaceCard",
    ()=>SurfaceCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
function SurfaceCard({ as: Tag = 'div', children, padding = 'default', className, ...props }) {
    const paddingClass = padding === 'default' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].surfaceCardDefault : padding === 'compact' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].surfaceCardCompact : '';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tag, {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].surfaceCard,
            paddingClass,
            className
        ].filter(Boolean).join(' '),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/SurfaceCard.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/SectionHeader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SectionHeader",
    ()=>SectionHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
;
function SectionHeader({ title, action, actionHref, actionLabel, className, titleClassName, actionClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionHeader,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionHeaderTitle,
                    titleClassName
                ].filter(Boolean).join(' '),
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/SectionHeader.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            action ?? (actionHref && actionLabel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: actionHref,
                className: actionClassName,
                children: actionLabel
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/SectionHeader.tsx",
                lineNumber: 29,
                columnNumber: 11
            }, this) : null)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/SectionHeader.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/FeatureCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeatureCard",
    ()=>FeatureCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
;
;
function FeatureCard({ title, description, icon, tag, tagVariant = 'neutral', cta, href, disabled = false, className, bodyClassName, iconClassName, titleClassName, descriptionClassName, footerClassName, ...props }) {
    const cardClassName = [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].featureCard,
        disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].featureCardDisabled : '',
        className
    ].filter(Boolean).join(' ');
    const body = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].featureCardBody,
            bodyClassName
        ].filter(Boolean).join(' '),
        children: [
            icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].featureCardIcon,
                    iconClassName
                ].filter(Boolean).join(' '),
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                lineNumber: 46,
                columnNumber: 15
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].featureCardTitle,
                    titleClassName
                ].filter(Boolean).join(' '),
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].featureCardDescription,
                    descriptionClassName
                ].filter(Boolean).join(' '),
                children: description
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                lineNumber: 49,
                columnNumber: 9
            }, this) : null,
            tag || cta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].featureCardFooter,
                    footerClassName
                ].filter(Boolean).join(' '),
                children: [
                    tag ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: tagVariant,
                        children: tag
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                        lineNumber: 55,
                        columnNumber: 18
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                        lineNumber: 55,
                        columnNumber: 62
                    }, this),
                    cta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: cta
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                        lineNumber: 56,
                        columnNumber: 18
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                lineNumber: 54,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
    if (href && !disabled) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            href: href,
            className: cardClassName,
            children: body
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
            lineNumber: 64,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: cardClassName,
        ...props,
        children: body
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/ProfileHero.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileHero",
    ()=>ProfileHero
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function ProfileHero({ avatar, name, meta, badges, stats, className, avatarClassName, infoClassName, nameClassName, metaClassName, badgesClassName, statsClassName, statClassName, statValueClassName, statLabelClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: avatarClassName,
                children: avatar
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: infoClassName,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: nameClassName,
                        children: name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    meta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: metaClassName,
                        children: meta
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                        lineNumber: 48,
                        columnNumber: 17
                    }, this) : null,
                    badges ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: badgesClassName,
                        children: badges
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                        lineNumber: 49,
                        columnNumber: 19
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: statsClassName,
                children: stats.map((stat, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: statClassName,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: statValueClassName,
                                children: stat.value
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: statLabelClassName,
                                children: stat.label
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                                lineNumber: 55,
                                columnNumber: 13
                            }, this)
                        ]
                    }, index, true, {
                        fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/AchievementCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AchievementCard",
    ()=>AchievementCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function AchievementCard({ icon, label, unlocked = false, className, unlockedClassName, lockedClassName, iconClassName, labelClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            className,
            unlocked ? unlockedClassName : lockedClassName
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: iconClassName,
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/AchievementCard.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: labelClassName,
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/AchievementCard.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/AchievementCard.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/DashboardLessonCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardLessonCard",
    ()=>DashboardLessonCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-ssr] (ecmascript)");
;
;
function DashboardLessonCard({ title, description, typeLabel, typeClassName, duration, difficulty, locked = false, className, lockedClassName, style, tagClassName, titleClassName, descClassName, footerClassName, metaClassName, metaItemClassName, lockOverlayClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            className,
            locked ? lockedClassName : ''
        ].filter(Boolean).join(' '),
        style: style,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                className: [
                    tagClassName,
                    typeClassName
                ].filter(Boolean).join(' '),
                children: typeLabel
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: titleClassName,
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: descClassName,
                children: description
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: footerClassName,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: metaClassName,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: metaItemClassName,
                            children: [
                                "⏱ ",
                                duration,
                                " min"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: metaItemClassName,
                            children: difficulty
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                    lineNumber: 49,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            locked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: lockOverlayClassName,
                children: "🔒 Locked"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                lineNumber: 54,
                columnNumber: 17
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/CalendarEventCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarEventCard",
    ()=>CalendarEventCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
;
;
;
function CalendarEventCard({ typeLabel, typeVariant = 'blue', statusLabel, statusVariant = 'neutral', title, time, teacherName, actionLabel, onAction, className, headerClassName, typeClassName, statusClassName, titleClassName, metaClassName, teacherClassName, actionsClassName, actionButtonClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: headerClassName,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                        className: typeClassName,
                        variant: typeVariant,
                        children: typeLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                        className: statusClassName,
                        variant: statusVariant,
                        children: statusLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: titleClassName,
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: metaClassName,
                children: [
                    "🕐 ",
                    time,
                    " (55 min)"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: teacherClassName,
                children: [
                    "👩‍🏫 ",
                    teacherName
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: actionsClassName,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: actionButtonClassName,
                    onClick: onAction,
                    children: actionLabel
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/Tabs.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tabs",
    ()=>Tabs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
function Tabs({ value, onValueChange, items, ariaLabel, className, listClassName, triggerClassName, activeTriggerClassName, panelClassName }) {
    const activeItem = items.find((item)=>item.value === value) ?? items[0];
    const useCustomTriggerStyles = Boolean(triggerClassName);
    const useCustomActiveStyles = Boolean(activeTriggerClassName);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabsRoot,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabsList,
                    listClassName
                ].filter(Boolean).join(' '),
                role: "tablist",
                "aria-label": ariaLabel,
                children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        role: "tab",
                        "aria-selected": item.value === activeItem?.value,
                        "aria-controls": `panel-${item.value}`,
                        id: `tab-${item.value}`,
                        disabled: item.disabled,
                        className: [
                            useCustomTriggerStyles ? '' : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabsTrigger,
                            triggerClassName,
                            item.value === activeItem?.value ? [
                                useCustomActiveStyles ? '' : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabsTriggerActive,
                                activeTriggerClassName
                            ].filter(Boolean).join(' ') : ''
                        ].filter(Boolean).join(' '),
                        onClick: ()=>onValueChange(item.value),
                        children: item.label
                    }, item.value, false, {
                        fileName: "[project]/apps/web/src/components/ui/Tabs.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Tabs.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            activeItem ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "tabpanel",
                id: `panel-${activeItem.value}`,
                "aria-labelledby": `tab-${activeItem.value}`,
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tabsPanel,
                    panelClassName
                ].filter(Boolean).join(' '),
                children: activeItem.panel
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Tabs.tsx",
                lineNumber: 71,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/Tabs.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/SegmentedControl.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SegmentedControl",
    ()=>SegmentedControl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
function SegmentedControl({ value, onValueChange, options, ariaLabel, className, optionClassName, activeOptionClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].segmentedRoot,
            className
        ].filter(Boolean).join(' '),
        role: "radiogroup",
        "aria-label": ariaLabel,
        children: options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                role: "radio",
                "aria-checked": value === option.value,
                disabled: option.disabled,
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].segmentedOption,
                    optionClassName,
                    value === option.value ? [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].segmentedOptionActive,
                        activeOptionClassName
                    ].filter(Boolean).join(' ') : ''
                ].filter(Boolean).join(' '),
                onClick: ()=>onValueChange(option.value),
                children: [
                    option.icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].segmentedIcon,
                        children: option.icon
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/SegmentedControl.tsx",
                        lineNumber: 52,
                        columnNumber: 26
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: option.label
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/SegmentedControl.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this)
                ]
            }, option.value, true, {
                fileName: "[project]/apps/web/src/components/ui/SegmentedControl.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/SegmentedControl.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/ProgressHeader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProgressHeader",
    ()=>ProgressHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
function ProgressHeader({ current, total, className, label, barClassName, fillClassName, labelClassName }) {
    const pct = total > 0 ? Math.max(0, Math.min(100, Math.round(current / total * 100))) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].progressHeader,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].progressBar,
                    barClassName
                ].filter(Boolean).join(' '),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].progressFill,
                        fillClassName
                    ].filter(Boolean).join(' '),
                    style: {
                        width: `${pct}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/ProgressHeader.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/ProgressHeader.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].progressLabel,
                    labelClassName
                ].filter(Boolean).join(' '),
                children: label ?? `${current} / ${total}`
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/ProgressHeader.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/ProgressHeader.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/EmptyStateCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyStateCard",
    ()=>EmptyStateCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
;
function EmptyStateCard({ title, description, icon, action, className, titleClassName, descriptionClassName, iconClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SurfaceCard"], {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyState,
            className
        ].filter(Boolean).join(' '),
        children: [
            icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyStateIcon,
                    iconClassName
                ].filter(Boolean).join(' '),
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/EmptyStateCard.tsx",
                lineNumber: 28,
                columnNumber: 15
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyStateTitle,
                    titleClassName
                ].filter(Boolean).join(' '),
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/EmptyStateCard.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyStateDescription,
                    descriptionClassName
                ].filter(Boolean).join(' '),
                children: description
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/EmptyStateCard.tsx",
                lineNumber: 31,
                columnNumber: 9
            }, this) : null,
            action
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/EmptyStateCard.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/ActionRow.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActionRow",
    ()=>ActionRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
function ActionRow({ title, description, action, className, infoClassName, titleClassName, descriptionClassName, actionClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actionRow,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actionRowInfo,
                    infoClassName
                ].filter(Boolean).join(' '),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actionRowTitle,
                            titleClassName
                        ].filter(Boolean).join(' '),
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/ActionRow.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actionRowDescription,
                            descriptionClassName
                        ].filter(Boolean).join(' '),
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/ActionRow.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ui/ActionRow.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actionRowAction,
                    actionClassName
                ].filter(Boolean).join(' '),
                children: action
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/ActionRow.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/ActionRow.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/SettingsToggleRow.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SettingsToggleRow",
    ()=>SettingsToggleRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
;
;
function SettingsToggleRow({ label, description, checked, onChange, className, infoClassName, labelClassName, descriptionClassName, toggleClassName, toggleOnClassName, thumbClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actionRow,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actionRowInfo,
                    infoClassName
                ].filter(Boolean).join(' '),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actionRowTitle,
                            labelClassName
                        ].filter(Boolean).join(' '),
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/SettingsToggleRow.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actionRowDescription,
                            descriptionClassName
                        ].filter(Boolean).join(' '),
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/SettingsToggleRow.tsx",
                        lineNumber: 37,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ui/SettingsToggleRow.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                type: "button",
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].switchToggle,
                    toggleClassName,
                    checked ? [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].switchToggleOn,
                        toggleOnClassName
                    ].filter(Boolean).join(' ') : ''
                ].filter(Boolean).join(' '),
                "aria-pressed": checked,
                onClick: ()=>onChange(!checked),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].switchThumb,
                        thumbClassName
                    ].filter(Boolean).join(' ')
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/SettingsToggleRow.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/SettingsToggleRow.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/SettingsToggleRow.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/PageHeader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/StatTile.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SectionHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SectionHeader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$FeatureCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/FeatureCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProfileHero$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ProfileHero.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AchievementCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$DashboardLessonCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/DashboardLessonCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$CalendarEventCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/CalendarEventCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SegmentedControl.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProgressHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ProgressHeader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/EmptyStateCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ActionRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ActionRow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SettingsToggleRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SettingsToggleRow.tsx [app-ssr] (ecmascript)");
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
;
;
;
;
;
}),
"[project]/apps/web/src/components/layout/Header.module.scss [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "avatar": "Header-module-scss-module__6CwoLq__avatar",
  "header": "Header-module-scss-module__6CwoLq__header",
  "lessonsBadge": "Header-module-scss-module__6CwoLq__lessonsBadge",
  "lessonsLbl": "Header-module-scss-module__6CwoLq__lessonsLbl",
  "lessonsNum": "Header-module-scss-module__6CwoLq__lessonsNum",
  "lessonsPlanned": "Header-module-scss-module__6CwoLq__lessonsPlanned",
  "logoArea": "Header-module-scss-module__6CwoLq__logoArea",
  "logoMark": "Header-module-scss-module__6CwoLq__logoMark",
  "logoName": "Header-module-scss-module__6CwoLq__logoName",
  "logoTag": "Header-module-scss-module__6CwoLq__logoTag",
  "logoTextBlock": "Header-module-scss-module__6CwoLq__logoTextBlock",
  "mid": "Header-module-scss-module__6CwoLq__mid",
  "right": "Header-module-scss-module__6CwoLq__right",
  "searchBox": "Header-module-scss-module__6CwoLq__searchBox",
});
}),
"[project]/apps/web/src/components/layout/Header.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/layout/Header.module.scss [app-ssr] (css module)");
'use client';
;
;
;
;
/** Placeholder; replace with API / billing when ready. */ const PAID_LESSONS_REMAINING_PLACEHOLDER = 12;
/** Placeholder; replace with API calendar stats when ready. */ const PLANNED_LESSONS_PLACEHOLDER = 4;
function Header() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].header,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logoArea,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logoMark,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            viewBox: "0 0 18 18",
                            fill: "none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M3 4h12M3 9h8M3 14h10",
                                    stroke: "white",
                                    strokeWidth: "1.8",
                                    strokeLinecap: "round"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 17,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "14",
                                    cy: "13.5",
                                    r: "2.5",
                                    fill: "#16a97a"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 18,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 16,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logoTextBlock,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logoName,
                                children: "SoEnglish"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 22,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logoTag,
                                children: "English Platform"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 23,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].mid,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].searchBox,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "15",
                            height: "15",
                            viewBox: "0 0 15 15",
                            fill: "none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "6.5",
                                    cy: "6.5",
                                    r: "4.5",
                                    stroke: "#b4b4cc",
                                    strokeWidth: "1.3"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 30,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M10 10l3 3",
                                    stroke: "#b4b4cc",
                                    strokeWidth: "1.3",
                                    strokeLinecap: "round"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 31,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                            type: "text",
                            placeholder: "Search lessons, words, topics..."
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 33,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].right,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsBadge,
                        title: "Paid lessons remaining in your current package",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "16",
                                height: "16",
                                viewBox: "0 0 16 16",
                                fill: "none",
                                "aria-hidden": true,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M4 3.5h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8a1 1 0 011-1z",
                                        stroke: "currentColor",
                                        strokeWidth: "1.3"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 43,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M5 6.5h6M5 9h4",
                                        stroke: "currentColor",
                                        strokeWidth: "1.3",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 48,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsNum,
                                children: PAID_LESSONS_REMAINING_PLACEHOLDER
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsLbl,
                                children: "lessons left"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsPlanned,
                                children: [
                                    "· ",
                                    PLANNED_LESSONS_PLACEHOLDER,
                                    " planned"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/profile",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].avatar,
                        children: "MK"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activeMockUser",
    ()=>activeMockUser,
    "activeRole",
    ()=>activeRole,
    "mockUsersByRole",
    ()=>mockUsersByRole
]);
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
const activeRole = process.env.NEXT_PUBLIC_MOCK_ROLE ?? 'teacher';
const activeMockUser = mockUsersByRole[activeRole];
}),
"[project]/apps/web/src/mocks/roles.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/apps/web/src/mocks/content/site-content.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/apps/web/src/mocks/domains/lessons.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/apps/web/src/mocks/domains/vocabulary.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/apps/web/src/mocks/domains/quiz.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/apps/web/src/mocks/domains/calendar.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarEventToScheduledLesson",
    ()=>calendarEventToScheduledLesson,
    "getStudentCalendarEvents",
    ()=>getStudentCalendarEvents,
    "getStudentScheduledLessons",
    ()=>getStudentScheduledLessons,
    "mockCalendarEvents",
    ()=>mockCalendarEvents,
    "mockScheduledLessons",
    ()=>mockScheduledLessons,
    "scheduledLessonToCalendarEvent",
    ()=>scheduledLessonToCalendarEvent
]);
const mockScheduledLessons = [
    {
        id: 'lesson-cal-1',
        lessonId: '1',
        title: 'Grammar: Conditionals',
        type: 'grammar',
        date: '2026-04-20',
        startTime: '10:00',
        endTime: '10:55',
        duration: 55,
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        studentId: 'student-1',
        studentName: 'Mykola K.',
        status: 'completed',
        credited: true,
        notes: 'Focus on mixed conditionals in work situations.',
        order: 1,
        recurrence: 'weekly',
        weeklyDays: [
            1,
            3
        ],
        seriesId: 'series-grammar-1'
    },
    {
        id: 'lesson-cal-2',
        lessonId: '3',
        title: 'Speaking: Project Proposal',
        type: 'speaking',
        date: '2026-04-22',
        startTime: '14:00',
        endTime: '14:55',
        duration: 55,
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        studentId: 'student-1',
        studentName: 'Mykola K.',
        status: 'planned',
        credited: false,
        notes: 'Pitch structure and Q&A simulation.',
        order: 1,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 'lesson-cal-3',
        lessonId: '2',
        title: 'Vocabulary: Finance Terms',
        type: 'vocabulary',
        date: '2026-04-21',
        startTime: '11:00',
        endTime: '11:55',
        duration: 55,
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        studentId: 'student-2',
        studentName: 'Olena P.',
        status: 'cancelled',
        cancelReason: 'student_requested_cancel',
        credited: false,
        order: 1,
        recurrence: 'weekly',
        weeklyDays: [
            2
        ],
        seriesId: 'series-vocab-1'
    }
];
function scheduledLessonToCalendarEvent(lesson) {
    return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        date: lesson.date,
        time: lesson.startTime,
        duration: lesson.duration,
        teacherId: lesson.teacherId,
        teacherName: lesson.teacherName,
        studentId: lesson.studentId,
        studentName: lesson.studentName,
        status: lesson.status === 'completed' ? 'confirmed' : 'pending'
    };
}
function calendarEventToScheduledLesson(eventItem) {
    const [hh, mm] = eventItem.time.split(':').map(Number);
    const endMinutes = hh * 60 + mm + eventItem.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    return {
        id: eventItem.id,
        title: eventItem.title,
        type: eventItem.type,
        date: eventItem.date,
        startTime: eventItem.time,
        endTime: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
        duration: eventItem.duration,
        teacherId: eventItem.teacherId,
        teacherName: eventItem.teacherName,
        studentId: eventItem.studentId,
        studentName: eventItem.studentName,
        status: eventItem.status === 'confirmed' ? 'completed' : 'planned',
        credited: eventItem.status === 'confirmed',
        order: 1,
        recurrence: 'none',
        weeklyDays: []
    };
}
const mockCalendarEvents = mockScheduledLessons.map(scheduledLessonToCalendarEvent);
function getStudentScheduledLessons(studentId) {
    return mockScheduledLessons.filter((lesson)=>lesson.studentId === studentId);
}
function getStudentCalendarEvents(studentId) {
    return getStudentScheduledLessons(studentId).map(scheduledLessonToCalendarEvent);
}
}),
"[project]/apps/web/src/mocks/domains/profile.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockPracticeActivities",
    ()=>mockPracticeActivities,
    "mockProfileAchievements",
    ()=>mockProfileAchievements,
    "mockProfileForm",
    ()=>mockProfileForm,
    "mockProfileGoals",
    ()=>mockProfileGoals
]);
const mockProfileForm = {
    name: 'Mykola Kovalenko',
    email: 'mykola@example.com',
    telegram: '@mykola',
    phone: '+380 67 123 4567',
    timezone: 'Europe/Kiev',
    nativeLanguage: 'Ukrainian',
    targetLevel: 'C1',
    weeklyGoal: '5',
    bio: 'Full-stack developer learning English for professional growth and international opportunities.'
};
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
}),
"[project]/apps/web/src/mocks/domains/students.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canManageStudent",
    ()=>canManageStudent,
    "getStudentById",
    ()=>getStudentById,
    "getVisibleStudents",
    ()=>getVisibleStudents,
    "mockStudents",
    ()=>mockStudents
]);
const mockStudents = [
    {
        id: 'student-1',
        fullName: 'Mykola Kovalenko',
        level: 'B2',
        email: 'mykola@example.com',
        phone: '+380 67 123 4567',
        timezone: 'Europe/Kyiv',
        notes: 'Focused on business communication and speaking confidence.',
        status: 'active',
        scheduleType: 'fixed',
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        wordsLearned: 847,
        lessonsCompleted: 38,
        streakDays: 14,
        achievements: [
            {
                icon: 'flame',
                label: '14-Day Streak',
                unlocked: true
            },
            {
                icon: 'book',
                label: '500 Words',
                unlocked: true
            },
            {
                icon: 'target',
                label: 'First Quiz',
                unlocked: true
            },
            {
                icon: 'trophy',
                label: 'Perfect Quiz',
                unlocked: false
            }
        ]
    },
    {
        id: 'student-2',
        fullName: 'Anna Vasylenko',
        level: 'B1',
        email: 'anna@example.com',
        phone: '+380 93 101 2200',
        timezone: 'Europe/Kyiv',
        notes: 'Needs extra grammar drills and weekly speaking practice.',
        status: 'active',
        scheduleType: 'flexible',
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        wordsLearned: 520,
        lessonsCompleted: 24,
        streakDays: 9,
        achievements: [
            {
                icon: 'flame',
                label: '7-Day Streak',
                unlocked: true
            },
            {
                icon: 'book',
                label: '500 Words',
                unlocked: true
            },
            {
                icon: 'message',
                label: 'Speaking Starter',
                unlocked: false
            },
            {
                icon: 'trophy',
                label: 'Perfect Quiz',
                unlocked: false
            }
        ]
    },
    {
        id: 'student-3',
        fullName: 'Dmytro Savchenko',
        level: 'A2',
        email: 'dmytro@example.com',
        phone: '+380 50 333 4455',
        timezone: 'Europe/Warsaw',
        notes: 'Beginner track, vocabulary-first plan.',
        status: 'paused',
        scheduleType: 'fixed',
        teacherId: 'teacher-2',
        teacherName: 'Michael Brown',
        wordsLearned: 180,
        lessonsCompleted: 12,
        streakDays: 3,
        achievements: [
            {
                icon: 'flame',
                label: '3-Day Streak',
                unlocked: true
            },
            {
                icon: 'book',
                label: '100 Words',
                unlocked: true
            },
            {
                icon: 'target',
                label: 'First Quiz',
                unlocked: false
            },
            {
                icon: 'message',
                label: 'Speaking Starter',
                unlocked: false
            }
        ]
    }
];
function getVisibleStudents(role, userId) {
    if (role === 'teacher') {
        return mockStudents.filter((student)=>student.teacherId === userId);
    }
    if (role === 'admin' || role === 'super-admin') {
        return mockStudents;
    }
    return [];
}
function getStudentById(studentId) {
    return mockStudents.find((student)=>student.id === studentId);
}
function canManageStudent(currentUser, student) {
    if (currentUser.role === 'teacher') {
        return student.teacherId === currentUser.id;
    }
    return currentUser.role === 'admin' || currentUser.role === 'super-admin';
}
}),
"[project]/apps/web/src/mocks/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/content/site-content.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/lessons.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$quiz$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/quiz.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/calendar.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$students$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/students.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
}),
"[project]/apps/web/src/components/layout/Sidebar.module.scss [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "active": "Sidebar-module-scss-module__j_pN4a__active",
  "badge": "Sidebar-module-scss-module__j_pN4a__badge",
  "badgeDot": "Sidebar-module-scss-module__j_pN4a__badgeDot",
  "badgeGreen": "Sidebar-module-scss-module__j_pN4a__badgeGreen",
  "collapsed": "Sidebar-module-scss-module__j_pN4a__collapsed",
  "flyoutBadge": "Sidebar-module-scss-module__j_pN4a__flyoutBadge",
  "flyoutBadgeGreen": "Sidebar-module-scss-module__j_pN4a__flyoutBadgeGreen",
  "flyoutPortal": "Sidebar-module-scss-module__j_pN4a__flyoutPortal",
  "icon": "Sidebar-module-scss-module__j_pN4a__icon",
  "iconWrap": "Sidebar-module-scss-module__j_pN4a__iconWrap",
  "item": "Sidebar-module-scss-module__j_pN4a__item",
  "itemLabel": "Sidebar-module-scss-module__j_pN4a__itemLabel",
  "itemRow": "Sidebar-module-scss-module__j_pN4a__itemRow",
  "nav": "Sidebar-module-scss-module__j_pN4a__nav",
  "section": "Sidebar-module-scss-module__j_pN4a__section",
  "sectionTitle": "Sidebar-module-scss-module__j_pN4a__sectionTitle",
  "sidebar": "Sidebar-module-scss-module__j_pN4a__sidebar",
  "toggleBtn": "Sidebar-module-scss-module__j_pN4a__toggleBtn",
  "toolbar": "Sidebar-module-scss-module__j_pN4a__toolbar",
});
}),
"[project]/apps/web/src/components/layout/Sidebar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/layout/Sidebar.module.scss [app-ssr] (css module)");
'use client';
;
;
;
;
;
;
;
;
const STORAGE_KEY = 'soenglish.sidebarCollapsed';
const navItems = [
    {
        section: 'Main',
        items: [
            {
                href: '/dashboard',
                label: 'Dashboard',
                icon: 'grid'
            },
            {
                href: '/practice',
                label: 'Practice',
                icon: 'practice'
            },
            {
                href: '/vocabulary',
                label: 'Vocabulary',
                icon: 'book',
                badge: '3'
            },
            {
                href: '/quiz',
                label: 'Quiz & Speaking',
                icon: 'quiz',
                badge: '4',
                badgeColor: 'green'
            }
        ]
    },
    {
        section: 'Schedule',
        items: [
            {
                href: '/calendar',
                label: 'Calendar',
                icon: 'calendar'
            },
            {
                href: '/students',
                label: 'Students',
                icon: 'students'
            }
        ]
    },
    {
        section: 'Account',
        items: [
            {
                href: '/profile',
                label: 'Profile & Settings',
                icon: 'profile'
            }
        ]
    }
];
const icons = {
    practice: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "9",
                cy: "9",
                r: "6.5",
                stroke: "currentColor",
                strokeWidth: "1.4"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "9",
                cy: "9",
                r: "3.2",
                stroke: "currentColor",
                strokeWidth: "1.4"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "9",
                cy: "9",
                r: "1.2",
                fill: "currentColor"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    grid: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "2",
                y: "2",
                width: "6",
                height: "6",
                rx: "1.5",
                fill: "currentColor"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "10",
                y: "2",
                width: "6",
                height: "6",
                rx: "1.5",
                fill: "currentColor",
                opacity: "0.5"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "2",
                y: "10",
                width: "6",
                height: "6",
                rx: "1.5",
                fill: "currentColor",
                opacity: "0.5"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "10",
                y: "10",
                width: "6",
                height: "6",
                rx: "1.5",
                fill: "currentColor",
                opacity: "0.3"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    book: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M9 3C7 3 5 3.5 4 4.5V14.5C5 13.5 7 13 9 13s4 .5 5 1.5V4.5C13 3.5 11 3 9 3z",
                stroke: "currentColor",
                strokeWidth: "1.4"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M9 3v10",
                stroke: "currentColor",
                strokeWidth: "1.4"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    quiz: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "9",
                cy: "9",
                r: "6",
                stroke: "currentColor",
                strokeWidth: "1.4"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2v1.5",
                stroke: "currentColor",
                strokeWidth: "1.4",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "9",
                cy: "13",
                r: "0.7",
                fill: "currentColor"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    calendar: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "2.5",
                y: "3.5",
                width: "13",
                height: "12",
                rx: "1.5",
                stroke: "currentColor",
                strokeWidth: "1.4"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M2.5 7.5h13M6 2v3M12 2v3",
                stroke: "currentColor",
                strokeWidth: "1.4",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    profile: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "9",
                cy: "7",
                r: "3",
                stroke: "currentColor",
                strokeWidth: "1.4"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 125,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M3 15c0-2.76 2.69-5 6-5s6 2.24 6 5",
                stroke: "currentColor",
                strokeWidth: "1.4",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 124,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    students: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "6",
                cy: "7",
                r: "2.2",
                stroke: "currentColor",
                strokeWidth: "1.3"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "7.5",
                r: "1.8",
                stroke: "currentColor",
                strokeWidth: "1.3"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 137,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M2.8 14c0-2 1.7-3.6 3.8-3.6h0.8c2.1 0 3.8 1.6 3.8 3.6",
                stroke: "currentColor",
                strokeWidth: "1.3",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M10 14c0-1.5 1.2-2.7 2.8-2.7h0.4c1.5 0 2.8 1.2 2.8 2.7",
                stroke: "currentColor",
                strokeWidth: "1.3",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0))
};
function CollapseIcon({ expanded }) {
    return expanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 18 18",
        fill: "none",
        "aria-hidden": true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 4.5v9M6 9l6-4.5M6 9l6 4.5",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M4.5 3.5v11",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 146,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 18 18",
        fill: "none",
        "aria-hidden": true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M6 4.5v9M12 9L6 4.5M12 9l-6 4.5",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M13.5 3.5v11",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 162,
        columnNumber: 5
    }, this);
}
function findNavItem(href) {
    for (const { items } of navItems){
        const item = items.find((i)=>i.href === href);
        if (item) return item;
    }
    return undefined;
}
function Sidebar() {
    const canSeeStudents = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'teacher' || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'admin' || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'super-admin';
    const visibleNavItems = navItems.map((section)=>({
            ...section,
            items: section.items.filter((item)=>item.href === '/students' ? canSeeStudents : true)
        }));
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hoveredHref, setHoveredHref] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [tipCoords, setTipCoords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const rowRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const syncTipPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((href)=>{
        if (!href) {
            setTipCoords(null);
            return;
        }
        const el = rowRefs.current.get(href);
        if (!el) {
            setTipCoords(null);
            return;
        }
        const r = el.getBoundingClientRect();
        setTipCoords({
            top: r.top + r.height / 2,
            left: r.right + 10
        });
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        if (!collapsed || !hoveredHref) {
            setTipCoords(null);
            return;
        }
        syncTipPosition(hoveredHref);
        const run = ()=>syncTipPosition(hoveredHref);
        window.addEventListener('scroll', run, true);
        window.addEventListener('resize', run);
        return ()=>{
            window.removeEventListener('scroll', run, true);
            window.removeEventListener('resize', run);
        };
    }, [
        collapsed,
        hoveredHref,
        syncTipPosition
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            if (("TURBOPACK compile-time value", "undefined") !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1') //TURBOPACK unreachable
            ;
        } catch  {
        /* ignore */ }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        document.documentElement.style.setProperty('--sidebar-w', collapsed ? '72px' : '240px');
        document.documentElement.setAttribute('data-sidebar-collapsed', collapsed ? 'true' : 'false');
        try {
            localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
        } catch  {
        /* ignore */ }
    }, [
        collapsed
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            document.documentElement.style.removeProperty('--sidebar-w');
            document.documentElement.removeAttribute('data-sidebar-collapsed');
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!collapsed) setHoveredHref(null);
    }, [
        collapsed
    ]);
    const hoveredItem = hoveredHref ? findNavItem(hoveredHref) : undefined;
    const showTip = collapsed && hoveredHref && tipCoords && hoveredItem && typeof document !== 'undefined';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebar} ${collapsed ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].collapsed : ''}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].nav,
                children: visibleNavItems.map(({ section, items })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].section,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                children: section
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                lineNumber: 289,
                                columnNumber: 13
                            }, this),
                            items.map(({ href, label, icon, badge, badgeColor })=>{
                                const active = pathname === href || href !== '/' && pathname.startsWith(href);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].itemRow,
                                    ref: (el)=>{
                                        if (el) rowRefs.current.set(href, el);
                                        else rowRefs.current.delete(href);
                                    },
                                    onMouseEnter: ()=>{
                                        if (collapsed) setHoveredHref(href);
                                    },
                                    onMouseLeave: ()=>{
                                        if (collapsed) setHoveredHref(null);
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: href,
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].item} ${active ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                        "aria-current": active ? 'page' : undefined,
                                        "aria-label": collapsed ? label : undefined,
                                        onFocus: ()=>{
                                            if (collapsed) setHoveredHref(href);
                                        },
                                        onBlur: ()=>{
                                            if (collapsed) setHoveredHref(null);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].iconWrap,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].icon,
                                                        children: icons[icon]
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 23
                                                    }, this),
                                                    collapsed && badge ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeDot
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                        lineNumber: 324,
                                                        columnNumber: 25
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                lineNumber: 321,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].itemLabel,
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                lineNumber: 327,
                                                columnNumber: 21
                                            }, this),
                                            !collapsed && badge ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badge} ${badgeColor === 'green' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeGreen : ''}`,
                                                children: badge
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                lineNumber: 329,
                                                columnNumber: 23
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                        lineNumber: 309,
                                        columnNumber: 19
                                    }, this)
                                }, href, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                    lineNumber: 295,
                                    columnNumber: 17
                                }, this);
                            })
                        ]
                    }, section, true, {
                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                        lineNumber: 288,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 286,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].toolbar,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].toggleBtn,
                    onClick: ()=>setCollapsed((c)=>!c),
                    "aria-expanded": !collapsed,
                    "aria-label": collapsed ? 'Expand sidebar' : 'Collapse sidebar',
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CollapseIcon, {
                        expanded: !collapsed
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                        lineNumber: 350,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                    lineNumber: 343,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 342,
                columnNumber: 7
            }, this),
            showTip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "tooltip",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flyoutPortal,
                style: {
                    top: tipCoords.top,
                    left: tipCoords.left
                },
                children: [
                    hoveredItem.label,
                    hoveredItem.badge ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flyoutBadge} ${hoveredItem.badgeColor === 'green' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flyoutBadgeGreen : ''}`,
                        children: hoveredItem.badge
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                        lineNumber: 366,
                        columnNumber: 15
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 356,
                columnNumber: 11
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 285,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__03d62371._.js.map
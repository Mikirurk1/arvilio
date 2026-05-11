module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/apps/web/src/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProviders",
    ()=>AppProviders,
    "QueryProvider",
    ()=>QueryProvider,
    "useAppearanceSettings",
    ()=>useAppearanceSettings
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
const THEME_KEY = 'soenglish.theme';
const FONT_SIZE_KEY = 'soenglish.fontSize';
const AppearanceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function resolveSystemTheme() {
    if ("TURBOPACK compile-time truthy", 1) return 'light';
    //TURBOPACK unreachable
    ;
}
function AppearanceProvider({ children }) {
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('auto');
    const [fontSize, setFontSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('medium');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const storedTheme = localStorage.getItem(THEME_KEY);
            if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto') {
                setTheme(storedTheme);
            }
            const storedFontSize = localStorage.getItem(FONT_SIZE_KEY);
            if (storedFontSize === 'small' || storedFontSize === 'medium' || storedFontSize === 'large') {
                setFontSize(storedFontSize);
            }
        } catch  {
        // ignore
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const root = document.documentElement;
        const applyTheme = ()=>{
            root.setAttribute('data-theme', theme === 'auto' ? resolveSystemTheme() : theme);
        };
        applyTheme();
        if (theme !== 'auto') return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = ()=>applyTheme();
        media.addEventListener('change', listener);
        return ()=>media.removeEventListener('change', listener);
    }, [
        theme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        document.documentElement.setAttribute('data-font-size', fontSize);
    }, [
        fontSize
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch  {
        // ignore
        }
    }, [
        theme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            localStorage.setItem(FONT_SIZE_KEY, fontSize);
        } catch  {
        // ignore
        }
    }, [
        fontSize
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            theme,
            setTheme,
            fontSize,
            setFontSize
        }), [
        theme,
        fontSize
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppearanceContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/providers.tsx",
        lineNumber: 103,
        columnNumber: 10
    }, this);
}
function AppProviders({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(QueryProvider, {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppearanceProvider, {
            children: children
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/providers.tsx",
            lineNumber: 109,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/providers.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
function useAppearanceSettings() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AppearanceContext);
    if (!context) {
        throw new Error('useAppearanceSettings must be used within AppProviders');
    }
    return context;
}
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
  "buttonBase": "ui-module-scss-module__zUuJUW__buttonBase",
  "buttonLoader": "ui-module-scss-module__zUuJUW__buttonLoader",
  "buttonLoadingWrap": "ui-module-scss-module__zUuJUW__buttonLoadingWrap",
  "buttonVariantDashed": "ui-module-scss-module__zUuJUW__buttonVariantDashed",
  "buttonVariantGhost": "ui-module-scss-module__zUuJUW__buttonVariantGhost",
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
  "tooltipArrow": "ui-module-scss-module__zUuJUW__tooltipArrow",
  "tooltipBottom": "ui-module-scss-module__zUuJUW__tooltipBottom",
  "tooltipLeft": "ui-module-scss-module__zUuJUW__tooltipLeft",
  "tooltipPortal": "ui-module-scss-module__zUuJUW__tooltipPortal",
  "tooltipRight": "ui-module-scss-module__zUuJUW__tooltipRight",
  "tooltipTop": "ui-module-scss-module__zUuJUW__tooltipTop",
  "uiButtonSpin": "ui-module-scss-module__zUuJUW__uiButtonSpin",
});
}),
"[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
'use client';
;
;
;
const Button = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(function Button({ variant = 'default', active = false, startIcon, endIcon, classNames = {}, className, style, onClick, loading = false, loadingAriaLabel, disabled: disabledProp, children, type = 'button', ...props }, ref) {
    const computedDisabled = loading ? true : disabledProp;
    const handleClick = (event)=>{
        if (!onClick || loading) return;
        if (Array.isArray(onClick)) {
            onClick.forEach((fn)=>fn());
            return;
        }
        onClick(event);
    };
    const rootClassName = [
        classNames.root,
        className,
        active ? classNames.active : undefined
    ].filter(Boolean).join(' ');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ref: ref,
        type: type,
        "data-variant": variant,
        "data-active": active ? 'true' : 'false',
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].buttonBase,
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"][`buttonVariant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
            rootClassName
        ].filter(Boolean).join(' '),
        style: style,
        onClick: handleClick,
        disabled: computedDisabled,
        ...props,
        children: [
            startIcon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: classNames.startIcon,
                "aria-hidden": true,
                children: startIcon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Button.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, this) : null,
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].buttonLoadingWrap,
                "aria-label": loadingAriaLabel,
                role: "status",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].buttonLoader
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Button.tsx",
                    lineNumber: 84,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Button.tsx",
                lineNumber: 83,
                columnNumber: 9
            }, this) : children ? classNames.text ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: classNames.text,
                children: children
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Button.tsx",
                lineNumber: 87,
                columnNumber: 27
            }, this) : children : null,
            endIcon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: classNames.endIcon,
                "aria-hidden": true,
                children: endIcon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Button.tsx",
                lineNumber: 90,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/Button.tsx",
        lineNumber: 64,
        columnNumber: 5
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
;
;
;
const Field = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(function Field(props, ref) {
    const generatedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const id = props.id ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [
        props.error ? errorId : '',
        props.hint && !props.error ? hintId : ''
    ].filter(Boolean).join(' ') || undefined;
    const isTextMode = Boolean(props.readOnly);
    const resolveReadonlyValue = ()=>{
        if (props.as === 'checkbox') {
            const checked = Boolean(props.checked);
            return props.formatValue ? props.formatValue(checked) : checked ? 'Yes' : 'No';
        }
        if (props.as === 'select') {
            const selected = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].toArray(props.children).find((child)=>{
                if (!/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"])(child)) return false;
                if (child.type !== 'option') return false;
                return String(child.props.value ?? '') === String(props.value ?? '');
            });
            const selectedLabel = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"])(selected) ? selected.props.children : props.value;
            return props.formatValue ? props.formatValue(selectedLabel) : selectedLabel ?? '—';
        }
        if (props.as === 'file-button') {
            return props.formatValue ? props.formatValue('') : '—';
        }
        const rawValue = props.value;
        if (props.formatValue) return props.formatValue(rawValue);
        if (rawValue === undefined || rawValue === null || rawValue === '') return '—';
        return String(rawValue);
    };
    if (isTextMode) {
        const textValue = resolveReadonlyValue();
        const asTextBlock = props.as === 'textarea';
        const className = 'className' in props ? props.className : undefined;
        return asTextBlock ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: className,
            children: textValue
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ui/Field.tsx",
            lineNumber: 96,
            columnNumber: 7
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: className,
            children: textValue
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ui/Field.tsx",
            lineNumber: 98,
            columnNumber: 7
        }, this);
    }
    if (props.as === 'textarea') {
        const { as, label, hint, error, id: _id, formatValue: _formatValue, ...t } = props;
        void as;
        void label;
        void hint;
        void error;
        void _id;
        void _formatValue;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    ref: ref,
                    id: id,
                    "aria-invalid": props.error ? true : undefined,
                    "aria-describedby": describedBy,
                    ...t
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this),
                props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: errorId,
                    children: props.error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 119,
                    columnNumber: 24
                }, this) : null,
                props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: hintId,
                    children: props.hint
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 120,
                    columnNumber: 39
                }, this) : null
            ]
        }, void 0, true);
    }
    if (props.as === 'select') {
        const { as, children, label, hint, error, id: _id, formatValue: _formatValue, ...s } = props;
        void as;
        void label;
        void hint;
        void error;
        void _id;
        void _formatValue;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                    ref: ref,
                    id: id,
                    "aria-invalid": props.error ? true : undefined,
                    "aria-describedby": describedBy,
                    ...s,
                    children: children
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 135,
                    columnNumber: 9
                }, this),
                props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: errorId,
                    children: props.error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 144,
                    columnNumber: 24
                }, this) : null,
                props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: hintId,
                    children: props.hint
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 145,
                    columnNumber: 39
                }, this) : null
            ]
        }, void 0, true);
    }
    if (props.as === 'checkbox') {
        const { as, label, hint, error, id: _id, formatValue: _formatValue, ...c } = props;
        void as;
        void label;
        void hint;
        void error;
        void _id;
        void _formatValue;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ref: ref,
                    id: id,
                    type: "checkbox",
                    "aria-invalid": props.error ? true : undefined,
                    "aria-describedby": describedBy,
                    ...c
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 160,
                    columnNumber: 9
                }, this),
                props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: errorId,
                    children: props.error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 168,
                    columnNumber: 24
                }, this) : null,
                props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: hintId,
                    children: props.hint
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 169,
                    columnNumber: 39
                }, this) : null
            ]
        }, void 0, true);
    }
    if (props.as === 'file-button') {
        const { as, buttonLabel = 'Choose files', onFilesSelected, className, label, hint, error, id: _id, formatValue: _formatValue, ...f } = props;
        void as;
        void label;
        void hint;
        void error;
        void _id;
        void _formatValue;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ref: ref,
                    id: id,
                    type: "file",
                    style: {
                        display: 'none'
                    },
                    "aria-invalid": props.error ? true : undefined,
                    "aria-describedby": describedBy,
                    onChange: (e)=>{
                        onFilesSelected?.(e.target.files);
                        e.currentTarget.value = '';
                    },
                    ...f
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 195,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: className,
                    "aria-controls": id,
                    disabled: Boolean(f.disabled),
                    onClick: (e)=>e.currentTarget.previousElementSibling?.click(),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: buttonLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                        lineNumber: 217,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 208,
                    columnNumber: 9
                }, this),
                props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: errorId,
                    children: props.error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 219,
                    columnNumber: 24
                }, this) : null,
                props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: hintId,
                    children: props.hint
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 220,
                    columnNumber: 39
                }, this) : null
            ]
        }, void 0, true);
    }
    const { as, label, hint, error, id: _id, formatValue: _formatValue, ...i } = props;
    void as;
    void label;
    void hint;
    void error;
    void _id;
    void _formatValue;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: ref,
                id: id,
                "aria-invalid": props.error ? true : undefined,
                "aria-describedby": describedBy,
                ...i
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                lineNumber: 234,
                columnNumber: 7
            }, this),
            props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                id: errorId,
                children: props.error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                lineNumber: 241,
                columnNumber: 22
            }, this) : null,
            props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                id: hintId,
                children: props.hint
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                lineNumber: 242,
                columnNumber: 37
            }, this) : null
        ]
    }, void 0, true);
});
Field.displayName = 'Field';
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
"[project]/apps/web/src/components/ui/Tooltip.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tooltip",
    ()=>Tooltip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
'use client';
;
;
;
;
function Tooltip({ open, content, targetEl, placement = 'top', className }) {
    const [coords, setCoords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        if (!open || !targetEl) {
            setCoords(null);
            return;
        }
        const updatePosition = ()=>{
            const rect = targetEl.getBoundingClientRect();
            if (placement === 'right') {
                setCoords({
                    top: rect.top + rect.height / 2,
                    left: rect.right + 10
                });
                return;
            }
            if (placement === 'left') {
                setCoords({
                    top: rect.top + rect.height / 2,
                    left: rect.left - 10
                });
                return;
            }
            if (placement === 'bottom') {
                setCoords({
                    top: rect.bottom + 8,
                    left: rect.left + rect.width / 2
                });
                return;
            }
            setCoords({
                top: rect.top - 8,
                left: rect.left + rect.width / 2
            });
        };
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return ()=>{
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [
        open,
        targetEl,
        placement
    ]);
    if (!open || !coords || typeof document === 'undefined') return null;
    const baseClass = {
        top: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tooltipTop,
        right: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tooltipRight,
        bottom: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tooltipBottom,
        left: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tooltipLeft
    }[placement];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tooltipPortal,
            baseClass,
            className
        ].filter(Boolean).join(' '),
        style: coords,
        role: "tooltip",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tooltipArrow,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Tooltip.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            content
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/Tooltip.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/apps/web/src/components/ui/AchievementCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AchievementCard",
    ()=>AchievementCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tooltip.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
function AchievementCard({ icon, label, description, unlocked = false, className, unlockedClassName, lockedClassName, iconClassName, labelClassName, tooltipClassName }) {
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [tooltipOpen, setTooltipOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: rootRef,
                className: [
                    className,
                    unlocked ? unlockedClassName : lockedClassName
                ].filter(Boolean).join(' '),
                tabIndex: description ? 0 : -1,
                onMouseEnter: ()=>{
                    if (description) setTooltipOpen(true);
                },
                onMouseLeave: ()=>setTooltipOpen(false),
                onFocus: ()=>{
                    if (description) setTooltipOpen(true);
                },
                onBlur: ()=>setTooltipOpen(false),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: iconClassName,
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/AchievementCard.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: labelClassName,
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/AchievementCard.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ui/AchievementCard.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                open: tooltipOpen && Boolean(description),
                targetEl: rootRef.current,
                content: description ?? '',
                placement: "top",
                className: tooltipClassName
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/AchievementCard.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
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
            typeLabel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                className: [
                    tagClassName,
                    typeClassName
                ].filter(Boolean).join(' '),
                children: typeLabel
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                lineNumber: 45,
                columnNumber: 20
            }, this) : null,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
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
                children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "ghost",
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
                        lineNumber: 43,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Tabs.tsx",
                lineNumber: 41,
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
                lineNumber: 73,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/Tabs.tsx",
        lineNumber: 40,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-ssr] (css module)");
;
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
        children: options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
                        lineNumber: 53,
                        columnNumber: 26
                    }, this) : null,
                    option.label
                ]
            }, option.value, true, {
                fileName: "[project]/apps/web/src/components/ui/SegmentedControl.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/SegmentedControl.tsx",
        lineNumber: 32,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tooltip.tsx [app-ssr] (ecmascript)");
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
;
}),
"[project]/apps/web/src/lib/avatar.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Fallback initials when `MockUser.avatar` has no `url` / `objectKey`. */ __turbopack_context__.s([
    "getAvatarFallbackInitials",
    ()=>getAvatarFallbackInitials
]);
function getAvatarFallbackInitials(fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
}),
"[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Role catalog: each entry has a stable id and a machine-friendly name (slug). */ __turbopack_context__.s([
    "PROFICIENCY_LEVEL",
    ()=>PROFICIENCY_LEVEL,
    "PROFICIENCY_LEVEL_ID_LIST",
    ()=>PROFICIENCY_LEVEL_ID_LIST,
    "TIME_ZONE",
    ()=>TIME_ZONE,
    "TIME_ZONE_ID_LIST",
    ()=>TIME_ZONE_ID_LIST,
    "USER_ACCOUNT_STATUS",
    ()=>USER_ACCOUNT_STATUS,
    "USER_ACCOUNT_STATUS_ID_LIST",
    ()=>USER_ACCOUNT_STATUS_ID_LIST,
    "USER_ROLE",
    ()=>USER_ROLE,
    "USER_ROLE_ID_LIST",
    ()=>USER_ROLE_ID_LIST,
    "VOCABULARY_WORD_STATUS_IDS",
    ()=>VOCABULARY_WORD_STATUS_IDS,
    "formatTimeZoneOptionLabel",
    ()=>formatTimeZoneOptionLabel,
    "getProficiencyLevelById",
    ()=>getProficiencyLevelById,
    "getTimeZoneById",
    ()=>getTimeZoneById,
    "getUserAccountStatusById",
    ()=>getUserAccountStatusById
]);
const USER_ROLE = {
    student: {
        id: 1,
        name: 'student'
    },
    teacher: {
        id: 2,
        name: 'teacher'
    },
    admin: {
        id: 3,
        name: 'admin'
    },
    superAdmin: {
        id: 4,
        name: 'super-admin'
    }
};
const USER_ROLE_ID_LIST = [
    USER_ROLE.student.id,
    USER_ROLE.teacher.id,
    USER_ROLE.admin.id,
    USER_ROLE.superAdmin.id
];
const PROFICIENCY_LEVEL = {
    a1: {
        id: 1,
        code: 'A1',
        label: 'Beginner'
    },
    a2: {
        id: 2,
        code: 'A2',
        label: 'Elementary'
    },
    b1: {
        id: 3,
        code: 'B1',
        label: 'Intermediate'
    },
    b2: {
        id: 4,
        code: 'B2',
        label: 'Upper intermediate'
    },
    c1: {
        id: 5,
        code: 'C1',
        label: 'Advanced'
    },
    c2: {
        id: 6,
        code: 'C2',
        label: 'Proficient'
    }
};
const PROFICIENCY_LEVEL_ID_LIST = [
    PROFICIENCY_LEVEL.a1.id,
    PROFICIENCY_LEVEL.a2.id,
    PROFICIENCY_LEVEL.b1.id,
    PROFICIENCY_LEVEL.b2.id,
    PROFICIENCY_LEVEL.c1.id,
    PROFICIENCY_LEVEL.c2.id
];
function getProficiencyLevelById(id) {
    for (const key of Object.keys(PROFICIENCY_LEVEL)){
        const entry = PROFICIENCY_LEVEL[key];
        if (entry.id === id) return entry;
    }
    return undefined;
}
const TIME_ZONE = {
    kyiv: {
        id: 1,
        iana: 'Europe/Kyiv',
        country: 'Ukraine',
        capital: 'Kyiv'
    },
    warsaw: {
        id: 2,
        iana: 'Europe/Warsaw',
        country: 'Poland',
        capital: 'Warsaw'
    },
    london: {
        id: 3,
        iana: 'Europe/London',
        country: 'United Kingdom',
        capital: 'London'
    },
    newYork: {
        id: 4,
        iana: 'America/New_York',
        country: 'United States',
        capital: 'New York'
    },
    tokyo: {
        id: 5,
        iana: 'Asia/Tokyo',
        country: 'Japan',
        capital: 'Tokyo'
    }
};
const TIME_ZONE_ID_LIST = [
    TIME_ZONE.kyiv.id,
    TIME_ZONE.warsaw.id,
    TIME_ZONE.london.id,
    TIME_ZONE.newYork.id,
    TIME_ZONE.tokyo.id
];
function getTimeZoneById(id) {
    for (const key of Object.keys(TIME_ZONE)){
        const entry = TIME_ZONE[key];
        if (entry.id === id) return entry;
    }
    return undefined;
}
function formatTimeZoneOptionLabel(entry) {
    return `${entry.country} — ${entry.capital} (${entry.iana})`;
}
const USER_ACCOUNT_STATUS = {
    active: {
        id: 1,
        name: 'active'
    },
    paused: {
        id: 2,
        name: 'paused'
    },
    leaved: {
        id: 3,
        name: 'leaved'
    },
    blocked: {
        id: 4,
        name: 'blocked'
    }
};
const USER_ACCOUNT_STATUS_ID_LIST = [
    USER_ACCOUNT_STATUS.active.id,
    USER_ACCOUNT_STATUS.paused.id,
    USER_ACCOUNT_STATUS.leaved.id,
    USER_ACCOUNT_STATUS.blocked.id
];
function getUserAccountStatusById(id) {
    for (const key of Object.keys(USER_ACCOUNT_STATUS)){
        const entry = USER_ACCOUNT_STATUS[key];
        if (entry.id === id) return entry;
    }
    return undefined;
}
const VOCABULARY_WORD_STATUS_IDS = {
    new: 1,
    learning: 2,
    known: 3
};
}),
"[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
;
}),
"[project]/apps/web/src/mocks/domains/achievements.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Achievement catalog (rules + stable ids). Per-user progress stores `unlockedAchievementIds`
 * on `ProfileStats`; counters live on each `MockUser.stats` in `domains/entities.ts`.
 */ __turbopack_context__.s([
    "buildProfileAchievements",
    ()=>buildProfileAchievements,
    "computeUnlockedAchievementIdsFromCounters",
    ()=>computeUnlockedAchievementIdsFromCounters,
    "emptyProfileStats",
    ()=>emptyProfileStats
]);
const emptyProfileStats = {
    wordsLearned: 0,
    lessonsCompleted: 0,
    streakDays: 0,
    quizzesCompleted: 0,
    perfectQuizCount: 0,
    speakingSessions: 0,
    weeklyGoalsCompleted: 0,
    unlockedAchievementIds: []
};
const profileAchievementRules = [
    {
        id: 'ach_welcome_aboard',
        icon: 'sparkles',
        label: 'Welcome Aboard',
        description: 'Open your profile for the first time.',
        isUnlocked: ()=>true
    },
    {
        id: 'ach_first_lesson',
        icon: 'graduation-cap',
        label: 'First Lesson',
        description: 'Complete your first lesson.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 1
    },
    {
        id: 'ach_10_lessons',
        icon: 'calendar-check',
        label: '10 Lessons Done',
        description: 'Complete 10 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 10
    },
    {
        id: 'ach_25_lessons',
        icon: 'calendar-check',
        label: '25 Lessons Done',
        description: 'Complete 25 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 25
    },
    {
        id: 'ach_streak_7',
        icon: 'flame',
        label: '7-Day Streak',
        description: 'Keep a 7-day learning streak.',
        isUnlocked: (stats)=>stats.streakDays >= 7
    },
    {
        id: 'ach_streak_14',
        icon: 'flame',
        label: '14-Day Streak',
        description: 'Keep a 14-day learning streak.',
        isUnlocked: (stats)=>stats.streakDays >= 14
    },
    {
        id: 'ach_streak_21',
        icon: 'mountain',
        label: '21-Day Streak',
        description: 'Keep a 21-day learning streak.',
        isUnlocked: (stats)=>stats.streakDays >= 21
    },
    {
        id: 'ach_streak_30',
        icon: 'mountain',
        label: '30-Day Streak',
        description: 'Keep a 30-day learning streak.',
        isUnlocked: (stats)=>stats.streakDays >= 30
    },
    {
        id: 'ach_words_100',
        icon: 'book-open',
        label: '100 Words',
        description: 'Learn 100 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 100
    },
    {
        id: 'ach_words_250',
        icon: 'book-open',
        label: '250 Words',
        description: 'Learn 250 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 250
    },
    {
        id: 'ach_words_500',
        icon: 'book-open',
        label: '500 Words',
        description: 'Learn 500 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 500
    },
    {
        id: 'ach_words_1000',
        icon: 'brain',
        label: '1000 Words',
        description: 'Learn 1000 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 1000
    },
    {
        id: 'ach_words_1500',
        icon: 'book-open',
        label: 'Word Collector',
        description: 'Learn 1500 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 1500
    },
    {
        id: 'ach_first_quiz',
        icon: 'target',
        label: 'First Quiz',
        description: 'Complete your first quiz.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 1
    },
    {
        id: 'ach_quizzes_5',
        icon: 'target',
        label: '5 Quizzes',
        description: 'Complete 5 quizzes.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 5
    },
    {
        id: 'ach_quizzes_10',
        icon: 'badge-check',
        label: '10 Quizzes',
        description: 'Complete 10 quizzes.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 10
    },
    {
        id: 'ach_quizzes_25',
        icon: 'target',
        label: 'Quiz Marathon',
        description: 'Complete 25 quizzes.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 25
    },
    {
        id: 'ach_perfect_quiz_1',
        icon: 'trophy',
        label: '100% Quiz',
        description: 'Get one perfect quiz score.',
        isUnlocked: (stats)=>stats.perfectQuizCount >= 1
    },
    {
        id: 'ach_perfect_quiz_3',
        icon: 'trophy',
        label: 'Perfect Trio',
        description: 'Get 3 perfect quiz scores.',
        isUnlocked: (stats)=>stats.perfectQuizCount >= 3
    },
    {
        id: 'ach_perfect_quiz_5',
        icon: 'trophy',
        label: 'Perfect 5',
        description: 'Get 5 perfect quiz scores.',
        isUnlocked: (stats)=>stats.perfectQuizCount >= 5
    },
    {
        id: 'ach_speaking_3',
        icon: 'messages-square',
        label: 'Conversation Starter',
        description: 'Complete 3 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 3
    },
    {
        id: 'ach_speaking_5',
        icon: 'messages-square',
        label: 'Conversation Buddy',
        description: 'Complete 5 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 5
    },
    {
        id: 'ach_speaking_10',
        icon: 'mic',
        label: 'Speaking Pro',
        description: 'Complete 10 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 10
    },
    {
        id: 'ach_speaking_20',
        icon: 'mic',
        label: 'Speaking Star',
        description: 'Complete 20 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 20
    },
    {
        id: 'ach_speaking_30',
        icon: 'mic',
        label: 'Speaking Master',
        description: 'Complete 30 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 30
    },
    {
        id: 'ach_lessons_30',
        icon: 'rocket',
        label: '30 Lessons Done',
        description: 'Complete 30 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 30
    },
    {
        id: 'ach_lessons_75',
        icon: 'rocket',
        label: '75 Lessons Done',
        description: 'Complete 75 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 75
    },
    {
        id: 'ach_quizzes_40',
        icon: 'crown',
        label: 'Quiz Expert',
        description: 'Complete 40 quizzes.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 40
    },
    {
        id: 'ach_perfect_quiz_10',
        icon: 'crown',
        label: 'Perfect Streak',
        description: 'Get 10 perfect quiz scores.',
        isUnlocked: (stats)=>stats.perfectQuizCount >= 10
    },
    {
        id: 'ach_consistency_master',
        icon: 'star',
        label: 'Consistency Master',
        description: 'Complete 25 lessons and keep a 14-day streak.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 25 && stats.streakDays >= 14
    },
    {
        id: 'ach_lessons_50',
        icon: 'calendar-check',
        label: '50 Lessons Done',
        description: 'Complete 50 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 50
    },
    {
        id: 'ach_elite_learner',
        icon: 'gem',
        label: 'Elite Learner',
        description: 'Learn 1000 words and complete 50 lessons.',
        isUnlocked: (stats)=>stats.wordsLearned >= 1000 && stats.lessonsCompleted >= 50
    }
];
function computeUnlockedAchievementIdsFromCounters(counters) {
    const synthetic = {
        ...counters,
        unlockedAchievementIds: []
    };
    return profileAchievementRules.filter((r)=>r.isUnlocked(synthetic)).map((r)=>r.id);
}
function buildProfileAchievements(stats) {
    return profileAchievementRules.map((rule)=>({
            icon: rule.icon,
            label: rule.label,
            description: rule.description,
            unlocked: stats.unlockedAchievementIds.includes(rule.id)
        }));
}
}),
"[project]/apps/web/src/mocks/domains/user-preferences.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Per-user notification & appearance preferences (mock persistence on `MockUser`).
 */ __turbopack_context__.s([
    "DEFAULT_APPEARANCE_PREFS",
    ()=>DEFAULT_APPEARANCE_PREFS,
    "DEFAULT_NOTIFICATION_PREFS",
    ()=>DEFAULT_NOTIFICATION_PREFS,
    "mergeAppearancePrefs",
    ()=>mergeAppearancePrefs,
    "mergeNotificationPrefs",
    ()=>mergeNotificationPrefs
]);
const DEFAULT_NOTIFICATION_PREFS = {
    lessonReminder: true,
    streakAlert: true,
    weeklyReport: true,
    newVocab: false,
    teacherMessages: true
};
const DEFAULT_APPEARANCE_PREFS = {
    theme: 'auto',
    fontSize: 'medium'
};
function mergeNotificationPrefs(partial) {
    return {
        ...DEFAULT_NOTIFICATION_PREFS,
        ...partial
    };
}
function mergeAppearancePrefs(partial) {
    return {
        ...DEFAULT_APPEARANCE_PREFS,
        ...partial
    };
}
}),
"[project]/apps/web/src/mocks/domains/entities.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockUsers",
    ()=>mockUsers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/achievements.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/user-preferences.ts [app-ssr] (ecmascript)");
;
;
;
function statsWithUnlocked(counters) {
    return {
        ...counters,
        unlockedAchievementIds: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeUnlockedAchievementIdsFromCounters"])(counters)
    };
}
let mockUsers = [
    {
        id: 1,
        role: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id,
        fullName: 'Mykola Kovalenko',
        email: 'mykola@example.com',
        avatar: {},
        proficiencyLevelId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"].b2.id,
        telegram: '@mykola',
        phone: '+380 67 123 4567',
        timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        nativeLanguage: 'Ukrainian',
        bio: 'Full-stack developer learning English for professional growth and international opportunities.',
        statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ACCOUNT_STATUS"].active.id,
        scheduleType: true,
        teacherId: 2,
        color: '#3b82c4',
        vocabulary: [
            {
                id: 1,
                vocabularyId: 1,
                statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].new
            },
            {
                id: 2,
                vocabularyId: 2,
                lessonId: 1,
                statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].learning
            },
            {
                id: 3,
                vocabularyId: 3,
                statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].known
            },
            {
                id: 4,
                vocabularyId: 4,
                statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].learning
            },
            {
                id: 5,
                vocabularyId: 5,
                lessonId: 4,
                statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].new
            }
        ],
        stats: statsWithUnlocked({
            wordsLearned: 847,
            lessonsCompleted: 38,
            streakDays: 14,
            quizzesCompleted: 12,
            perfectQuizCount: 0,
            speakingSessions: 16,
            weeklyGoalsCompleted: 2
        }),
        notificationPrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_NOTIFICATION_PREFS"]
        },
        appearancePrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_APPEARANCE_PREFS"],
            theme: 'dark'
        }
    },
    {
        id: 2,
        role: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id,
        fullName: 'Sarah Mitchell',
        email: 'sarah@example.com',
        avatar: {},
        proficiencyLevelId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"].c1.id,
        telegram: '',
        phone: '',
        timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        nativeLanguage: '',
        bio: '',
        teacherId: 0,
        vocabulary: [],
        notificationPrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_NOTIFICATION_PREFS"],
            teacherMessages: true
        },
        appearancePrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_APPEARANCE_PREFS"],
            theme: 'light'
        }
    },
    {
        id: 3,
        role: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id,
        fullName: 'Anna Vasylenko',
        email: 'anna@example.com',
        avatar: {},
        proficiencyLevelId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"].b1.id,
        telegram: '@anna',
        phone: '+380 93 101 2200',
        timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        nativeLanguage: 'Ukrainian',
        bio: 'Improving grammar confidence for product presentations.',
        statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ACCOUNT_STATUS"].active.id,
        scheduleType: false,
        teacherId: 2,
        color: '#16a97a',
        vocabulary: [
            {
                id: 6,
                vocabularyId: 1,
                statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].learning
            },
            {
                id: 7,
                vocabularyId: 3,
                lessonId: 14,
                statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].new
            }
        ],
        stats: statsWithUnlocked({
            wordsLearned: 520,
            lessonsCompleted: 24,
            streakDays: 9,
            quizzesCompleted: 8,
            perfectQuizCount: 0,
            speakingSessions: 7,
            weeklyGoalsCompleted: 1
        }),
        notificationPrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_NOTIFICATION_PREFS"],
            weeklyReport: false
        },
        appearancePrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_APPEARANCE_PREFS"],
            fontSize: 'large'
        }
    },
    {
        id: 4,
        role: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id,
        fullName: 'Dmytro Savchenko',
        email: 'dmytro@example.com',
        avatar: {},
        proficiencyLevelId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"].a2.id,
        telegram: '@dmytro',
        phone: '+380 50 333 4455',
        timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].warsaw.id,
        nativeLanguage: 'Ukrainian',
        bio: 'Beginner path with focus on vocabulary and listening.',
        statusId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ACCOUNT_STATUS"].paused.id,
        scheduleType: true,
        teacherId: 5,
        color: '#8b5cf6',
        vocabulary: [],
        stats: statsWithUnlocked({
            wordsLearned: 180,
            lessonsCompleted: 12,
            streakDays: 3,
            quizzesCompleted: 4,
            perfectQuizCount: 0,
            speakingSessions: 2,
            weeklyGoalsCompleted: 0
        }),
        notificationPrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_NOTIFICATION_PREFS"],
            lessonReminder: false,
            streakAlert: false
        },
        appearancePrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_APPEARANCE_PREFS"]
        }
    },
    {
        id: 5,
        role: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id,
        fullName: 'Michael Brown',
        email: 'michael@example.com',
        avatar: {},
        proficiencyLevelId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"].c1.id,
        telegram: '',
        phone: '',
        timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        nativeLanguage: '',
        bio: '',
        teacherId: 0,
        vocabulary: [],
        notificationPrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_NOTIFICATION_PREFS"]
        },
        appearancePrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_APPEARANCE_PREFS"]
        }
    },
    {
        id: 6,
        role: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].admin.id,
        fullName: 'Admin Manager',
        email: 'admin@example.com',
        avatar: {},
        proficiencyLevelId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"].c2.id,
        telegram: '',
        phone: '',
        timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        nativeLanguage: '',
        bio: '',
        teacherId: 0,
        vocabulary: [],
        notificationPrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_NOTIFICATION_PREFS"]
        },
        appearancePrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_APPEARANCE_PREFS"],
            theme: 'dark',
            fontSize: 'small'
        }
    },
    {
        id: 7,
        role: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].superAdmin.id,
        fullName: 'Platform Owner',
        email: 'owner@example.com',
        avatar: {},
        proficiencyLevelId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"].c2.id,
        telegram: '',
        phone: '',
        timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        nativeLanguage: '',
        bio: '',
        teacherId: 0,
        vocabulary: [],
        notificationPrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_NOTIFICATION_PREFS"]
        },
        appearancePrefs: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$user$2d$preferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_APPEARANCE_PREFS"]
        }
    }
];
}),
"[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activeMockUser",
    ()=>activeMockUser,
    "activeRole",
    ()=>activeRole,
    "activeSession",
    ()=>activeSession,
    "activeUser",
    ()=>activeUser,
    "mockUsers",
    ()=>mockUsers,
    "mockUsersByRole",
    ()=>mockUsersByRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/entities.ts [app-ssr] (ecmascript)");
;
;
function parseMockRoleFromEnv() {
    const raw = process.env.NEXT_PUBLIC_MOCK_ROLE;
    if (raw === undefined || raw === '') return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id;
    const n = Number(raw);
    if (Number.isFinite(n) && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE_ID_LIST"].includes(n)) {
        return n;
    }
    const legacy = {
        student: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id,
        teacher: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id,
        admin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].admin.id,
        'super-admin': __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].superAdmin.id
    };
    return legacy[raw] ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id;
}
const rolePreference = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE_ID_LIST"]
];
const resolveUserByRole = (role)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"].find((user)=>user.role === role);
const activeRole = parseMockRoleFromEnv();
const sessionRows = rolePreference.map((role)=>{
    const user = resolveUserByRole(role);
    if (!user) return null;
    return {
        id: `session-${role}`,
        userId: user.id,
        role
    };
}).filter((session)=>Boolean(session));
const mockUsersByRole = rolePreference.reduce((acc, role)=>{
    const user = resolveUserByRole(role);
    if (user) acc[role] = user;
    return acc;
}, {});
const fallbackUser = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"][0];
const resolvedActiveUser = mockUsersByRole[activeRole] ?? fallbackUser;
const activeSession = sessionRows.find((session)=>session.userId === resolvedActiveUser.id) ?? {
    id: 'session-fallback',
    userId: resolvedActiveUser.id,
    role: resolvedActiveUser.role
};
const activeUser = resolvedActiveUser;
const activeMockUser = activeUser;
const mockUsers = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"];
}),
"[project]/apps/web/src/mocks/roles.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canEdit",
    ()=>canEdit,
    "canManage",
    ()=>canManage,
    "canReviewHomework",
    ()=>canReviewHomework,
    "canSchedule",
    ()=>canSchedule,
    "canView",
    ()=>canView,
    "isAdminOrSuper",
    ()=>isAdminOrSuper,
    "isTeacherAdminOrSuper",
    ()=>isTeacherAdminOrSuper,
    "roleMatrix",
    ()=>roleMatrix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
;
/** Quick numeric id access for permission matrix. */ const U = {
    student: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id,
    teacher: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id,
    admin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].admin.id,
    superAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].superAdmin.id
};
const roleMatrix = {
    dashboard: {
        view: [
            U.student,
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        edit: [
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        manage: [
            U.admin,
            U.superAdmin
        ],
        schedule: [
            U.teacher,
            U.admin,
            U.superAdmin
        ]
    },
    profile: {
        view: [
            U.student,
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        edit: [
            U.student,
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        manage: [
            U.admin,
            U.superAdmin
        ],
        schedule: [
            U.teacher,
            U.admin,
            U.superAdmin
        ]
    },
    vocabulary: {
        view: [
            U.student,
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        edit: [
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        manage: [
            U.admin,
            U.superAdmin
        ],
        schedule: [
            U.teacher,
            U.admin,
            U.superAdmin
        ]
    },
    quiz: {
        view: [
            U.student,
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        edit: [
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        manage: [
            U.admin,
            U.superAdmin
        ],
        schedule: [
            U.teacher,
            U.admin,
            U.superAdmin
        ]
    },
    calendar: {
        view: [
            U.student,
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        edit: [
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        manage: [
            U.admin,
            U.superAdmin
        ],
        schedule: [
            U.teacher,
            U.admin,
            U.superAdmin
        ]
    },
    practice: {
        view: [
            U.student,
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        edit: [
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        manage: [
            U.admin,
            U.superAdmin
        ],
        schedule: [
            U.teacher,
            U.admin,
            U.superAdmin
        ]
    },
    lessons: {
        view: [
            U.student,
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        edit: [
            U.teacher,
            U.admin,
            U.superAdmin
        ],
        manage: [
            U.admin,
            U.superAdmin
        ],
        schedule: [
            U.teacher,
            U.admin,
            U.superAdmin
        ]
    }
};
const includes = (allowed, role)=>allowed.includes(role);
const canView = (scope, role)=>includes(roleMatrix[scope].view, role);
const canEdit = (scope, role)=>includes(roleMatrix[scope].edit, role);
const canManage = (scope, role)=>includes(roleMatrix[scope].manage, role);
const canSchedule = (scope, role)=>includes(roleMatrix[scope].schedule, role);
const canReviewHomework = (role)=>role === U.teacher || role === U.admin || role === U.superAdmin;
const isTeacherAdminOrSuper = (role)=>role === U.teacher || role === U.admin || role === U.superAdmin;
const isAdminOrSuper = (role)=>role === U.admin || role === U.superAdmin;
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
    /** Shared catalog for dashboard Practice tiles (same for every user). */ practiceActivities: [
        {
            id: 'activity-vocab',
            href: '/vocabulary',
            title: 'Vocabulary',
            description: 'Search and organize your words, track new vs known, and flip through flashcards to memorize faster.',
            icon: '📚',
            tag: 'Words',
            tagClass: 'tagGreen'
        },
        {
            id: 'activity-quiz',
            href: '/quiz',
            title: 'Quiz',
            description: 'Multiple-choice and fill-in questions on grammar and vocabulary with explanations after each answer.',
            icon: '🎯',
            tag: 'Grammar',
            tagClass: 'tagBlue'
        },
        {
            id: 'activity-speaking',
            href: '#',
            title: 'Speaking',
            description: 'Guided speaking prompts and pronunciation practice — we are preparing this mode for your level.',
            icon: '🎙️',
            tag: 'Soon',
            tagClass: 'tagMuted',
            disabled: true
        }
    ],
    quiz: {
        title: 'Quiz & Practice',
        subtitle: 'Test your grammar and vocabulary knowledge'
    },
    vocabulary: {
        title: 'Vocabulary'
    },
    calendar: {
        title: 'Calendar',
        lessonModal: {
            titleCreate: 'Plan lesson',
            titleEdit: 'Edit lesson',
            subtitle: 'Configure lesson details, status and recurrence.',
            sections: {
                setup: 'Lesson planning',
                content: 'Lesson content'
            },
            fields: {
                title: 'Title',
                date: 'Date',
                startTime: 'Start time',
                duration: 'Duration (min)',
                recurrence: 'Recurrence',
                status: 'Status',
                cancelReason: 'Cancel reason',
                credited: 'Credited',
                weekDays: 'Week days',
                student: 'Student',
                lessonPlan: 'Lesson plan',
                materials: 'Materials',
                homework: 'Homework',
                studentResponse: 'Student response',
                homeworkReview: 'Homework review',
                teacherHomeworkFeedback: 'Teacher feedback'
            },
            options: {
                noRepeat: 'No repeat',
                daily: 'Daily',
                weekly: 'Weekly',
                monthly: 'Monthly',
                planned: 'Planned',
                completed: 'Completed',
                cancelled: 'Cancelled',
                studentAbsent: 'Student absent',
                studentRequestedCancel: 'Student requested cancellation',
                teacherAbsent: 'Teacher absent',
                credited: 'Credited',
                notCredited: 'Not credited'
            },
            weekDays: {
                mon: 'Mon',
                tue: 'Tue',
                wed: 'Wed',
                thu: 'Thu',
                fri: 'Fri',
                sat: 'Sat',
                sun: 'Sun'
            },
            materialTypes: {
                text: 'Text',
                photo: 'Photo',
                test: 'Test',
                file: 'File',
                presentation: 'Presentation'
            },
            actions: {
                addFile: 'Add file',
                saveMaterial: 'Save material',
                cancel: 'Cancel',
                saveLesson: 'Save lesson',
                updateLesson: 'Update lesson',
                sendChangeRequest: 'Send change request',
                markHomeworkChecked: 'Mark as checked'
            },
            placeholders: {
                addText: 'Add text...'
            },
            messages: {
                blockedUnsafeFiles: 'Blocked unsafe files: {files}. Allowed: docs, slides, tables, text, images, pdf up to {max}MB.',
                rejectedFiles: 'Rejected: {files} (allowed up to {max}MB).'
            },
            homeworkCheckedStatus: 'Checked',
            materialsHint: 'Choose type, fill details and save',
            noMaterials: 'No materials added yet.',
            fallbackMaterialLabel: 'Material',
            aria: {
                sections: 'Lesson modal sections',
                unlinkSeries: 'Unlink series',
                deleteLesson: 'Delete lesson',
                closeModal: 'Close modal',
                removeFile: 'Remove file',
                removeMaterial: 'Remove material',
                closeImagePreview: 'Close image preview'
            },
            imagePreviewAlt: 'Material preview'
        }
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
    "getLessonsForAccount",
    ()=>getLessonsForAccount,
    "getLessonsForMock",
    ()=>getLessonsForMock,
    "getStudentScheduledLessons",
    ()=>getStudentScheduledLessons,
    "lessonEntities",
    ()=>lessonEntities,
    "mockLessons",
    ()=>mockLessons,
    "mockScheduledLessons",
    ()=>mockScheduledLessons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
;
const scheduleLessonsSeed = [
    {
        id: 1,
        lessonId: 1,
        title: 'Grammar: Conditionals',
        date: '2026-04-20',
        startTime: '10:00',
        endTime: '10:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 1,
        studentName: 'Mykola K.',
        status: 'completed',
        credited: true,
        notes: 'Focus on mixed conditionals in work situations.',
        lessonPlan: 'Warm-up: workplace scenarios. Practice first / second / mixed conditionals. Wrap-up Q&A.',
        materials: [
            {
                id: 'mat-1',
                kind: 'presentation',
                text: 'Mixed conditionals slides',
                files: [
                    'mixed-conditionals.pdf'
                ]
            }
        ],
        homework: {
            text: 'Write 6 sentences using mixed conditionals.',
            files: []
        },
        studentResponse: {
            text: 'Uploaded six sentences and two short emails.',
            files: [],
            status: 'accepted',
            homeworkChecked: true,
            teacherHomeworkFeedback: 'Nice work — your mixed conditionals are clear. Try varying one subjunctive for extra polish.'
        },
        linkedVocabularyIds: [
            2
        ],
        order: 1,
        recurrence: 'weekly',
        weeklyDays: [
            1,
            3
        ],
        seriesId: 'series-grammar-1'
    },
    {
        id: 2,
        lessonId: 3,
        title: 'Speaking: Project Proposal',
        date: '2026-04-22',
        startTime: '14:00',
        endTime: '14:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 1,
        studentName: 'Mykola K.',
        status: 'planned',
        credited: false,
        notes: 'Pitch structure and Q&A simulation. (Past slot — still planned in seed for edge-case testing.)',
        homework: {
            text: 'Prepare a 2-minute pitch outline for your current project.',
            files: []
        },
        order: 1,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 3,
        lessonId: 2,
        title: 'Vocabulary: Finance Terms',
        date: '2026-04-21',
        startTime: '11:00',
        endTime: '11:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 3,
        studentName: 'Anna V.',
        status: 'cancelled',
        cancelReason: 'student_requested_cancel',
        credited: false,
        order: 1,
        recurrence: 'weekly',
        weeklyDays: [
            2
        ],
        seriesId: 'series-vocab-1'
    },
    {
        id: 4,
        lessonId: 4,
        title: 'Listening: Conference Calls',
        date: '2026-04-18',
        startTime: '09:00',
        endTime: '09:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 1,
        studentName: 'Mykola K.',
        status: 'completed',
        credited: true,
        notes: 'Accent exposure (UK/US), note-taking drill.',
        homework: {
            text: 'Summarize one call in 5 bullet points + 3 new phrases you learned.',
            files: []
        },
        studentResponse: {
            text: 'Notes + summary uploaded; used phrases: circle back, touch base, action items.',
            files: [],
            status: 'submitted',
            homeworkChecked: false,
            teacherHomeworkFeedback: ''
        },
        order: 2,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 5,
        lessonId: 5,
        title: 'Vocabulary: Marketing Collocations',
        date: '2026-04-25',
        startTime: '16:30',
        endTime: '17:25',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 1,
        studentName: 'Mykola K.',
        status: 'completed',
        credited: true,
        notes: 'Chunk learning + spaced repetition cards.',
        homework: {
            text: 'Create 8 sentences using “launch”, “roll out”, “drill down”, “leverage”.',
            files: []
        },
        studentResponse: {
            text: 'Eight sentences in the doc — tried to vary structure.',
            files: [],
            status: 'needs_rework',
            homeworkChecked: true,
            teacherHomeworkFeedback: 'Good effort. Two collocations are slightly off — replace “drill down on a launch” and resubmit one paragraph.'
        },
        order: 3,
        recurrence: 'weekly',
        weeklyDays: [
            5
        ],
        seriesId: 'series-vocab-marketing'
    },
    {
        id: 6,
        lessonId: 6,
        title: 'Grammar: Present Perfect vs Past Simple',
        date: '2026-04-19',
        startTime: '12:00',
        endTime: '12:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 3,
        studentName: 'Anna V.',
        status: 'completed',
        credited: true,
        notes: 'Timeline clarity for resume and interviews.',
        order: 1,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 7,
        lessonId: 7,
        title: 'Speaking: Interview Simulation',
        date: '2026-05-24',
        startTime: '15:00',
        endTime: '15:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 3,
        studentName: 'Anna V.',
        status: 'planned',
        credited: false,
        notes: 'STAR method practice with follow-up questions.',
        order: 2,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 8,
        lessonId: 8,
        title: 'Vocabulary: Daily Routine & Time',
        date: '2026-04-17',
        startTime: '08:30',
        endTime: '09:25',
        duration: 55,
        teacherId: 5,
        teacherName: 'Michael Brown',
        studentId: 4,
        studentName: 'Dmytro S.',
        status: 'completed',
        credited: true,
        notes: 'Beginner-friendly chunks and short dialogues.',
        order: 1,
        recurrence: 'weekly',
        weeklyDays: [
            4
        ],
        seriesId: 'series-a2-routine'
    },
    {
        id: 9,
        lessonId: 9,
        title: 'Listening: Short News Clips',
        date: '2026-04-23',
        startTime: '17:00',
        endTime: '17:55',
        duration: 55,
        teacherId: 5,
        teacherName: 'Michael Brown',
        studentId: 4,
        studentName: 'Dmytro S.',
        status: 'planned',
        credited: false,
        notes: 'Gist + detail questions, slowed audio option.',
        order: 2,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 10,
        lessonId: 10,
        title: 'Grammar: Modal Verbs (permission & advice)',
        date: '2026-05-01',
        startTime: '10:00',
        endTime: '10:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 1,
        studentName: 'Mykola K.',
        status: 'completed',
        credited: true,
        notes: 'Polite requests in emails and stand-ups. Mock: completed but homework not submitted (student-1 testing).',
        lessonPlan: 'Review can/could/may/might/should. Role-play PM stand-up.',
        homework: {
            text: 'Rewrite 6 stiff sentences using softer modals (could / would you mind / we might need to).',
            files: []
        },
        studentResponse: {
            text: '',
            files: [],
            status: 'not_submitted',
            homeworkChecked: false,
            teacherHomeworkFeedback: ''
        },
        order: 4,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 11,
        lessonId: 11,
        title: 'Listening: Podcast Excerpt',
        date: '2026-05-02',
        startTime: '13:00',
        endTime: '13:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 3,
        studentName: 'Anna V.',
        status: 'cancelled',
        cancelReason: 'teacher_absent',
        credited: false,
        notes: 'Reschedule to next week — substitute teacher TBD.',
        order: 3,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 12,
        lessonId: 12,
        title: 'Speaking: Picture Description',
        date: '2026-04-26',
        startTime: '18:00',
        endTime: '18:55',
        duration: 55,
        teacherId: 5,
        teacherName: 'Michael Brown',
        studentId: 4,
        studentName: 'Dmytro S.',
        status: 'completed',
        credited: true,
        notes: 'Build confidence describing scenes with simple linking words.',
        homework: {
            text: 'Record a 90-second description of your room.',
            files: []
        },
        studentResponse: {
            text: 'Attached voice note.',
            files: [
                'room-description.m4a'
            ],
            status: 'submitted'
        },
        order: 3,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 13,
        lessonId: 13,
        title: 'Grammar: Articles & Determiners',
        date: '2026-04-28',
        startTime: '11:30',
        endTime: '12:25',
        duration: 55,
        teacherId: 5,
        teacherName: 'Michael Brown',
        studentId: 4,
        studentName: 'Dmytro S.',
        status: 'planned',
        credited: false,
        notes: 'Fix common article slips in written homework.',
        order: 4,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 14,
        lessonId: 14,
        title: 'Speaking: Stand-up Update (5 min)',
        date: '2026-04-29',
        startTime: '09:00',
        endTime: '09:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 3,
        studentName: 'Anna V.',
        status: 'completed',
        credited: true,
        notes: 'Yesterday / today / blockers template.',
        order: 4,
        recurrence: 'weekly',
        weeklyDays: [
            2
        ],
        seriesId: 'series-speaking-standup'
    },
    {
        id: 15,
        lessonId: 15,
        title: 'Vocabulary: Phrasal Verbs (work)',
        date: '2026-05-05',
        startTime: '14:30',
        endTime: '15:25',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 1,
        studentName: 'Mykola K.',
        status: 'planned',
        credited: false,
        notes: 'carry out, follow up, roll out — mini case study. Mock: upcoming lesson for student-1 (after “today” in dev: use May 2026+).',
        homework: {
            text: 'Write a short dialogue (8 lines) using at least 4 phrasal verbs from the list.',
            files: []
        },
        order: 5,
        recurrence: 'none',
        weeklyDays: []
    },
    /** Future lesson for `student-1` — use as “Your next lesson” when mock “today” is before this date. */ {
        id: 16,
        lessonId: 16,
        title: 'Writing: Formal Email (demo)',
        date: '2026-06-12',
        startTime: '11:00',
        endTime: '11:55',
        duration: 55,
        teacherId: 2,
        teacherName: 'Sarah Mitchell',
        studentId: 1,
        studentName: 'Mykola K.',
        status: 'planned',
        credited: false,
        notes: 'Student mock: future slot + homework before class (response opens after lesson is completed).',
        homework: {
            text: 'Draft a formal email requesting a meeting (120–150 words).',
            files: []
        },
        order: 6,
        recurrence: 'none',
        weeklyDays: []
    }
];
const mockScheduledLessons = scheduleLessonsSeed.map((l)=>({
        ...l,
        timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        description: l.description ?? l.notes ?? `Materials, homework, and updates for “${l.title}”.`
    }));
const lessonEntities = mockScheduledLessons;
const mockLessons = mockScheduledLessons.map((lesson)=>({
        id: lesson.lessonId ?? lesson.id,
        title: lesson.title,
        proficiencyLevelId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROFICIENCY_LEVEL"].b2.id,
        duration: lesson.duration,
        xp: 30,
        difficulty: 'medium',
        description: lesson.description ?? lesson.notes ?? `${lesson.title} lesson`,
        completed: lesson.status === 'completed',
        locked: false,
        visibilityByRole: [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].admin.id,
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].superAdmin.id
        ]
    }));
const getLessonsForMock = ()=>mockLessons;
const getLessonsForAccount = (_accountId)=>mockLessons;
function getStudentScheduledLessons(studentId) {
    return mockScheduledLessons.filter((lesson)=>lesson.studentId === studentId);
}
}),
"[project]/apps/web/src/mocks/domains/vocabulary.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createVocabularyWord",
    ()=>createVocabularyWord,
    "getVocabularyWordById",
    ()=>getVocabularyWordById,
    "legacyStatusToVocabularyStatusId",
    ()=>legacyStatusToVocabularyStatusId,
    "mockVocabularyWords",
    ()=>mockVocabularyWords,
    "vocabularyStatusIdToLegacy",
    ()=>vocabularyStatusIdToLegacy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
;
;
function vocabularyStatusIdToLegacy(statusId) {
    switch(statusId){
        case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].new:
            return 'new';
        case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].learning:
            return 'learning';
        case __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].known:
            return 'known';
        default:
            return 'new';
    }
}
function legacyStatusToVocabularyStatusId(status) {
    switch(status){
        case 'new':
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].new;
        case 'learning':
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].learning;
        case 'known':
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].known;
        default:
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].new;
    }
}
const vocabularySeed = [
    {
        id: 1,
        word: 'Eloquent',
        phonetic: '/ˈɛl.ə.kwənt/',
        pos: 'adjective',
        definition: 'Fluent and persuasive in speaking or writing.',
        example: 'She delivered an eloquent speech.',
        category: 'communication'
    },
    {
        id: 2,
        word: 'Leverage',
        phonetic: '/ˈlev.ər.ɪdʒ/',
        pos: 'verb / noun',
        definition: 'Use something to maximum advantage.',
        example: 'We need to leverage our network.',
        category: 'business'
    },
    {
        id: 3,
        word: 'Concise',
        phonetic: '/kənˈsaɪs/',
        pos: 'adjective',
        definition: 'Clear and brief.',
        example: 'Please be concise in your presentation.',
        category: 'communication'
    },
    {
        id: 4,
        word: 'Ambiguous',
        phonetic: '/æmˈbɪɡ.ju.əs/',
        pos: 'adjective',
        definition: 'Open to more than one interpretation.',
        example: 'The contract terms were ambiguous.',
        category: 'communication'
    },
    {
        id: 5,
        word: 'Coherent',
        phonetic: '/kəʊˈhɪə.rənt/',
        pos: 'adjective',
        definition: 'Logical and consistent.',
        example: 'She presented a coherent argument.',
        category: 'communication'
    }
];
const mockVocabularyWords = [
    ...vocabularySeed
];
function nextCatalogWordId() {
    return mockVocabularyWords.reduce((max, w)=>Math.max(max, w.id), 0) + 1;
}
function getVocabularyWordById(id) {
    return mockVocabularyWords.find((w)=>w.id === id);
}
function createVocabularyWord(partial) {
    const id = partial.id ?? nextCatalogWordId();
    const row = {
        id,
        word: partial.word,
        phonetic: partial.phonetic ?? '',
        pos: partial.pos ?? '—',
        definition: partial.definition ?? '',
        example: partial.example ?? '',
        category: partial.category ?? 'general'
    };
    mockVocabularyWords.push(row);
    return id;
}
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
    "mockCalendarEvents",
    ()=>mockCalendarEvents,
    "scheduledLessonToCalendarEvent",
    ()=>scheduledLessonToCalendarEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/lessons.ts [app-ssr] (ecmascript)");
;
;
function scheduledLessonToCalendarEvent(lesson) {
    return {
        id: lesson.id,
        title: lesson.title,
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
        date: eventItem.date,
        startTime: eventItem.time,
        endTime: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
        timezoneId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
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
const mockCalendarEvents = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockScheduledLessons"].map(scheduledLessonToCalendarEvent);
function getStudentCalendarEvents(studentId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStudentScheduledLessons"])(studentId).map(scheduledLessonToCalendarEvent);
}
}),
"[project]/apps/web/src/mocks/domains/goals.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Daily learning goals: bank by difficulty + deterministic pick per user/day (UTC date key). */ __turbopack_context__.s([
    "defaultGoalDateKey",
    ()=>defaultGoalDateKey,
    "getDailyGoalsForUser",
    ()=>getDailyGoalsForUser,
    "goalTemplates",
    ()=>goalTemplates
]);
const goalTemplates = [
    // Level 1 — light / quick
    {
        id: 'g1-a',
        difficulty: 1,
        text: 'Review 5 vocabulary flashcards'
    },
    {
        id: 'g1-b',
        difficulty: 1,
        text: 'Listen to one short English podcast clip (5 min)'
    },
    {
        id: 'g1-c',
        difficulty: 1,
        text: 'Write 3 sentences using words from last lesson'
    },
    {
        id: 'g1-d',
        difficulty: 1,
        text: 'Read one news headline aloud for pronunciation'
    },
    {
        id: 'g1-e',
        difficulty: 1,
        text: 'Match 6 words to pictures in the vocabulary app'
    },
    // Level 2 — moderate
    {
        id: 'g2-a',
        difficulty: 2,
        text: 'Complete one grammar exercise set (10 questions)'
    },
    {
        id: 'g2-b',
        difficulty: 2,
        text: 'Shadow a 2-minute dialogue from your course audio'
    },
    {
        id: 'g2-c',
        difficulty: 2,
        text: 'Summarize a short article in 4 bullet points in English'
    },
    {
        id: 'g2-d',
        difficulty: 2,
        text: 'Practice 15 quiz questions on mixed tenses'
    },
    {
        id: 'g2-e',
        difficulty: 2,
        text: 'Record a 1-minute intro about your week in English'
    },
    // Level 3 — challenging
    {
        id: 'g3-a',
        difficulty: 3,
        text: 'Draft an email to a colleague (120+ words)'
    },
    {
        id: 'g3-b',
        difficulty: 3,
        text: 'Participate in a 15-minute speaking session or mock interview'
    },
    {
        id: 'g3-c',
        difficulty: 3,
        text: 'Watch a talk without subtitles and note 8 keywords'
    },
    {
        id: 'g3-d',
        difficulty: 3,
        text: 'Write a short paragraph arguing one side of a debate topic'
    },
    {
        id: 'g3-e',
        difficulty: 3,
        text: 'Redo yesterday’s quiz until you score at least 80%'
    },
    // Level 4 — intensive
    {
        id: 'g4-a',
        difficulty: 4,
        text: 'Deliver a 5-minute spoken mini-presentation and self-review'
    },
    {
        id: 'g4-b',
        difficulty: 4,
        text: 'Complete a full mock exam section under timed conditions'
    },
    {
        id: 'g4-c',
        difficulty: 4,
        text: 'Peer-review and rewrite a complex text for clarity'
    },
    {
        id: 'g4-d',
        difficulty: 4,
        text: 'Research + present pros/cons of a topic in structured notes'
    },
    {
        id: 'g4-e',
        difficulty: 4,
        text: 'Transcribe a 3-minute native clip and compare your pronunciation'
    }
];
function hashToUInt(seed) {
    let h = 0;
    for(let i = 0; i < seed.length; i += 1){
        h = Math.imul(31, h) + seed.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}
function defaultGoalDateKey() {
    return new Date().toISOString().slice(0, 10);
}
function getDailyGoalsForUser(userId, dateKey = defaultGoalDateKey()) {
    const tiers = [
        1,
        2,
        3,
        4
    ];
    return tiers.map((difficulty)=>{
        const pool = goalTemplates.filter((t)=>t.difficulty === difficulty);
        const pick = pool.length > 0 ? pool[hashToUInt(`${String(userId)}|${dateKey}|${difficulty}`) % pool.length] : goalTemplates[0];
        return {
            id: `${pick.id}-${dateKey}`,
            text: pick.text,
            difficulty,
            done: false
        };
    });
}
}),
"[project]/apps/web/src/mocks/domains/profile.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addProfileVocabularyEntry",
    ()=>addProfileVocabularyEntry,
    "canManageProfile",
    ()=>canManageProfile,
    "countKnownWordsForUser",
    ()=>countKnownWordsForUser,
    "ensureLessonVocabularyForStudent",
    ()=>ensureLessonVocabularyForStudent,
    "getProfileAchievementsForUserId",
    ()=>getProfileAchievementsForUserId,
    "getProfileByUserId",
    ()=>getProfileByUserId,
    "getProfileFormByUserId",
    ()=>getProfileFormByUserId,
    "getProfileVocabularyForUser",
    ()=>getProfileVocabularyForUser,
    "getReviewWordsForUser",
    ()=>getReviewWordsForUser,
    "getVisibleProfiles",
    ()=>getVisibleProfiles,
    "joinProfileVocabulary",
    ()=>joinProfileVocabulary,
    "mockPracticeActivities",
    ()=>mockPracticeActivities,
    "mockProfileForm",
    ()=>mockProfileForm,
    "mockProfileGoals",
    ()=>mockProfileGoals,
    "mockProfileStats",
    ()=>mockProfileStats,
    "mockProfileStatsByAccount",
    ()=>mockProfileStatsByAccount,
    "mockProfileStatsByUserId",
    ()=>mockProfileStatsByUserId,
    "mockReviewWords",
    ()=>mockReviewWords,
    "syncLessonVocabularyToProfile",
    ()=>syncLessonVocabularyToProfile,
    "updateProfileVocabularyStatus",
    ()=>updateProfileVocabularyStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/content/site-content.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/achievements.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$goals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/goals.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/entities.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-ssr] (ecmascript) <locals>");
;
;
;
;
;
;
;
function nextProfileVocabularyRowId() {
    let max = 0;
    for (const user of __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"]){
        for (const row of user.vocabulary){
            if (row.id > max) max = row.id;
        }
    }
    return max + 1;
}
function getProfileVocabularyForUser(userId) {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"].find((u)=>u.id === userId);
    if (!user) return [];
    return user.vocabulary.map((row)=>({
            ...row,
            userId
        }));
}
function profileVocabularyRowKey(userId, vocabularyId, lessonId) {
    return `${userId}|${vocabularyId}|${lessonId ?? ''}`;
}
function joinProfileVocabulary(userId) {
    const out = [];
    for (const row of getProfileVocabularyForUser(userId)){
        const word = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVocabularyWordById"])(row.vocabularyId);
        if (word) out.push({
            row,
            word,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["vocabularyStatusIdToLegacy"])(row.statusId)
        });
    }
    return out;
}
function updateProfileVocabularyStatus(entryId, statusId) {
    for (const user of __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"]){
        const row = user.vocabulary.find((e)=>e.id === entryId);
        if (row) {
            row.statusId = statusId;
            return;
        }
    }
}
function addProfileVocabularyEntry(params) {
    const statusId = params.status ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["legacyStatusToVocabularyStatusId"])(params.status) : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].new;
    const key = profileVocabularyRowKey(params.userId, params.vocabularyId, params.lessonId);
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"].find((u)=>u.id === params.userId);
    if (!user) return 0;
    const existing = user.vocabulary.find((r)=>profileVocabularyRowKey(params.userId, r.vocabularyId, r.lessonId) === key);
    if (existing) return existing.id;
    const id = nextProfileVocabularyRowId();
    user.vocabulary.push({
        id,
        vocabularyId: params.vocabularyId,
        lessonId: params.lessonId,
        statusId
    });
    return id;
}
function ensureLessonVocabularyForStudent(params) {
    return addProfileVocabularyEntry({
        userId: params.userId,
        vocabularyId: params.vocabularyId,
        lessonId: params.lessonId,
        status: 'new'
    });
}
function syncLessonVocabularyToProfile(lesson) {
    const ids = lesson.linkedVocabularyIds;
    if (!ids?.length) return;
    for (const vocabularyId of ids){
        ensureLessonVocabularyForStudent({
            userId: lesson.studentId,
            lessonId: lesson.id,
            vocabularyId
        });
    }
}
function countKnownWordsForUser(userId) {
    return getProfileVocabularyForUser(userId).filter((r)=>r.statusId === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOCABULARY_WORD_STATUS_IDS"].known).length;
}
function getReviewWordsForUser(userId) {
    return joinProfileVocabulary(userId).map(({ row, word })=>({
            word: word.word,
            pos: word.pos,
            def: word.definition,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["vocabularyStatusIdToLegacy"])(row.statusId)
        }));
}
const mockReviewWords = getReviewWordsForUser(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeUser"].id);
const studentRecords = ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"].filter((u)=>u.role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id);
const toProfileViewModel = (userId)=>{
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"].find((entry)=>entry.id === userId);
    if (!user || user.role !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id || user.statusId === undefined || typeof user.scheduleType !== 'boolean') {
        return null;
    }
    const teacher = user.teacherId > 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"].find((entry)=>entry.id === user.teacherId) : undefined;
    const stats = user.stats;
    return {
        id: user.id,
        userId: user.id,
        fullName: user.fullName,
        proficiencyLevelId: user.proficiencyLevelId,
        email: user.email,
        phone: user.phone,
        timezoneId: user.timezoneId,
        color: user.color,
        statusId: user.statusId,
        scheduleType: user.scheduleType,
        teacherId: user.teacherId,
        teacherName: user.teacherId > 0 ? teacher?.fullName ?? 'Unknown teacher' : '',
        wordsLearned: countKnownWordsForUser(user.id),
        lessonsCompleted: stats?.lessonsCompleted ?? 0,
        streakDays: stats?.streakDays ?? 0
    };
};
const getProfileByUserId = (userId)=>toProfileViewModel(userId) ?? undefined;
const getVisibleProfiles = (role, userId)=>{
    if (role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id) {
        return studentRecords().filter((u)=>u.teacherId === userId).map((u)=>toProfileViewModel(u.id)).filter((entry)=>Boolean(entry));
    }
    if (role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].admin.id || role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].superAdmin.id) {
        return studentRecords().map((u)=>toProfileViewModel(u.id)).filter((entry)=>Boolean(entry));
    }
    if (role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id) {
        const own = toProfileViewModel(userId);
        return own ? [
            own
        ] : [];
    }
    return [];
};
const canManageProfile = (currentUser, profile)=>{
    if (currentUser.role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].teacher.id) return profile.teacherId === currentUser.id;
    return currentUser.role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].admin.id || currentUser.role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].superAdmin.id;
};
const getProfileFormByUserId = (userId)=>{
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"].find((entry)=>entry.id === userId);
    if (!user) {
        throw new Error(`User "${userId}" not found in mock users`);
    }
    return {
        name: user.fullName,
        email: user.email,
        telegram: user.telegram,
        phone: user.phone,
        timezoneId: user.timezoneId ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id,
        nativeLanguage: user.nativeLanguage || 'Ukrainian',
        proficiencyLevelId: user.proficiencyLevelId,
        bio: user.bio
    };
};
const mockProfileForm = getProfileFormByUserId(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeUser"].id);
const mockProfileStatsByUserId = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockUsers"].filter((u)=>u.stats).map((u)=>({
        userId: u.id,
        stats: u.stats
    }));
const mockProfileStatsByAccount = mockProfileStatsByUserId;
function getProfileAchievementsForUserId(userId) {
    const entry = mockProfileStatsByUserId.find((row)=>row.userId === userId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProfileAchievements"])(entry?.stats ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emptyProfileStats"]);
}
const activeStatsEntry = mockProfileStatsByUserId.find((entry)=>entry.userId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeUser"].id);
const mockProfileStats = activeStatsEntry?.stats ?? {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emptyProfileStats"]
};
const mockProfileGoals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$goals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDailyGoalsForUser"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeUser"].id).map((g)=>({
        text: g.text,
        done: g.done
    }));
const mockPracticeActivities = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["siteContent"].practiceActivities.map((activity)=>({
        href: activity.href,
        title: activity.title,
        description: activity.description,
        icon: activity.icon,
        tag: activity.tag,
        tagClass: activity.tagClass,
        disabled: 'disabled' in activity ? activity.disabled : undefined
    }));
}),
"[project]/apps/web/src/mocks/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/content/site-content.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/lessons.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$quiz$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/quiz.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/calendar.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$goals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/goals.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/achievements.ts [app-ssr] (ecmascript)");
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
"[project]/apps/web/src/lib/lessonTime.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getIanaForTimeZoneId",
    ()=>getIanaForTimeZoneId,
    "lessonDateKeyInZone",
    ()=>lessonDateKeyInZone,
    "lessonEndTimeInZone",
    ()=>lessonEndTimeInZone,
    "lessonEndUtc",
    ()=>lessonEndUtc,
    "lessonStartTimeInZone",
    ()=>lessonStartTimeInZone,
    "lessonStartUtc",
    ()=>lessonStartUtc,
    "moveLessonToViewerCalendarDay",
    ()=>moveLessonToViewerCalendarDay,
    "viewerSlotToLessonWall",
    ()=>viewerSlotToLessonWall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$addMinutes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/addMinutes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns-tz/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns-tz/dist/esm/formatInTimeZone/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$toDate$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns-tz/dist/esm/toDate/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/shared/types/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
;
;
;
function getIanaForTimeZoneId(id) {
    const resolved = id ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TIME_ZONE"].kyiv.id;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTimeZoneById"])(resolved)?.iana ?? 'Europe/Kyiv';
}
function lessonStartUtc(lesson) {
    const iana = getIanaForTimeZoneId(lesson.timezoneId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$toDate$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toDate"])(`${lesson.date}T${lesson.startTime}:00`, {
        timeZone: iana
    });
}
function lessonEndUtc(lesson) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$addMinutes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addMinutes"])(lessonStartUtc(lesson), lesson.duration);
}
function lessonDateKeyInZone(lesson, viewerIana) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInTimeZone"])(lessonStartUtc(lesson), viewerIana, 'yyyy-MM-dd');
}
function lessonStartTimeInZone(lesson, viewerIana) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInTimeZone"])(lessonStartUtc(lesson), viewerIana, 'HH:mm');
}
function lessonEndTimeInZone(lesson, viewerIana) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInTimeZone"])(lessonEndUtc(lesson), viewerIana, 'HH:mm');
}
function viewerSlotToLessonWall(viewerDate, viewerStartTime, duration, viewerIana, lessonTimezoneId) {
    const utc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$toDate$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toDate"])(`${viewerDate}T${viewerStartTime}:00`, {
        timeZone: viewerIana
    });
    const lessonIana = getIanaForTimeZoneId(lessonTimezoneId);
    const date = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInTimeZone"])(utc, lessonIana, 'yyyy-MM-dd');
    const startTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInTimeZone"])(utc, lessonIana, 'HH:mm');
    const endUtc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$addMinutes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addMinutes"])(utc, duration);
    const endTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInTimeZone"])(endUtc, lessonIana, 'HH:mm');
    return {
        date,
        startTime,
        endTime
    };
}
function moveLessonToViewerCalendarDay(lesson, newViewerDateStr, viewerIana) {
    const start = lessonStartUtc(lesson);
    const oldViewerTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInTimeZone"])(start, viewerIana, 'HH:mm');
    return viewerSlotToLessonWall(newViewerDateStr, oldViewerTime, lesson.duration, viewerIana, lesson.timezoneId);
}
}),
"[project]/apps/web/src/components/layout/Header.module.scss [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "avatar": "Header-module-scss-module__6CwoLq__avatar",
  "header": "Header-module-scss-module__6CwoLq__header",
  "headerCreateLesson": "Header-module-scss-module__6CwoLq__headerCreateLesson",
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$avatar$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/avatar.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/lessons.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/types/src/lib/shared-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns-tz/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns-tz/dist/esm/formatInTimeZone/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/lessonTime.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/layout/Header.module.scss [app-ssr] (css module)");
'use client';
;
;
;
;
;
;
;
;
const PAID_LESSONS_REMAINING_PLACEHOLDER = 12;
function Header() {
    const viewerIana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getIanaForTimeZoneId"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].timezoneId);
    const todayKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2d$tz$2f$dist$2f$esm$2f$formatInTimeZone$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInTimeZone"])(new Date(), viewerIana, 'yyyy-MM-dd');
    const nowTs = Date.now();
    const isActiveLesson = (status)=>status !== 'cancelled';
    const lessonsToday = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockScheduledLessons"].filter((lesson)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lessonDateKeyInZone"])(lesson, viewerIana) === todayKey && isActiveLesson(lesson.status));
    const remainingToday = lessonsToday.filter((lesson)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$lessonTime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lessonStartUtc"])(lesson).getTime() > nowTs);
    const plannedLessonsCount = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockScheduledLessons"].filter((lesson)=>lesson.status === 'planned').length;
    const creditedLessonsCount = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockScheduledLessons"].filter((lesson)=>lesson.credited).length;
    const lessonsLeft = Math.max(0, PAID_LESSONS_REMAINING_PLACEHOLDER - creditedLessonsCount);
    const myTodayCount = lessonsToday.filter((lesson)=>lesson.teacherId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].id).length;
    const myRemainingCount = remainingToday.filter((lesson)=>lesson.teacherId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].id).length;
    const totalTodayCount = lessonsToday.length;
    const totalRemainingCount = remainingToday.length;
    const showTotalForAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAdminOrSuper"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role) && (myTodayCount !== totalTodayCount || myRemainingCount !== totalRemainingCount);
    const showCreateLesson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canSchedule"])('lessons', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role);
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
                                    lineNumber: 45,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "14",
                                    cy: "13.5",
                                    r: "2.5",
                                    fill: "#16a97a"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 46,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 43,
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
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logoTag,
                                children: "English Platform"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                lineNumber: 42,
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
                                    lineNumber: 58,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M10 10l3 3",
                                    stroke: "#b4b4cc",
                                    strokeWidth: "1.3",
                                    strokeLinecap: "round"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 59,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Field"], {
                            type: "text",
                            placeholder: "Search lessons, words, topics..."
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].right,
                children: [
                    showCreateLesson ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/lessons?create=1",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].headerCreateLesson,
                        children: "Create lesson"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 67,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsBadge,
                        title: "Today lessons statistics",
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
                                        lineNumber: 76,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M5 6.5h6M5 9h4",
                                        stroke: "currentColor",
                                        strokeWidth: "1.3",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 81,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$types$2f$src$2f$lib$2f$shared$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_ROLE"].student.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsNum,
                                        children: lessonsLeft
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 85,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsLbl,
                                        children: "lessons left"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 86,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsPlanned,
                                        children: [
                                            "· ",
                                            plannedLessonsCount,
                                            " planned"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 87,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsLbl,
                                        children: [
                                            "My: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsNum,
                                                children: myTodayCount
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                                lineNumber: 92,
                                                columnNumber: 21
                                            }, this),
                                            " today"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 91,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsPlanned,
                                        children: [
                                            "· ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsNum,
                                                children: myRemainingCount
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                                lineNumber: 95,
                                                columnNumber: 19
                                            }, this),
                                            " left"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 94,
                                        columnNumber: 15
                                    }, this),
                                    showTotalForAdmin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].lessonsPlanned,
                                        children: [
                                            "· Total: ",
                                            totalTodayCount,
                                            " today / ",
                                            totalRemainingCount,
                                            " left"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 98,
                                        columnNumber: 17
                                    }, this) : null
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/profile",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].avatar,
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].avatar.url ? // eslint-disable-next-line @next/next/no-img-element
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].avatar.url,
                            alt: "",
                            width: 36,
                            height: 36
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 108,
                            columnNumber: 13
                        }, this) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$avatar$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAvatarFallbackInitials"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].fullName)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
        lineNumber: 41,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tooltip.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/layout/Sidebar.module.scss [app-ssr] (css module)");
'use client';
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
                href: '/lessons',
                label: 'Lessons',
                icon: 'lessons'
            },
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
    }, ("TURBOPACK compile-time value", void 0)),
    lessons: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "2.5",
                y: "3",
                width: "13",
                height: "12",
                rx: "1.8",
                stroke: "currentColor",
                strokeWidth: "1.3"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M6 6.5h6M6 9h6M6 11.5h4",
                stroke: "currentColor",
                strokeWidth: "1.3",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 143,
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
                lineNumber: 153,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M4.5 3.5v11",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 152,
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
                lineNumber: 169,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M13.5 3.5v11",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 168,
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
    const canSeeStudents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTeacherAdminOrSuper"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeMockUser"].role);
    const visibleNavItems = navItems.map((section)=>({
            ...section,
            items: section.items.filter((item)=>item.href === '/students' ? canSeeStudents : true)
        }));
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hoveredHref, setHoveredHref] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const rowRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
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
    const hoveredEl = hoveredHref ? rowRefs.current.get(hoveredHref) ?? null : null;
    const showTip = collapsed && hoveredHref && hoveredItem && typeof document !== 'undefined';
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
                                lineNumber: 259,
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
                                                        lineNumber: 292,
                                                        columnNumber: 23
                                                    }, this),
                                                    collapsed && badge ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeDot
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                        lineNumber: 294,
                                                        columnNumber: 25
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                lineNumber: 291,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].itemLabel,
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                lineNumber: 297,
                                                columnNumber: 21
                                            }, this),
                                            !collapsed && badge ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badge} ${badgeColor === 'green' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badgeGreen : ''}`,
                                                children: badge
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                lineNumber: 299,
                                                columnNumber: 23
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                        lineNumber: 279,
                                        columnNumber: 19
                                    }, this)
                                }, href, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                    lineNumber: 265,
                                    columnNumber: 17
                                }, this);
                            })
                        ]
                    }, section, true, {
                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                        lineNumber: 258,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 256,
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
                        lineNumber: 320,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                    lineNumber: 313,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 312,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                open: Boolean(showTip),
                targetEl: hoveredEl,
                placement: "right",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flyoutPortal,
                content: hoveredItem ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        hoveredItem.label,
                        hoveredItem.badge ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flyoutBadge} ${hoveredItem.badgeColor === 'green' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flyoutBadgeGreen : ''}`,
                            children: hoveredItem.badge
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                            lineNumber: 334,
                            columnNumber: 17
                        }, void 0) : null
                    ]
                }, void 0, true) : null
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 324,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 255,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bcbe6736._.js.map
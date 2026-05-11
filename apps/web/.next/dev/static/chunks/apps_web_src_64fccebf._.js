(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web/src/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProviders",
    ()=>AppProviders,
    "QueryProvider",
    ()=>QueryProvider,
    "useAppearanceSettings",
    ()=>useAppearanceSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
function QueryProvider({ children }) {
    _s();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "QueryProvider.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        staleTime: 60_000,
                        refetchOnWindowFocus: false
                    }
                }
            })
    }["QueryProvider.useState"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/providers.tsx",
        lineNumber: 23,
        columnNumber: 10
    }, this);
}
_s(QueryProvider, "gDZdEvQuu6JGUAFcWAosmkw2/Ug=");
_c = QueryProvider;
const THEME_KEY = 'soenglish.theme';
const FONT_SIZE_KEY = 'soenglish.fontSize';
const AppearanceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function resolveSystemTheme() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function AppearanceProvider({ children }) {
    _s1();
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('auto');
    const [fontSize, setFontSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('medium');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
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
        }
    }["AppearanceProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
            const root = document.documentElement;
            const applyTheme = {
                "AppearanceProvider.useEffect.applyTheme": ()=>{
                    root.setAttribute('data-theme', theme === 'auto' ? resolveSystemTheme() : theme);
                }
            }["AppearanceProvider.useEffect.applyTheme"];
            applyTheme();
            if (theme !== 'auto') return;
            const media = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = {
                "AppearanceProvider.useEffect.listener": ()=>applyTheme()
            }["AppearanceProvider.useEffect.listener"];
            media.addEventListener('change', listener);
            return ({
                "AppearanceProvider.useEffect": ()=>media.removeEventListener('change', listener)
            })["AppearanceProvider.useEffect"];
        }
    }["AppearanceProvider.useEffect"], [
        theme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
            document.documentElement.setAttribute('data-font-size', fontSize);
        }
    }["AppearanceProvider.useEffect"], [
        fontSize
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
            try {
                localStorage.setItem(THEME_KEY, theme);
            } catch  {
            // ignore
            }
        }
    }["AppearanceProvider.useEffect"], [
        theme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
            try {
                localStorage.setItem(FONT_SIZE_KEY, fontSize);
            } catch  {
            // ignore
            }
        }
    }["AppearanceProvider.useEffect"], [
        fontSize
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AppearanceProvider.useMemo[value]": ()=>({
                theme,
                setTheme,
                fontSize,
                setFontSize
            })
    }["AppearanceProvider.useMemo[value]"], [
        theme,
        fontSize
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppearanceContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/providers.tsx",
        lineNumber: 103,
        columnNumber: 10
    }, this);
}
_s1(AppearanceProvider, "iVtN/T98Ua1rHPrOcCcA7acvrbA=");
_c1 = AppearanceProvider;
function AppProviders({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(QueryProvider, {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppearanceProvider, {
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
_c2 = AppProviders;
function useAppearanceSettings() {
    _s2();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AppearanceContext);
    if (!context) {
        throw new Error('useAppearanceSettings must be used within AppProviders');
    }
    return context;
}
_s2(useAppearanceSettings, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "QueryProvider");
__turbopack_context__.k.register(_c1, "AppearanceProvider");
__turbopack_context__.k.register(_c2, "AppProviders");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)", ((__turbopack_context__) => {

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
"[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
'use client';
;
;
;
const Button = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = function Button({ variant = 'default', active = false, startIcon, endIcon, classNames = {}, className, style, onClick, loading = false, loadingAriaLabel, disabled: disabledProp, children, type = 'button', ...props }, ref) {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ref: ref,
        type: type,
        "data-variant": variant,
        "data-active": active ? 'true' : 'false',
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].buttonBase,
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"][`buttonVariant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
            rootClassName
        ].filter(Boolean).join(' '),
        style: style,
        onClick: handleClick,
        disabled: computedDisabled,
        ...props,
        children: [
            startIcon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: classNames.startIcon,
                "aria-hidden": true,
                children: startIcon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Button.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, this) : null,
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].buttonLoadingWrap,
                "aria-label": loadingAriaLabel,
                role: "status",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].buttonLoader
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Button.tsx",
                    lineNumber: 84,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Button.tsx",
                lineNumber: 83,
                columnNumber: 9
            }, this) : children ? classNames.text ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: classNames.text,
                children: children
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Button.tsx",
                lineNumber: 87,
                columnNumber: 27
            }, this) : children : null,
            endIcon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
_c1 = Button;
Button.displayName = 'Button';
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/Field.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Field",
    ()=>Field
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
const Field = /*#__PURE__*/ _s((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = _s(function Field(props, ref) {
    _s();
    const generatedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])();
    const id = props.id ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [
        props.error ? errorId : '',
        props.hint && !props.error ? hintId : ''
    ].filter(Boolean).join(' ') || undefined;
    if (props.as === 'textarea') {
        const { as, label, hint, error, id: _id, ...t } = props;
        void as;
        void label;
        void hint;
        void error;
        void _id;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    ref: ref,
                    id: id,
                    "aria-invalid": props.error ? true : undefined,
                    "aria-describedby": describedBy,
                    ...t
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 62,
                    columnNumber: 9
                }, this),
                props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: errorId,
                    children: props.error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 69,
                    columnNumber: 24
                }, this) : null,
                props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: hintId,
                    children: props.hint
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 70,
                    columnNumber: 39
                }, this) : null
            ]
        }, void 0, true);
    }
    if (props.as === 'select') {
        const { as, children, label, hint, error, id: _id, ...s } = props;
        void as;
        void label;
        void hint;
        void error;
        void _id;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                    ref: ref,
                    id: id,
                    "aria-invalid": props.error ? true : undefined,
                    "aria-describedby": describedBy,
                    ...s,
                    children: children
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this),
                props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: errorId,
                    children: props.error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 93,
                    columnNumber: 24
                }, this) : null,
                props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: hintId,
                    children: props.hint
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 94,
                    columnNumber: 39
                }, this) : null
            ]
        }, void 0, true);
    }
    if (props.as === 'checkbox') {
        const { as, label, hint, error, id: _id, ...c } = props;
        void as;
        void label;
        void hint;
        void error;
        void _id;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ref: ref,
                    id: id,
                    type: "checkbox",
                    "aria-invalid": props.error ? true : undefined,
                    "aria-describedby": describedBy,
                    ...c
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 108,
                    columnNumber: 9
                }, this),
                props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: errorId,
                    children: props.error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 116,
                    columnNumber: 24
                }, this) : null,
                props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: hintId,
                    children: props.hint
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 117,
                    columnNumber: 39
                }, this) : null
            ]
        }, void 0, true);
    }
    if (props.as === 'file-button') {
        const { as, buttonLabel = 'Choose files', onFilesSelected, className, label, hint, error, id: _id, ...f } = props;
        void as;
        void label;
        void hint;
        void error;
        void _id;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                    lineNumber: 141,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: className,
                    "aria-controls": id,
                    disabled: Boolean(f.disabled),
                    onClick: (e)=>e.currentTarget.previousElementSibling?.click(),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: buttonLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                        lineNumber: 163,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this),
                props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: errorId,
                    children: props.error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 165,
                    columnNumber: 24
                }, this) : null,
                props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                    id: hintId,
                    children: props.hint
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                    lineNumber: 166,
                    columnNumber: 39
                }, this) : null
            ]
        }, void 0, true);
    }
    const { as, label, hint, error, id: _id, ...i } = props;
    void as;
    void label;
    void hint;
    void error;
    void _id;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: ref,
                id: id,
                "aria-invalid": props.error ? true : undefined,
                "aria-describedby": describedBy,
                ...i
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this),
            props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                id: errorId,
                children: props.error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                lineNumber: 186,
                columnNumber: 22
            }, this) : null,
            props.hint && !props.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                id: hintId,
                children: props.hint
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Field.tsx",
                lineNumber: 187,
                columnNumber: 37
            }, this) : null
        ]
    }, void 0, true);
}, "P3bvVUypbBAHy0F8g4TFKgtieUM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
})), "P3bvVUypbBAHy0F8g4TFKgtieUM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c1 = Field;
Field.displayName = 'Field';
var _c, _c1;
__turbopack_context__.k.register(_c, "Field$forwardRef");
__turbopack_context__.k.register(_c1, "Field");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/PageHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PageHeader",
    ()=>PageHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
function PageHeader({ title, subtitle, actions, titleAs: TitleTag = 'h1', className, textClassName, titleClassName, subtitleClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageHeader,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageHeaderText,
                    textClassName
                ].filter(Boolean).join(' '),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TitleTag, {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageHeaderTitle,
                            titleClassName
                        ].filter(Boolean).join(' '),
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/PageHeader.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    subtitle ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageHeaderSubtitle,
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
_c = PageHeader;
var _c;
__turbopack_context__.k.register(_c, "PageHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/Badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
const variantClass = {
    neutral: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badgeNeutral,
    blue: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badgeBlue,
    green: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badgeGreen,
    amber: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badgeAmber,
    rose: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badgeRose
};
const sizeClass = {
    sm: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badgeSm,
    md: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badgeMd
};
function Badge({ children, variant = 'neutral', size = 'md', className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badge,
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
_c = Badge;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/StatTile.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatTile",
    ()=>StatTile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
function StatTile({ as: Tag = 'div', icon, label, value, subtext, interactive = false, className, iconClassName, labelClassName, valueClassName, subtextClassName, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tag, {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statTile,
            interactive ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statTileInteractive : '',
            className
        ].filter(Boolean).join(' '),
        ...props,
        children: [
            icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statIcon,
                    iconClassName
                ].filter(Boolean).join(' '),
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/StatTile.tsx",
                lineNumber: 36,
                columnNumber: 15
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statLabel,
                    labelClassName
                ].filter(Boolean).join(' '),
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/StatTile.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statValue,
                    valueClassName
                ].filter(Boolean).join(' '),
                children: value
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/StatTile.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            subtext ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statSubtext,
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
_c = StatTile;
var _c;
__turbopack_context__.k.register(_c, "StatTile");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SurfaceCard",
    ()=>SurfaceCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
function SurfaceCard({ as: Tag = 'div', children, padding = 'default', className, ...props }) {
    const paddingClass = padding === 'default' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].surfaceCardDefault : padding === 'compact' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].surfaceCardCompact : '';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tag, {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].surfaceCard,
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
_c = SurfaceCard;
var _c;
__turbopack_context__.k.register(_c, "SurfaceCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/SectionHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SectionHeader",
    ()=>SectionHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
;
function SectionHeader({ title, action, actionHref, actionLabel, className, titleClassName, actionClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sectionHeader,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sectionHeaderTitle,
                    titleClassName
                ].filter(Boolean).join(' '),
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/SectionHeader.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            action ?? (actionHref && actionLabel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
_c = SectionHeader;
var _c;
__turbopack_context__.k.register(_c, "SectionHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/FeatureCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeatureCard",
    ()=>FeatureCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
;
;
function FeatureCard({ title, description, icon, tag, tagVariant = 'neutral', cta, href, disabled = false, className, bodyClassName, iconClassName, titleClassName, descriptionClassName, footerClassName, ...props }) {
    const cardClassName = [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].featureCard,
        disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].featureCardDisabled : '',
        className
    ].filter(Boolean).join(' ');
    const body = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].featureCardBody,
            bodyClassName
        ].filter(Boolean).join(' '),
        children: [
            icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].featureCardIcon,
                    iconClassName
                ].filter(Boolean).join(' '),
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                lineNumber: 46,
                columnNumber: 15
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].featureCardTitle,
                    titleClassName
                ].filter(Boolean).join(' '),
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].featureCardDescription,
                    descriptionClassName
                ].filter(Boolean).join(' '),
                children: description
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                lineNumber: 49,
                columnNumber: 9
            }, this) : null,
            tag || cta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].featureCardFooter,
                    footerClassName
                ].filter(Boolean).join(' '),
                children: [
                    tag ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: tagVariant,
                        children: tag
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                        lineNumber: 55,
                        columnNumber: 18
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
                        lineNumber: 55,
                        columnNumber: 62
                    }, this),
                    cta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: href,
            className: cardClassName,
            children: body
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
            lineNumber: 64,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: cardClassName,
        ...props,
        children: body
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/FeatureCard.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_c = FeatureCard;
var _c;
__turbopack_context__.k.register(_c, "FeatureCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/ProfileHero.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileHero",
    ()=>ProfileHero
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function ProfileHero({ avatar, name, meta, badges, stats, className, avatarClassName, infoClassName, nameClassName, metaClassName, badgesClassName, statsClassName, statClassName, statValueClassName, statLabelClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: avatarClassName,
                children: avatar
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: infoClassName,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: nameClassName,
                        children: name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    meta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: metaClassName,
                        children: meta
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                        lineNumber: 48,
                        columnNumber: 17
                    }, this) : null,
                    badges ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: statsClassName,
                children: stats.map((stat, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: statClassName,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: statValueClassName,
                                children: stat.value
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/ui/ProfileHero.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
_c = ProfileHero;
var _c;
__turbopack_context__.k.register(_c, "ProfileHero");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/Tooltip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tooltip",
    ()=>Tooltip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function Tooltip({ open, content, targetEl, placement = 'top', className }) {
    _s();
    const [coords, setCoords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "Tooltip.useLayoutEffect": ()=>{
            if (!open || !targetEl) {
                setCoords(null);
                return;
            }
            const updatePosition = {
                "Tooltip.useLayoutEffect.updatePosition": ()=>{
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
                }
            }["Tooltip.useLayoutEffect.updatePosition"];
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return ({
                "Tooltip.useLayoutEffect": ()=>{
                    window.removeEventListener('scroll', updatePosition, true);
                    window.removeEventListener('resize', updatePosition);
                }
            })["Tooltip.useLayoutEffect"];
        }
    }["Tooltip.useLayoutEffect"], [
        open,
        targetEl,
        placement
    ]);
    if (!open || !coords || typeof document === 'undefined') return null;
    const baseClass = {
        top: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tooltipTop,
        right: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tooltipRight,
        bottom: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tooltipBottom,
        left: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tooltipLeft
    }[placement];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tooltipPortal,
            baseClass,
            className
        ].filter(Boolean).join(' '),
        style: coords,
        role: "tooltip",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tooltipArrow,
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
_s(Tooltip, "zNmP9VvevmqI5pAb8eCV27+OzM0=");
_c = Tooltip;
var _c;
__turbopack_context__.k.register(_c, "Tooltip");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/AchievementCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AchievementCard",
    ()=>AchievementCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tooltip.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function AchievementCard({ icon, label, description, unlocked = false, className, unlockedClassName, lockedClassName, iconClassName, labelClassName, tooltipClassName }) {
    _s();
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [tooltipOpen, setTooltipOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: iconClassName,
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/AchievementCard.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
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
_s(AchievementCard, "a8P6nTbGs12AuzvSXwh6CTSKMes=");
_c = AchievementCard;
var _c;
__turbopack_context__.k.register(_c, "AchievementCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/DashboardLessonCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardLessonCard",
    ()=>DashboardLessonCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-client] (ecmascript)");
;
;
function DashboardLessonCard({ title, description, typeLabel, typeClassName, duration, difficulty, locked = false, className, lockedClassName, style, tagClassName, titleClassName, descClassName, footerClassName, metaClassName, metaItemClassName, lockOverlayClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            className,
            locked ? lockedClassName : ''
        ].filter(Boolean).join(' '),
        style: style,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: titleClassName,
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: descClassName,
                children: description
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/DashboardLessonCard.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: footerClassName,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: metaClassName,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            locked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_c = DashboardLessonCard;
var _c;
__turbopack_context__.k.register(_c, "DashboardLessonCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/CalendarEventCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarEventCard",
    ()=>CalendarEventCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
;
;
;
function CalendarEventCard({ typeLabel, typeVariant = 'blue', statusLabel, statusVariant = 'neutral', title, time, teacherName, actionLabel, onAction, className, headerClassName, typeClassName, statusClassName, titleClassName, metaClassName, teacherClassName, actionsClassName, actionButtonClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: headerClassName,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        className: typeClassName,
                        variant: typeVariant,
                        children: typeLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: titleClassName,
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/CalendarEventCard.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: actionsClassName,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
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
_c = CalendarEventCard;
var _c;
__turbopack_context__.k.register(_c, "CalendarEventCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/Tabs.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tabs",
    ()=>Tabs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
;
function Tabs({ value, onValueChange, items, ariaLabel, className, listClassName, triggerClassName, activeTriggerClassName, panelClassName }) {
    const activeItem = items.find((item)=>item.value === value) ?? items[0];
    const useCustomTriggerStyles = Boolean(triggerClassName);
    const useCustomActiveStyles = Boolean(activeTriggerClassName);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabsRoot,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabsList,
                    listClassName
                ].filter(Boolean).join(' '),
                role: "tablist",
                "aria-label": ariaLabel,
                children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "ghost",
                        role: "tab",
                        "aria-selected": item.value === activeItem?.value,
                        "aria-controls": `panel-${item.value}`,
                        id: `tab-${item.value}`,
                        disabled: item.disabled,
                        className: [
                            useCustomTriggerStyles ? '' : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabsTrigger,
                            triggerClassName,
                            item.value === activeItem?.value ? [
                                useCustomActiveStyles ? '' : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabsTriggerActive,
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
            activeItem ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "tabpanel",
                id: `panel-${activeItem.value}`,
                "aria-labelledby": `tab-${activeItem.value}`,
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabsPanel,
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
_c = Tabs;
var _c;
__turbopack_context__.k.register(_c, "Tabs");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/SegmentedControl.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SegmentedControl",
    ()=>SegmentedControl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
;
function SegmentedControl({ value, onValueChange, options, ariaLabel, className, optionClassName, activeOptionClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].segmentedRoot,
            className
        ].filter(Boolean).join(' '),
        role: "radiogroup",
        "aria-label": ariaLabel,
        children: options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                type: "button",
                role: "radio",
                "aria-checked": value === option.value,
                disabled: option.disabled,
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].segmentedOption,
                    optionClassName,
                    value === option.value ? [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].segmentedOptionActive,
                        activeOptionClassName
                    ].filter(Boolean).join(' ') : ''
                ].filter(Boolean).join(' '),
                onClick: ()=>onValueChange(option.value),
                children: [
                    option.icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].segmentedIcon,
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
_c = SegmentedControl;
var _c;
__turbopack_context__.k.register(_c, "SegmentedControl");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/ProgressHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProgressHeader",
    ()=>ProgressHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
function ProgressHeader({ current, total, className, label, barClassName, fillClassName, labelClassName }) {
    const pct = total > 0 ? Math.max(0, Math.min(100, Math.round(current / total * 100))) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].progressHeader,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].progressBar,
                    barClassName
                ].filter(Boolean).join(' '),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].progressFill,
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].progressLabel,
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
_c = ProgressHeader;
var _c;
__turbopack_context__.k.register(_c, "ProgressHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/EmptyStateCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyStateCard",
    ()=>EmptyStateCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
;
function EmptyStateCard({ title, description, icon, action, className, titleClassName, descriptionClassName, iconClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SurfaceCard"], {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyState,
            className
        ].filter(Boolean).join(' '),
        children: [
            icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyStateIcon,
                    iconClassName
                ].filter(Boolean).join(' '),
                children: icon
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/EmptyStateCard.tsx",
                lineNumber: 28,
                columnNumber: 15
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyStateTitle,
                    titleClassName
                ].filter(Boolean).join(' '),
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/EmptyStateCard.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyStateDescription,
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
_c = EmptyStateCard;
var _c;
__turbopack_context__.k.register(_c, "EmptyStateCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/ActionRow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActionRow",
    ()=>ActionRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
function ActionRow({ title, description, action, className, infoClassName, titleClassName, descriptionClassName, actionClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionRow,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionRowInfo,
                    infoClassName
                ].filter(Boolean).join(' '),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionRowTitle,
                            titleClassName
                        ].filter(Boolean).join(' '),
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/ActionRow.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionRowDescription,
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionRowAction,
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
_c = ActionRow;
var _c;
__turbopack_context__.k.register(_c, "ActionRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/SettingsToggleRow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SettingsToggleRow",
    ()=>SettingsToggleRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ui.module.scss [app-client] (css module)");
;
;
;
function SettingsToggleRow({ label, description, checked, onChange, className, infoClassName, labelClassName, descriptionClassName, toggleClassName, toggleOnClassName, thumbClassName }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionRow,
            className
        ].filter(Boolean).join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionRowInfo,
                    infoClassName
                ].filter(Boolean).join(' '),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionRowTitle,
                            labelClassName
                        ].filter(Boolean).join(' '),
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ui/SettingsToggleRow.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionRowDescription,
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                type: "button",
                className: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].switchToggle,
                    toggleClassName,
                    checked ? [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].switchToggleOn,
                        toggleOnClassName
                    ].filter(Boolean).join(' ') : ''
                ].filter(Boolean).join(' '),
                "aria-pressed": checked,
                onClick: ()=>onChange(!checked),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ui$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].switchThumb,
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
_c = SettingsToggleRow;
var _c;
__turbopack_context__.k.register(_c, "SettingsToggleRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/PageHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$StatTile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/StatTile.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SurfaceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SurfaceCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SectionHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SectionHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$FeatureCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/FeatureCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProfileHero$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ProfileHero.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$AchievementCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/AchievementCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$DashboardLessonCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/DashboardLessonCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$CalendarEventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/CalendarEventCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tabs.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SegmentedControl.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ProgressHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ProgressHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$EmptyStateCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/EmptyStateCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$ActionRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/ActionRow.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$SettingsToggleRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/SettingsToggleRow.tsx [app-client] (ecmascript)");
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/entities.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockAccounts",
    ()=>mockAccounts,
    "mockPracticeActivitiesByEntity",
    ()=>mockPracticeActivitiesByEntity,
    "mockProfileGoalsByEntity",
    ()=>mockProfileGoalsByEntity,
    "mockProfileMeta",
    ()=>mockProfileMeta,
    "mockProfileStatsByEntity",
    ()=>mockProfileStatsByEntity,
    "mockProfiles",
    ()=>mockProfiles,
    "mockReviewWordsByEntity",
    ()=>mockReviewWordsByEntity,
    "mockUsers",
    ()=>mockUsers
]);
const mockAccounts = [
    {
        id: 'account-main',
        slug: 'main',
        name: 'Main SoEnglish',
        status: 'active'
    }
];
const mockUsers = [
    {
        id: 'student-1',
        accountId: 'account-main',
        fullName: 'Mykola Kovalenko',
        email: 'mykola@example.com',
        role: 'student',
        avatarInitials: 'MK',
        targetLevel: 'B2',
        streakDays: 14
    },
    {
        id: 'teacher-1',
        accountId: 'account-main',
        fullName: 'Sarah Mitchell',
        email: 'sarah@example.com',
        role: 'teacher',
        avatarInitials: 'SM',
        targetLevel: 'C1',
        streakDays: 30
    },
    {
        id: 'student-2',
        accountId: 'account-main',
        fullName: 'Anna Vasylenko',
        email: 'anna@example.com',
        role: 'student',
        avatarInitials: 'AV',
        targetLevel: 'B1',
        streakDays: 9
    },
    {
        id: 'student-3',
        accountId: 'account-main',
        fullName: 'Dmytro Savchenko',
        email: 'dmytro@example.com',
        role: 'student',
        avatarInitials: 'DS',
        targetLevel: 'A2',
        streakDays: 3
    },
    {
        id: 'teacher-2',
        accountId: 'account-main',
        fullName: 'Michael Brown',
        email: 'michael@example.com',
        role: 'teacher',
        avatarInitials: 'MB',
        targetLevel: 'C1',
        streakDays: 24
    },
    {
        id: 'admin-1',
        accountId: 'account-main',
        fullName: 'Admin Manager',
        email: 'admin@example.com',
        role: 'admin',
        avatarInitials: 'AM',
        targetLevel: 'C2',
        streakDays: 60
    },
    {
        id: 'super-admin-1',
        accountId: 'account-main',
        fullName: 'Platform Owner',
        email: 'owner@example.com',
        role: 'super-admin',
        avatarInitials: 'PO',
        targetLevel: 'C2',
        streakDays: 120
    }
];
const mockProfiles = [
    {
        id: 'profile-student-1',
        accountId: 'account-main',
        userId: 'student-1',
        telegram: '@mykola',
        phone: '+380 67 123 4567',
        timezone: 'Europe/Kiev',
        nativeLanguage: 'Ukrainian',
        weeklyGoal: '5',
        bio: 'Full-stack developer learning English for professional growth and international opportunities.'
    },
    {
        id: 'profile-student-2',
        accountId: 'account-main',
        userId: 'student-2',
        telegram: '@anna',
        phone: '+380 93 101 2200',
        timezone: 'Europe/Kyiv',
        nativeLanguage: 'Ukrainian',
        weeklyGoal: '4',
        bio: 'Improving grammar confidence for product presentations.'
    },
    {
        id: 'profile-student-3',
        accountId: 'account-main',
        userId: 'student-3',
        telegram: '@dmytro',
        phone: '+380 50 333 4455',
        timezone: 'Europe/Warsaw',
        nativeLanguage: 'Ukrainian',
        weeklyGoal: '3',
        bio: 'Beginner path with focus on vocabulary and listening.'
    }
];
const mockProfileMeta = [
    {
        id: 'profile-meta-student-1',
        accountId: 'account-main',
        userId: 'student-1',
        status: 'active',
        scheduleType: 'fixed',
        teacherId: 'teacher-1',
        notes: 'Focused on business communication and speaking confidence.',
        calendarColor: '#3b82c4'
    },
    {
        id: 'profile-meta-student-2',
        accountId: 'account-main',
        userId: 'student-2',
        status: 'active',
        scheduleType: 'flexible',
        teacherId: 'teacher-1',
        notes: 'Needs extra grammar drills and weekly speaking practice.',
        calendarColor: '#16a97a'
    },
    {
        id: 'profile-meta-student-3',
        accountId: 'account-main',
        userId: 'student-3',
        status: 'paused',
        scheduleType: 'fixed',
        teacherId: 'teacher-2',
        notes: 'Beginner track, vocabulary-first plan.',
        calendarColor: '#8b5cf6'
    }
];
const mockProfileStatsByEntity = [
    {
        accountId: 'account-main',
        userId: 'student-1',
        stats: {
            wordsLearned: 847,
            lessonsCompleted: 38,
            streakDays: 14,
            quizzesCompleted: 12,
            perfectQuizCount: 0,
            speakingSessions: 16
        }
    },
    {
        accountId: 'account-main',
        userId: 'student-2',
        stats: {
            wordsLearned: 520,
            lessonsCompleted: 24,
            streakDays: 9,
            quizzesCompleted: 8,
            perfectQuizCount: 0,
            speakingSessions: 7
        }
    },
    {
        accountId: 'account-main',
        userId: 'student-3',
        stats: {
            wordsLearned: 180,
            lessonsCompleted: 12,
            streakDays: 3,
            quizzesCompleted: 4,
            perfectQuizCount: 0,
            speakingSessions: 2
        }
    }
];
const mockProfileGoalsByEntity = [
    {
        id: 'goal-1',
        accountId: 'account-main',
        userId: 'student-1',
        text: 'Complete 1 grammar lesson',
        done: true
    },
    {
        id: 'goal-2',
        accountId: 'account-main',
        userId: 'student-1',
        text: 'Review 20 flashcards',
        done: true
    },
    {
        id: 'goal-3',
        accountId: 'account-main',
        userId: 'student-1',
        text: 'Practice speaking 10 min',
        done: false
    },
    {
        id: 'goal-4',
        accountId: 'account-main',
        userId: 'student-1',
        text: 'Finish all daily goals',
        done: false
    }
];
const mockPracticeActivitiesByEntity = [
    {
        id: 'activity-vocab',
        accountId: 'account-main',
        href: '/vocabulary',
        title: 'Vocabulary',
        description: 'Search and organize your words, track new vs known, and flip through flashcards to memorize faster.',
        icon: '📚',
        tag: 'Words',
        tagClass: 'tagGreen'
    },
    {
        id: 'activity-quiz',
        accountId: 'account-main',
        href: '/quiz',
        title: 'Quiz',
        description: 'Multiple-choice and fill-in questions on grammar and vocabulary with explanations after each answer.',
        icon: '🎯',
        tag: 'Grammar',
        tagClass: 'tagBlue'
    },
    {
        id: 'activity-speaking',
        accountId: 'account-main',
        href: '#',
        title: 'Speaking',
        description: 'Guided speaking prompts and pronunciation practice — we are preparing this mode for your level.',
        icon: '🎙️',
        tag: 'Soon',
        tagClass: 'tagMuted',
        disabled: true
    }
];
const mockReviewWordsByEntity = [
    {
        id: 'review-1',
        accountId: 'account-main',
        userId: 'student-1',
        word: 'Eloquent',
        pos: 'adjective',
        def: 'Fluent and persuasive in speech',
        status: 'new'
    },
    {
        id: 'review-2',
        accountId: 'account-main',
        userId: 'student-1',
        word: 'Leverage',
        pos: 'verb/noun',
        def: 'Use to maximum advantage',
        status: 'learning'
    },
    {
        id: 'review-3',
        accountId: 'account-main',
        userId: 'student-1',
        word: 'Concise',
        pos: 'adjective',
        def: 'Clear and brief',
        status: 'known'
    },
    {
        id: 'review-4',
        accountId: 'account-main',
        userId: 'student-1',
        word: 'Ambiguous',
        pos: 'adjective',
        def: 'Open to interpretation',
        status: 'learning'
    },
    {
        id: 'review-5',
        accountId: 'account-main',
        userId: 'student-1',
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
"[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activeAccount",
    ()=>activeAccount,
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
    "mockUsersByAccount",
    ()=>mockUsersByAccount,
    "mockUsersByRole",
    ()=>mockUsersByRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/entities.ts [app-client] (ecmascript)");
;
const rolePreference = [
    'student',
    'teacher',
    'admin',
    'super-admin'
];
const resolveUserByRole = (role)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsers"].find((user)=>user.role === role);
const activeRole = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MOCK_ROLE ?? 'admin';
const sessionRows = rolePreference.map((role)=>{
    const user = resolveUserByRole(role);
    if (!user) return null;
    return {
        id: `session-${role}`,
        accountId: user.accountId,
        userId: user.id,
        role
    };
}).filter((session)=>Boolean(session));
const mockUsersByRole = rolePreference.reduce((acc, role)=>{
    const user = resolveUserByRole(role);
    if (user) acc[role] = user;
    return acc;
}, {});
const fallbackUser = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsers"][0];
const resolvedActiveUser = mockUsersByRole[activeRole] ?? fallbackUser;
const activeSession = sessionRows.find((session)=>session.userId === resolvedActiveUser.id) ?? {
    id: 'session-fallback',
    accountId: resolvedActiveUser.accountId,
    userId: resolvedActiveUser.id,
    role: resolvedActiveUser.role
};
const activeAccount = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockAccounts"].find((account)=>account.id === activeSession.accountId) ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockAccounts"][0];
const activeUser = resolvedActiveUser;
const activeMockUser = activeUser;
const mockUsersByAccount = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsers"].filter((user)=>user.accountId === activeAccount.id);
const mockUsers = mockUsersByAccount;
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
                type: 'Type',
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
                studentResponse: 'Student response'
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
                notCredited: 'Not credited',
                grammar: 'Grammar',
                vocabulary: 'Vocabulary',
                speaking: 'Speaking',
                listening: 'Listening'
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
                sendChangeRequest: 'Send change request'
            },
            placeholders: {
                addText: 'Add text...'
            },
            messages: {
                blockedUnsafeFiles: 'Blocked unsafe files: {files}. Allowed: docs, slides, tables, text, images, pdf up to {max}MB.',
                rejectedFiles: 'Rejected: {files} (allowed up to {max}MB).'
            },
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/entities.ts [app-client] (ecmascript)");
;
;
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
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockReviewWordsByEntity"].filter((word)=>word.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id && word.userId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeUser"].id).map(({ id: _id, accountId: _accountId, userId: _userId, ...word })=>word)
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
"[project]/apps/web/src/mocks/domains/lessons.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLessonsForAccount",
    ()=>getLessonsForAccount,
    "getStudentScheduledLessons",
    ()=>getStudentScheduledLessons,
    "lessonEntities",
    ()=>lessonEntities,
    "mockLessons",
    ()=>mockLessons,
    "mockScheduledLessons",
    ()=>mockScheduledLessons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/entities.ts [app-client] (ecmascript)");
;
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
    },
    {
        id: 'lesson-cal-4',
        lessonId: '6',
        title: 'Grammar: Email Writing',
        type: 'grammar',
        date: '2026-04-21',
        startTime: '09:00',
        endTime: '09:55',
        duration: 55,
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        studentId: 'student-1',
        studentName: 'Mykola K.',
        status: 'planned',
        credited: false,
        notes: 'Subject lines, openings, and polite requests.',
        order: 1,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 'lesson-cal-5',
        lessonId: '7',
        title: 'Listening: Discovery Call',
        type: 'listening',
        date: '2026-04-21',
        startTime: '10:00',
        endTime: '10:55',
        duration: 55,
        teacherId: 'teacher-2',
        teacherName: 'Michael Brown',
        studentId: 'student-3',
        studentName: 'Dmytro S.',
        status: 'planned',
        credited: false,
        notes: 'Active listening and extracting action points.',
        order: 1,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 'lesson-cal-6',
        lessonId: '5',
        title: 'Speaking: Negotiation Practice',
        type: 'speaking',
        date: '2026-04-21',
        startTime: '10:00',
        endTime: '10:55',
        duration: 55,
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        studentId: 'student-2',
        studentName: 'Olena P.',
        status: 'planned',
        credited: false,
        notes: 'Parallel slot for overlap testing in all-teachers mode.',
        order: 2,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 'lesson-cal-7',
        lessonId: '8',
        title: 'Vocabulary: HR Terms',
        type: 'vocabulary',
        date: '2026-04-21',
        startTime: '12:00',
        endTime: '12:55',
        duration: 55,
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        studentId: 'student-1',
        studentName: 'Mykola K.',
        status: 'planned',
        credited: false,
        notes: 'Recruitment funnel and interview vocabulary.',
        order: 1,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 'lesson-cal-8',
        lessonId: '3',
        title: 'Speaking: Stakeholder Update',
        type: 'speaking',
        date: '2026-04-22',
        startTime: '15:00',
        endTime: '15:55',
        duration: 55,
        teacherId: 'teacher-2',
        teacherName: 'Michael Brown',
        studentId: 'student-3',
        studentName: 'Dmytro S.',
        status: 'planned',
        credited: false,
        notes: 'Concise status reporting and follow-up questions.',
        order: 1,
        recurrence: 'weekly',
        weeklyDays: [
            3
        ],
        seriesId: 'series-speaking-2'
    },
    {
        id: 'lesson-cal-9',
        lessonId: '4',
        title: 'Listening: Podcast Debrief',
        type: 'listening',
        date: '2026-04-23',
        startTime: '13:00',
        endTime: '13:55',
        duration: 55,
        teacherId: 'teacher-1',
        teacherName: 'Sarah Mitchell',
        studentId: 'student-2',
        studentName: 'Olena P.',
        status: 'planned',
        credited: false,
        notes: 'Summarize key points and infer speaker intent.',
        order: 1,
        recurrence: 'none',
        weeklyDays: []
    },
    {
        id: 'lesson-cal-10',
        lessonId: '2',
        title: 'Vocabulary: Finance Drill',
        type: 'vocabulary',
        date: '2026-04-24',
        startTime: '09:00',
        endTime: '09:55',
        duration: 55,
        teacherId: 'teacher-2',
        teacherName: 'Michael Brown',
        studentId: 'student-3',
        studentName: 'Dmytro S.',
        status: 'completed',
        credited: true,
        notes: 'Quick repetition set and mini-quiz.',
        order: 1,
        recurrence: 'none',
        weeklyDays: []
    }
];
const lessonEntities = mockScheduledLessons;
const typeMeta = {
    grammar: {
        level: 'B2',
        xp: 30,
        difficulty: 'medium'
    },
    vocabulary: {
        level: 'B2',
        xp: 25,
        difficulty: 'easy'
    },
    speaking: {
        level: 'B2',
        xp: 40,
        difficulty: 'hard'
    },
    listening: {
        level: 'B2',
        xp: 32,
        difficulty: 'medium'
    }
};
const byLessonKey = new Map();
for (const lesson of mockScheduledLessons){
    const key = lesson.lessonId ?? lesson.id;
    if (!byLessonKey.has(key)) byLessonKey.set(key, lesson);
}
const mockLessons = Array.from(byLessonKey.values()).map((lesson)=>{
    const meta = typeMeta[lesson.type];
    return {
        id: lesson.lessonId ?? lesson.id,
        title: lesson.title,
        type: lesson.type,
        level: meta.level,
        duration: lesson.duration,
        xp: meta.xp,
        difficulty: meta.difficulty,
        description: lesson.notes ?? `${lesson.title} lesson`,
        completed: lesson.status === 'completed',
        locked: false,
        visibilityByRole: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ]
    };
});
const getLessonsForAccount = (accountId)=>accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockAccounts"][0].id ? mockLessons : [];
function getStudentScheduledLessons(studentId) {
    return mockScheduledLessons.filter((lesson)=>lesson.studentId === studentId);
}
;
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
    },
    {
        id: '5',
        title: 'Negotiation Language Patterns',
        type: 'speaking',
        level: 'C1',
        duration: 55,
        xp: 45,
        difficulty: 'hard',
        description: 'Practice persuasive language, softening phrases, and negotiation tactics.',
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
        id: '6',
        title: 'Email Writing: Formal vs Friendly',
        type: 'grammar',
        level: 'B1',
        duration: 55,
        xp: 28,
        difficulty: 'easy',
        description: 'Learn structure and tone for professional and semi-formal emails.',
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
        id: '7',
        title: 'Listening: Client Discovery Call',
        type: 'listening',
        level: 'B2',
        duration: 55,
        xp: 32,
        difficulty: 'medium',
        description: 'Train listening for detail using a realistic client onboarding conversation.',
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
        id: '8',
        title: 'Vocabulary: HR & Recruiting',
        type: 'vocabulary',
        level: 'B2',
        duration: 55,
        xp: 26,
        difficulty: 'medium',
        description: 'Key terms for hiring, interviews, and performance review discussions.',
        completed: false,
        locked: false,
        visibilityByRole: [
            'student',
            'teacher',
            'admin',
            'super-admin'
        ]
    }
];
const getLessonsForAccount = (accountId)=>accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockAccounts"][0].id ? mockLessons : [];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/calendar.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/lessons.ts [app-client] (ecmascript)");
;
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
const mockCalendarEvents = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockScheduledLessons"].map(scheduledLessonToCalendarEvent);
function getStudentCalendarEvents(studentId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$lessons$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStudentScheduledLessons"])(studentId).map(scheduledLessonToCalendarEvent);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/profile.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canManageProfile",
    ()=>canManageProfile,
    "getProfileByUserId",
    ()=>getProfileByUserId,
    "getProfileFormByUserId",
    ()=>getProfileFormByUserId,
    "getVisibleProfiles",
    ()=>getVisibleProfiles,
    "mockPracticeActivities",
    ()=>mockPracticeActivities,
    "mockProfileForm",
    ()=>mockProfileForm,
    "mockProfileGoals",
    ()=>mockProfileGoals,
    "mockProfileStats",
    ()=>mockProfileStats,
    "mockProfileStatsByAccount",
    ()=>mockProfileStatsByAccount
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/entities.ts [app-client] (ecmascript)");
;
;
const toProfileViewModel = (userId)=>{
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsers"].find((entry)=>entry.id === userId);
    const profile = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfiles"].find((entry)=>entry.userId === userId && entry.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id);
    const profileMeta = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileMeta"].find((entry)=>entry.userId === userId && entry.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id);
    if (!user || user.role !== 'student' || !profile || !profileMeta) return null;
    const teacher = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsers"].find((entry)=>entry.id === profileMeta.teacherId);
    const stats = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileStatsByEntity"].find((entry)=>entry.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id && entry.userId === userId);
    return {
        id: user.id,
        accountId: user.accountId,
        userId: user.id,
        fullName: user.fullName,
        level: user.targetLevel,
        email: user.email,
        phone: profile.phone,
        timezone: profile.timezone,
        notes: profileMeta.notes,
        calendarColor: profileMeta.calendarColor,
        status: profileMeta.status,
        scheduleType: profileMeta.scheduleType,
        teacherId: profileMeta.teacherId,
        teacherName: teacher?.fullName ?? 'Unknown teacher',
        wordsLearned: stats?.wordsLearned ?? 0,
        lessonsCompleted: stats?.lessonsCompleted ?? 0,
        streakDays: stats?.streakDays ?? user.streakDays ?? 0
    };
};
const getProfileByUserId = (userId)=>toProfileViewModel(userId) ?? undefined;
const getVisibleProfiles = (role, userId)=>{
    if (role === 'teacher') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileMeta"].filter((entry)=>entry.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id && entry.teacherId === userId).map((entry)=>toProfileViewModel(entry.userId)).filter((entry)=>Boolean(entry));
    }
    if (role === 'admin' || role === 'super-admin') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileMeta"].filter((entry)=>entry.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id).map((entry)=>toProfileViewModel(entry.userId)).filter((entry)=>Boolean(entry));
    }
    if (role === 'student') {
        const own = toProfileViewModel(userId);
        return own ? [
            own
        ] : [];
    }
    return [];
};
const canManageProfile = (currentUser, profile)=>{
    if (currentUser.role === 'teacher') return profile.teacherId === currentUser.id;
    return currentUser.role === 'admin' || currentUser.role === 'super-admin';
};
const getProfileFormByUserId = (userId)=>{
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsers"].find((entry)=>entry.id === userId);
    const profile = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfiles"].find((entry)=>entry.userId === userId && entry.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id);
    if (!user) {
        throw new Error(`Profile data is missing for user "${userId}" in account "${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id}"`);
    }
    if (!profile) {
        return {
            name: user.fullName,
            email: user.email,
            telegram: '',
            phone: '',
            timezone: 'Europe/Kyiv',
            nativeLanguage: 'Ukrainian',
            targetLevel: user.targetLevel,
            weeklyGoal: '3',
            bio: ''
        };
    }
    return {
        name: user.fullName,
        email: user.email,
        telegram: profile.telegram,
        phone: profile.phone,
        timezone: profile.timezone,
        nativeLanguage: profile.nativeLanguage,
        targetLevel: user.targetLevel,
        weeklyGoal: profile.weeklyGoal,
        bio: profile.bio
    };
};
const mockProfileForm = getProfileFormByUserId(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeUser"].id);
const mockProfileStatsByAccount = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileStatsByEntity"].map((entry)=>({
        accountId: entry.accountId,
        userId: entry.userId,
        stats: entry.stats
    }));
const activeStatsEntry = mockProfileStatsByAccount.find((entry)=>entry.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id && entry.userId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeUser"].id);
const mockProfileStats = activeStatsEntry?.stats ?? {
    wordsLearned: 0,
    lessonsCompleted: 0,
    streakDays: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeUser"].streakDays ?? 0,
    quizzesCompleted: 0,
    perfectQuizCount: 0,
    speakingSessions: 0
};
const mockProfileGoals = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileGoalsByEntity"].filter((goal)=>goal.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id && goal.userId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeUser"].id).map((goal)=>({
        text: goal.text,
        done: goal.done
    }));
const mockPracticeActivities = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockPracticeActivitiesByEntity"].filter((activity)=>activity.accountId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"].id).map((activity)=>({
        href: activity.href,
        title: activity.title,
        description: activity.description,
        icon: activity.icon,
        tag: activity.tag,
        tagClass: activity.tagClass,
        disabled: activity.disabled
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/mocks/domains/achievements.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildProfileAchievements",
    ()=>buildProfileAchievements
]);
const profileAchievementRules = [
    {
        icon: 'sparkles',
        label: 'Welcome Aboard',
        description: 'Open your profile for the first time.',
        isUnlocked: ()=>true
    },
    {
        icon: 'graduation-cap',
        label: 'First Lesson',
        description: 'Complete your first lesson.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 1
    },
    {
        icon: 'calendar-check',
        label: '10 Lessons Done',
        description: 'Complete 10 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 10
    },
    {
        icon: 'calendar-check',
        label: '25 Lessons Done',
        description: 'Complete 25 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 25
    },
    {
        icon: 'flame',
        label: '7-Day Streak',
        description: 'Keep a 7-day learning streak.',
        isUnlocked: (stats)=>stats.streakDays >= 7
    },
    {
        icon: 'flame',
        label: '14-Day Streak',
        description: 'Keep a 14-day learning streak.',
        isUnlocked: (stats)=>stats.streakDays >= 14
    },
    {
        icon: 'mountain',
        label: '21-Day Streak',
        description: 'Keep a 21-day learning streak.',
        isUnlocked: (stats)=>stats.streakDays >= 21
    },
    {
        icon: 'mountain',
        label: '30-Day Streak',
        description: 'Keep a 30-day learning streak.',
        isUnlocked: (stats)=>stats.streakDays >= 30
    },
    {
        icon: 'book-open',
        label: '100 Words',
        description: 'Learn 100 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 100
    },
    {
        icon: 'book-open',
        label: '250 Words',
        description: 'Learn 250 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 250
    },
    {
        icon: 'book-open',
        label: '500 Words',
        description: 'Learn 500 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 500
    },
    {
        icon: 'brain',
        label: '1000 Words',
        description: 'Learn 1000 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 1000
    },
    {
        icon: 'book-open',
        label: 'Word Collector',
        description: 'Learn 1500 words.',
        isUnlocked: (stats)=>stats.wordsLearned >= 1500
    },
    {
        icon: 'target',
        label: 'First Quiz',
        description: 'Complete your first quiz.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 1
    },
    {
        icon: 'target',
        label: '5 Quizzes',
        description: 'Complete 5 quizzes.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 5
    },
    {
        icon: 'badge-check',
        label: '10 Quizzes',
        description: 'Complete 10 quizzes.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 10
    },
    {
        icon: 'target',
        label: 'Quiz Marathon',
        description: 'Complete 25 quizzes.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 25
    },
    {
        icon: 'trophy',
        label: '100% Quiz',
        description: 'Get one perfect quiz score.',
        isUnlocked: (stats)=>stats.perfectQuizCount >= 1
    },
    {
        icon: 'trophy',
        label: 'Perfect Trio',
        description: 'Get 3 perfect quiz scores.',
        isUnlocked: (stats)=>stats.perfectQuizCount >= 3
    },
    {
        icon: 'trophy',
        label: 'Perfect 5',
        description: 'Get 5 perfect quiz scores.',
        isUnlocked: (stats)=>stats.perfectQuizCount >= 5
    },
    {
        icon: 'messages-square',
        label: 'Conversation Starter',
        description: 'Complete 3 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 3
    },
    {
        icon: 'messages-square',
        label: 'Conversation Buddy',
        description: 'Complete 5 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 5
    },
    {
        icon: 'mic',
        label: 'Speaking Pro',
        description: 'Complete 10 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 10
    },
    {
        icon: 'mic',
        label: 'Speaking Star',
        description: 'Complete 20 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 20
    },
    {
        icon: 'mic',
        label: 'Speaking Master',
        description: 'Complete 30 speaking sessions.',
        isUnlocked: (stats)=>stats.speakingSessions >= 30
    },
    {
        icon: 'rocket',
        label: '30 Lessons Done',
        description: 'Complete 30 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 30
    },
    {
        icon: 'rocket',
        label: '75 Lessons Done',
        description: 'Complete 75 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 75
    },
    {
        icon: 'crown',
        label: 'Quiz Expert',
        description: 'Complete 40 quizzes.',
        isUnlocked: (stats)=>stats.quizzesCompleted >= 40
    },
    {
        icon: 'crown',
        label: 'Perfect Streak',
        description: 'Get 10 perfect quiz scores.',
        isUnlocked: (stats)=>stats.perfectQuizCount >= 10
    },
    {
        icon: 'star',
        label: 'Consistency Master',
        description: 'Complete 25 lessons and keep a 14-day streak.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 25 && stats.streakDays >= 14
    },
    {
        icon: 'calendar-check',
        label: '50 Lessons Done',
        description: 'Complete 50 lessons.',
        isUnlocked: (stats)=>stats.lessonsCompleted >= 50
    },
    {
        icon: 'gem',
        label: 'Elite Learner',
        description: 'Learn 1000 words and complete 50 lessons.',
        isUnlocked: (stats)=>stats.wordsLearned >= 1000 && stats.lessonsCompleted >= 50
    }
];
function buildProfileAchievements(stats) {
    return profileAchievementRules.map((rule)=>({
            icon: rule.icon,
            label: rule.label,
            description: rule.description,
            unlocked: rule.isUnlocked(stats)
        }));
}
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$quiz$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/quiz.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/calendar.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/achievements.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/entities.ts [app-client] (ecmascript)");
;
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
"[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activeAccount",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAccount"],
    "activeMockUser",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"],
    "activeRole",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeRole"],
    "activeSession",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeSession"],
    "activeUser",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeUser"],
    "buildProfileAchievements",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildProfileAchievements"],
    "calendarEventToScheduledLesson",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calendarEventToScheduledLesson"],
    "canEdit",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canEdit"],
    "canManage",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canManage"],
    "canManageProfile",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canManageProfile"],
    "canSchedule",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canSchedule"],
    "canView",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canView"],
    "getProfileByUserId",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProfileByUserId"],
    "getProfileFormByUserId",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProfileFormByUserId"],
    "getStudentCalendarEvents",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStudentCalendarEvents"],
    "getVisibleProfiles",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVisibleProfiles"],
    "mockAccounts",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockAccounts"],
    "mockCalendarEvents",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockCalendarEvents"],
    "mockPracticeActivities",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockPracticeActivities"],
    "mockPracticeActivitiesByEntity",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockPracticeActivitiesByEntity"],
    "mockProfileForm",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileForm"],
    "mockProfileGoals",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileGoals"],
    "mockProfileGoalsByEntity",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileGoalsByEntity"],
    "mockProfileMeta",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileMeta"],
    "mockProfileStats",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileStats"],
    "mockProfileStatsByAccount",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileStatsByAccount"],
    "mockProfileStatsByEntity",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfileStatsByEntity"],
    "mockProfiles",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockProfiles"],
    "mockQuizQuestions",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$quiz$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockQuizQuestions"],
    "mockReviewWords",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockReviewWords"],
    "mockReviewWordsByEntity",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockReviewWordsByEntity"],
    "mockUsers",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsers"],
    "mockUsersByAccount",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsersByAccount"],
    "mockUsersByRole",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockUsersByRole"],
    "mockVocabularyWords",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockVocabularyWords"],
    "roleMatrix",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["roleMatrix"],
    "scheduledLessonToCalendarEvent",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scheduledLessonToCalendarEvent"],
    "siteContent",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["siteContent"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/roles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$content$2f$site$2d$content$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/content/site-content.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$vocabulary$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/vocabulary.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$quiz$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/quiz.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/calendar.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$profile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/profile.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$achievements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/achievements.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$domains$2f$entities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/domains/entities.ts [app-client] (ecmascript)");
}),
"[project]/apps/web/src/components/layout/Header.module.scss [app-client] (css module)", ((__turbopack_context__) => {

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
"[project]/apps/web/src/components/layout/Header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Field.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/layout/Header.module.scss [app-client] (css module)");
'use client';
;
;
;
;
;
const PAID_LESSONS_REMAINING_PLACEHOLDER = 12;
function Header() {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const nowTs = today.getTime();
    const isActiveLesson = (status)=>status !== 'cancelled';
    const lessonsToday = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockScheduledLessons"].filter((lesson)=>lesson.date === todayKey && isActiveLesson(lesson.status));
    const remainingToday = lessonsToday.filter((lesson)=>new Date(`${lesson.date}T${lesson.startTime}:00`).getTime() > nowTs);
    const plannedLessonsCount = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockScheduledLessons"].filter((lesson)=>lesson.status === 'planned').length;
    const creditedLessonsCount = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockScheduledLessons"].filter((lesson)=>lesson.credited).length;
    const lessonsLeft = Math.max(0, PAID_LESSONS_REMAINING_PLACEHOLDER - creditedLessonsCount);
    const myTodayCount = lessonsToday.filter((lesson)=>lesson.teacherId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id).length;
    const myRemainingCount = remainingToday.filter((lesson)=>lesson.teacherId === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].id).length;
    const totalTodayCount = lessonsToday.length;
    const totalRemainingCount = remainingToday.length;
    const showTotalForAdmin = (__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'admin' || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'super-admin') && (myTodayCount !== totalTodayCount || myRemainingCount !== totalRemainingCount);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].header,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logoArea,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logoMark,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            viewBox: "0 0 18 18",
                            fill: "none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M3 4h12M3 9h8M3 14h10",
                                    stroke: "white",
                                    strokeWidth: "1.8",
                                    strokeLinecap: "round"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 39,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "14",
                                    cy: "13.5",
                                    r: "2.5",
                                    fill: "#16a97a"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 40,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logoTextBlock,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logoName,
                                children: "SoEnglish"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logoTag,
                                children: "English Platform"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].mid,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].searchBox,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "15",
                            height: "15",
                            viewBox: "0 0 15 15",
                            fill: "none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "6.5",
                                    cy: "6.5",
                                    r: "4.5",
                                    stroke: "#b4b4cc",
                                    strokeWidth: "1.3"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 52,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M10 10l3 3",
                                    stroke: "#b4b4cc",
                                    strokeWidth: "1.3",
                                    strokeLinecap: "round"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                    lineNumber: 53,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Field$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                            type: "text",
                            placeholder: "Search lessons, words, topics..."
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                            lineNumber: 55,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].right,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonsBadge,
                        title: "Today lessons statistics",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "16",
                                height: "16",
                                viewBox: "0 0 16 16",
                                fill: "none",
                                "aria-hidden": true,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M4 3.5h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8a1 1 0 011-1z",
                                        stroke: "currentColor",
                                        strokeWidth: "1.3"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 65,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M5 6.5h6M5 9h4",
                                        stroke: "currentColor",
                                        strokeWidth: "1.3",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 70,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'student' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonsNum,
                                        children: lessonsLeft
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 74,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonsLbl,
                                        children: "lessons left"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 75,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonsPlanned,
                                        children: [
                                            "· ",
                                            plannedLessonsCount,
                                            " planned"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 76,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonsLbl,
                                        children: [
                                            "My: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonsNum,
                                                children: myTodayCount
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                                lineNumber: 81,
                                                columnNumber: 21
                                            }, this),
                                            " today"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 80,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonsPlanned,
                                        children: [
                                            "· ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonsNum,
                                                children: myRemainingCount
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                                lineNumber: 84,
                                                columnNumber: 19
                                            }, this),
                                            " left"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 83,
                                        columnNumber: 15
                                    }, this),
                                    showTotalForAdmin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].lessonsPlanned,
                                        children: [
                                            "· Total: ",
                                            totalTodayCount,
                                            " today / ",
                                            totalRemainingCount,
                                            " left"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                                        lineNumber: 87,
                                        columnNumber: 17
                                    }, this) : null
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/profile",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Header$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].avatar,
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].avatarInitials
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/layout/Header.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Header.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_c = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/layout/Sidebar.module.scss [app-client] (css module)", ((__turbopack_context__) => {

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
"[project]/apps/web/src/components/layout/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/mocks/session.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/layout/Sidebar.module.scss [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
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
    practice: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
    grid: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
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
    book: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M9 3C7 3 5 3.5 4 4.5V14.5C5 13.5 7 13 9 13s4 .5 5 1.5V4.5C13 3.5 11 3 9 3z",
                stroke: "currentColor",
                strokeWidth: "1.4"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
    quiz: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2v1.5",
                stroke: "currentColor",
                strokeWidth: "1.4",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
    calendar: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
    profile: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
    students: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M2.8 14c0-2 1.7-3.6 3.8-3.6h0.8c2.1 0 3.8 1.6 3.8 3.6",
                stroke: "currentColor",
                strokeWidth: "1.3",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
    lessons: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 18 18",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
    return expanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 18 18",
        fill: "none",
        "aria-hidden": true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 18 18",
        fill: "none",
        "aria-hidden": true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
_c = CollapseIcon;
function findNavItem(href) {
    for (const { items } of navItems){
        const item = items.find((i)=>i.href === href);
        if (item) return item;
    }
    return undefined;
}
function Sidebar() {
    _s();
    const canSeeStudents = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'teacher' || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'admin' || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$mocks$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeMockUser"].role === 'super-admin';
    const visibleNavItems = navItems.map((section)=>({
            ...section,
            items: section.items.filter((item)=>item.href === '/students' ? canSeeStudents : true)
        }));
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hoveredHref, setHoveredHref] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const rowRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            try {
                if (("TURBOPACK compile-time value", "object") !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1') {
                    setCollapsed(true);
                }
            } catch  {
            /* ignore */ }
        }
    }["Sidebar.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            document.documentElement.style.setProperty('--sidebar-w', collapsed ? '72px' : '240px');
            document.documentElement.setAttribute('data-sidebar-collapsed', collapsed ? 'true' : 'false');
            try {
                localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
            } catch  {
            /* ignore */ }
        }
    }["Sidebar.useEffect"], [
        collapsed
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            return ({
                "Sidebar.useEffect": ()=>{
                    document.documentElement.style.removeProperty('--sidebar-w');
                    document.documentElement.removeAttribute('data-sidebar-collapsed');
                }
            })["Sidebar.useEffect"];
        }
    }["Sidebar.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            if (!collapsed) setHoveredHref(null);
        }
    }["Sidebar.useEffect"], [
        collapsed
    ]);
    const hoveredItem = hoveredHref ? findNavItem(hoveredHref) : undefined;
    const hoveredEl = hoveredHref ? rowRefs.current.get(hoveredHref) ?? null : null;
    const showTip = collapsed && hoveredHref && hoveredItem && typeof document !== 'undefined';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sidebar} ${collapsed ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].collapsed : ''}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].nav,
                children: visibleNavItems.map(({ section, items })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].section,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sectionTitle,
                                children: section
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                lineNumber: 262,
                                columnNumber: 13
                            }, this),
                            items.map(({ href, label, icon, badge, badgeColor })=>{
                                const active = pathname === href || href !== '/' && pathname.startsWith(href);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].itemRow,
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
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: href,
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].item} ${active ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].active : ''}`,
                                        "aria-current": active ? 'page' : undefined,
                                        "aria-label": collapsed ? label : undefined,
                                        onFocus: ()=>{
                                            if (collapsed) setHoveredHref(href);
                                        },
                                        onBlur: ()=>{
                                            if (collapsed) setHoveredHref(null);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].iconWrap,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].icon,
                                                        children: icons[icon]
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                        lineNumber: 295,
                                                        columnNumber: 23
                                                    }, this),
                                                    collapsed && badge ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badgeDot
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                        lineNumber: 297,
                                                        columnNumber: 25
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                lineNumber: 294,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].itemLabel,
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                lineNumber: 300,
                                                columnNumber: 21
                                            }, this),
                                            !collapsed && badge ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badge} ${badgeColor === 'green' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badgeGreen : ''}`,
                                                children: badge
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                                lineNumber: 302,
                                                columnNumber: 23
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                        lineNumber: 282,
                                        columnNumber: 19
                                    }, this)
                                }, href, false, {
                                    fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                                    lineNumber: 268,
                                    columnNumber: 17
                                }, this);
                            })
                        ]
                    }, section, true, {
                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                        lineNumber: 261,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 259,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].toolbar,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].toggleBtn,
                    onClick: ()=>setCollapsed((c)=>!c),
                    "aria-expanded": !collapsed,
                    "aria-label": collapsed ? 'Expand sidebar' : 'Collapse sidebar',
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CollapseIcon, {
                        expanded: !collapsed
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                        lineNumber: 323,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                    lineNumber: 316,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 315,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                open: Boolean(showTip),
                targetEl: hoveredEl,
                placement: "right",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].flyoutPortal,
                content: hoveredItem ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        hoveredItem.label,
                        hoveredItem.badge ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].flyoutBadge} ${hoveredItem.badgeColor === 'green' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$scss__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].flyoutBadgeGreen : ''}`,
                            children: hoveredItem.badge
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                            lineNumber: 337,
                            columnNumber: 17
                        }, void 0) : null
                    ]
                }, void 0, true) : null
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
                lineNumber: 327,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/layout/Sidebar.tsx",
        lineNumber: 258,
        columnNumber: 5
    }, this);
}
_s(Sidebar, "OHgH1d+CaanT4ZrUa//iRfksDeo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c1 = Sidebar;
var _c, _c1;
__turbopack_context__.k.register(_c, "CollapseIcon");
__turbopack_context__.k.register(_c1, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_web_src_64fccebf._.js.map
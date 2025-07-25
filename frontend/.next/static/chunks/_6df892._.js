(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/_6df892._.js", {

"[project]/src/components/TextArea.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$incomplete$2d$json$2d$parser$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/incomplete-json-parser/dist/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
"use client";
;
;
const TextArea = ({ className, setIsGenerating, isGenerating, setOutputs, outputs })=>{
    _s();
    // Parser instance to handle incomplete JSON streaming responses
    const parser = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$incomplete$2d$json$2d$parser$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IncompleteJsonParser"]();
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const textAreaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Handles form submission
    async function submit(e) {
        e.preventDefault();
        sendMessage(text);
        setText("");
    }
    // Sends message to the api and handles streaming response processing
    const sendMessage = async (text)=>{
        const newOutputs = [
            ...outputs,
            {
                question: text,
                steps: [],
                result: {
                    answer: "",
                    tools_used: []
                }
            }
        ];
        setOutputs(newOutputs);
        setIsGenerating(true);
        try {
            const res = await fetch(`http://localhost:8000/invoke?content=${text}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(text)
            });
            if (!res.ok) {
                throw new Error("Error");
            }
            const data = res.body;
            if (!data) {
                setIsGenerating(false);
                return;
            }
            const reader = data.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let answer = {
                answer: "",
                tools_used: []
            };
            let currentSteps = [];
            let buffer = "";
            // Process streaming response chunks and parse steps/results
            while(!done){
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                let chunkValue = decoder.decode(value);
                // console.log(`chunk: ${chunkValue}`);
                if (!chunkValue) continue;
                buffer += chunkValue;
                // Handle different types of steps in the response stream - regular steps and final answer
                if (buffer.includes("</step_name>")) {
                    const stepNameMatch = buffer.match(/<step_name>([^<]*)<\/step_name>/);
                    if (stepNameMatch) {
                        const [_, stepName] = stepNameMatch;
                        try {
                            if (stepName !== "final_answer") {
                                const fullStepPattern = /<step><step_name>([^<]*)<\/step_name>([^<]*?)(?=<step>|<\/step>|$)/g;
                                const matches = [
                                    ...buffer.matchAll(fullStepPattern)
                                ];
                                for (const match of matches){
                                    const [fullMatch, matchStepName, jsonStr] = match;
                                    if (jsonStr) {
                                        try {
                                            const result = JSON.parse(jsonStr);
                                            currentSteps.push({
                                                name: matchStepName,
                                                result
                                            });
                                            buffer = buffer.replace(fullMatch, "");
                                        } catch (error) {}
                                    }
                                }
                            } else {
                                // If it's the final answer step, parse the streaming JSON using incomplete-json-parser
                                const jsonMatch = buffer.match(/(?<=<step><step_name>final_answer<\/step_name>)(.*)/);
                                if (jsonMatch) {
                                    const [_, jsonStr] = jsonMatch;
                                    parser.write(jsonStr);
                                    const result = parser.getObjects();
                                    answer = result;
                                    parser.reset();
                                }
                            }
                        } catch (e) {
                            console.log("Failed to parse step:", e);
                        }
                    }
                }
                // Update output with current content and steps
                setOutputs((prevState)=>{
                    const lastOutput = prevState[prevState.length - 1];
                    return [
                        ...prevState.slice(0, -1),
                        {
                            ...lastOutput,
                            steps: currentSteps,
                            result: answer
                        }
                    ];
                });
            }
        } catch (error) {
            console.error(error);
        } finally{
            setIsGenerating(false);
        }
    };
    // Submit form when Enter is pressed (without Shift)
    function submitOnEnter(e) {
        if (e.code === "Enter" && !e.shiftKey) {
            submit(e);
        }
    }
    // Dynamically adjust textarea height based on content
    const adjustHeight = ()=>{
        const textArea = textAreaRef.current;
        if (textArea) {
            textArea.style.height = "auto";
            textArea.style.height = `${textArea.scrollHeight}px`;
        }
    };
    // Adjust height whenever text content changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TextArea.useEffect": ()=>{
            adjustHeight();
        }
    }["TextArea.useEffect"], [
        text
    ]);
    // Add resize event listener to adjust height on window resize
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TextArea.useEffect": ()=>{
            const handleResize = {
                "TextArea.useEffect.handleResize": ()=>adjustHeight()
            }["TextArea.useEffect.handleResize"];
            window.addEventListener("resize", handleResize);
            return ({
                "TextArea.useEffect": ()=>window.removeEventListener("resize", handleResize)
            })["TextArea.useEffect"];
        }
    }["TextArea.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: submit,
        className: `flex gap-3 z-10 ${outputs.length > 0 ? "fixed bottom-0 left-0 right-0 container pb-5" : ""}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full flex items-center bg-gray-800 rounded border border-gray-600 text-white",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    ref: textAreaRef,
                    value: text,
                    onChange: (e)=>setText(e.target.value),
                    onKeyDown: (e)=>submitOnEnter(e),
                    rows: 1,
                    className: "w-full p-3 bg-transparent min-h-20 focus:outline-none resize-none",
                    placeholder: "Ask a question..."
                }, void 0, false, {
                    fileName: "[project]/src/components/TextArea.tsx",
                    lineNumber: 183,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "submit",
                    disabled: isGenerating || !text,
                    className: "disabled:bg-gray-500 bg-[#09BDE1] transition-colors w-9 h-9 rounded-full shrink-0 flex items-center justify-center mr-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ArrowIcon, {}, void 0, false, {
                        fileName: "[project]/src/components/TextArea.tsx",
                        lineNumber: 198,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/TextArea.tsx",
                    lineNumber: 193,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TextArea.tsx",
            lineNumber: 182,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/TextArea.tsx",
        lineNumber: 176,
        columnNumber: 5
    }, this);
};
_s(TextArea, "LTQV/mbkjZ2UARRdsKVyIKJAqV8=");
_c = TextArea;
const ArrowIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: "lucide lucide-arrow-right",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M5 12h14"
            }, void 0, false, {
                fileName: "[project]/src/components/TextArea.tsx",
                lineNumber: 218,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "m12 5 7 7-7 7"
            }, void 0, false, {
                fileName: "[project]/src/components/TextArea.tsx",
                lineNumber: 219,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TextArea.tsx",
        lineNumber: 206,
        columnNumber: 3
    }, this);
_c1 = ArrowIcon;
const __TURBOPACK__default__export__ = TextArea;
var _c, _c1;
__turbopack_refresh__.register(_c, "TextArea");
__turbopack_refresh__.register(_c1, "ArrowIcon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE$2 ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_CONTEXT_TYPE:
                return (type.displayName || "Context") + ".Provider";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function disabledLog() {}
    function disableLogs() {
        if (0 === disabledDepth) {
            prevLog = console.log;
            prevInfo = console.info;
            prevWarn = console.warn;
            prevError = console.error;
            prevGroup = console.group;
            prevGroupCollapsed = console.groupCollapsed;
            prevGroupEnd = console.groupEnd;
            var props = {
                configurable: !0,
                enumerable: !0,
                value: disabledLog,
                writable: !0
            };
            Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
            });
        }
        disabledDepth++;
    }
    function reenableLogs() {
        disabledDepth--;
        if (0 === disabledDepth) {
            var props = {
                configurable: !0,
                enumerable: !0,
                writable: !0
            };
            Object.defineProperties(console, {
                log: assign({}, props, {
                    value: prevLog
                }),
                info: assign({}, props, {
                    value: prevInfo
                }),
                warn: assign({}, props, {
                    value: prevWarn
                }),
                error: assign({}, props, {
                    value: prevError
                }),
                group: assign({}, props, {
                    value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                    value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                    value: prevGroupEnd
                })
            });
        }
        0 > disabledDepth && console.error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
    }
    function describeBuiltInComponentFrame(name) {
        if (void 0 === prefix) try {
            throw Error();
        } catch (x) {
            var match = x.stack.trim().match(/\n( *(at )?)/);
            prefix = match && match[1] || "";
            suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
        }
        return "\n" + prefix + name + suffix;
    }
    function describeNativeComponentFrame(fn, construct) {
        if (!fn || reentry) return "";
        var frame = componentFrameCache.get(fn);
        if (void 0 !== frame) return frame;
        reentry = !0;
        frame = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var previousDispatcher = null;
        previousDispatcher = ReactSharedInternals.H;
        ReactSharedInternals.H = null;
        disableLogs();
        try {
            var RunInRootFrame = {
                DetermineComponentFrameRoot: function() {
                    try {
                        if (construct) {
                            var Fake = function() {
                                throw Error();
                            };
                            Object.defineProperty(Fake.prototype, "props", {
                                set: function() {
                                    throw Error();
                                }
                            });
                            if ("object" === typeof Reflect && Reflect.construct) {
                                try {
                                    Reflect.construct(Fake, []);
                                } catch (x) {
                                    var control = x;
                                }
                                Reflect.construct(fn, [], Fake);
                            } else {
                                try {
                                    Fake.call();
                                } catch (x$0) {
                                    control = x$0;
                                }
                                fn.call(Fake.prototype);
                            }
                        } else {
                            try {
                                throw Error();
                            } catch (x$1) {
                                control = x$1;
                            }
                            (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {});
                        }
                    } catch (sample) {
                        if (sample && control && "string" === typeof sample.stack) return [
                            sample.stack,
                            control.stack
                        ];
                    }
                    return [
                        null,
                        null
                    ];
                }
            };
            RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
            var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
            namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", {
                value: "DetermineComponentFrameRoot"
            });
            var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
            if (sampleStack && controlStack) {
                var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
                for(_RunInRootFrame$Deter = namePropDescriptor = 0; namePropDescriptor < sampleLines.length && !sampleLines[namePropDescriptor].includes("DetermineComponentFrameRoot");)namePropDescriptor++;
                for(; _RunInRootFrame$Deter < controlLines.length && !controlLines[_RunInRootFrame$Deter].includes("DetermineComponentFrameRoot");)_RunInRootFrame$Deter++;
                if (namePropDescriptor === sampleLines.length || _RunInRootFrame$Deter === controlLines.length) for(namePropDescriptor = sampleLines.length - 1, _RunInRootFrame$Deter = controlLines.length - 1; 1 <= namePropDescriptor && 0 <= _RunInRootFrame$Deter && sampleLines[namePropDescriptor] !== controlLines[_RunInRootFrame$Deter];)_RunInRootFrame$Deter--;
                for(; 1 <= namePropDescriptor && 0 <= _RunInRootFrame$Deter; namePropDescriptor--, _RunInRootFrame$Deter--)if (sampleLines[namePropDescriptor] !== controlLines[_RunInRootFrame$Deter]) {
                    if (1 !== namePropDescriptor || 1 !== _RunInRootFrame$Deter) {
                        do if (namePropDescriptor--, _RunInRootFrame$Deter--, 0 > _RunInRootFrame$Deter || sampleLines[namePropDescriptor] !== controlLines[_RunInRootFrame$Deter]) {
                            var _frame = "\n" + sampleLines[namePropDescriptor].replace(" at new ", " at ");
                            fn.displayName && _frame.includes("<anonymous>") && (_frame = _frame.replace("<anonymous>", fn.displayName));
                            "function" === typeof fn && componentFrameCache.set(fn, _frame);
                            return _frame;
                        }
                        while (1 <= namePropDescriptor && 0 <= _RunInRootFrame$Deter)
                    }
                    break;
                }
            }
        } finally{
            reentry = !1, ReactSharedInternals.H = previousDispatcher, reenableLogs(), Error.prepareStackTrace = frame;
        }
        sampleLines = (sampleLines = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(sampleLines) : "";
        "function" === typeof fn && componentFrameCache.set(fn, sampleLines);
        return sampleLines;
    }
    function describeUnknownElementTypeFrameInDEV(type) {
        if (null == type) return "";
        if ("function" === typeof type) {
            var prototype = type.prototype;
            return describeNativeComponentFrame(type, !(!prototype || !prototype.isReactComponent));
        }
        if ("string" === typeof type) return describeBuiltInComponentFrame(type);
        switch(type){
            case REACT_SUSPENSE_TYPE:
                return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
                return describeBuiltInComponentFrame("SuspenseList");
        }
        if ("object" === typeof type) switch(type.$$typeof){
            case REACT_FORWARD_REF_TYPE:
                return type = describeNativeComponentFrame(type.render, !1), type;
            case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type);
            case REACT_LAZY_TYPE:
                prototype = type._payload;
                type = type._init;
                try {
                    return describeUnknownElementTypeFrameInDEV(type(prototype));
                } catch (x) {}
        }
        return "";
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, self, source, owner, props) {
        self = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== self ? self : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, source, self) {
        if ("string" === typeof type || "function" === typeof type || type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_OFFSCREEN_TYPE || "object" === typeof type && null !== type && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_CONSUMER_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_CLIENT_REFERENCE$1 || void 0 !== type.getModuleId)) {
            var children = config.children;
            if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
                for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren], type);
                Object.freeze && Object.freeze(children);
            } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else validateChildKeys(children, type);
        } else {
            children = "";
            if (void 0 === type || "object" === typeof type && null !== type && 0 === Object.keys(type).length) children += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            null === type ? isStaticChildren = "null" : isArrayImpl(type) ? isStaticChildren = "array" : void 0 !== type && type.$$typeof === REACT_ELEMENT_TYPE ? (isStaticChildren = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />", children = " Did you accidentally export a JSX literal instead of a component?") : isStaticChildren = typeof type;
            console.error("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", isStaticChildren, children);
        }
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, self, source, getOwner(), maybeKey);
    }
    function validateChildKeys(node, parentType) {
        if ("object" === typeof node && node && node.$$typeof !== REACT_CLIENT_REFERENCE) {
            if (isArrayImpl(node)) for(var i = 0; i < node.length; i++){
                var child = node[i];
                isValidElement(child) && validateExplicitKey(child, parentType);
            }
            else if (isValidElement(node)) node._store && (node._store.validated = 1);
            else if (null === node || "object" !== typeof node ? i = null : (i = MAYBE_ITERATOR_SYMBOL && node[MAYBE_ITERATOR_SYMBOL] || node["@@iterator"], i = "function" === typeof i ? i : null), "function" === typeof i && i !== node.entries && (i = i.call(node), i !== node)) for(; !(node = i.next()).done;)isValidElement(node.value) && validateExplicitKey(node.value, parentType);
        }
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function validateExplicitKey(element, parentType) {
        if (element._store && !element._store.validated && null == element.key && (element._store.validated = 1, parentType = getCurrentComponentErrorInfo(parentType), !ownerHasKeyUseWarning[parentType])) {
            ownerHasKeyUseWarning[parentType] = !0;
            var childOwner = "";
            element && null != element._owner && element._owner !== getOwner() && (childOwner = null, "number" === typeof element._owner.tag ? childOwner = getComponentNameFromType(element._owner.type) : "string" === typeof element._owner.name && (childOwner = element._owner.name), childOwner = " It was passed a child from " + childOwner + ".");
            var prevGetCurrentStack = ReactSharedInternals.getCurrentStack;
            ReactSharedInternals.getCurrentStack = function() {
                var stack = describeUnknownElementTypeFrameInDEV(element.type);
                prevGetCurrentStack && (stack += prevGetCurrentStack() || "");
                return stack;
            };
            console.error('Each child in a list should have a unique "key" prop.%s%s See https://react.dev/link/warning-keys for more information.', parentType, childOwner);
            ReactSharedInternals.getCurrentStack = prevGetCurrentStack;
        }
    }
    function getCurrentComponentErrorInfo(parentType) {
        var info = "", owner = getOwner();
        owner && (owner = getComponentNameFromType(owner.type)) && (info = "\n\nCheck the render method of `" + owner + "`.");
        info || (parentType = getComponentNameFromType(parentType)) && (info = "\n\nCheck the top-level render call using <" + parentType + ">.");
        return info;
    }
    var React = __turbopack_require__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler");
    Symbol.for("react.provider");
    var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, REACT_CLIENT_REFERENCE$2 = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, assign = Object.assign, REACT_CLIENT_REFERENCE$1 = Symbol.for("react.client.reference"), isArrayImpl = Array.isArray, disabledDepth = 0, prevLog, prevInfo, prevWarn, prevError, prevGroup, prevGroupCollapsed, prevGroupEnd;
    disabledLog.__reactDisabledLog = !0;
    var prefix, suffix, reentry = !1;
    var componentFrameCache = new ("function" === typeof WeakMap ? WeakMap : Map)();
    var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var didWarnAboutKeySpread = {}, ownerHasKeyUseWarning = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren, source, self) {
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, source, self);
    };
}();
}}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
} else {
    module.exports = __turbopack_require__("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}}),
"[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Scope = void 0;
class Scope {
    finish = false;
    write(letter) {
        return false;
    }
    getOrAssume() {
        return undefined;
    }
}
exports.Scope = Scope;
}}),
"[project]/node_modules/incomplete-json-parser/dist/scopes/literal.scope.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LiteralScope = void 0;
const scope_interface_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-client] (ecmascript)");
class LiteralScope extends scope_interface_1.Scope {
    content = "";
    write(letter) {
        if (this.finish) throw new Error("Literal already finished");
        this.content += letter;
        const assume = this.getOrAssume();
        if (typeof assume === "undefined") {
            this.content = this.content.slice(0, -1);
            return false;
        }
        if (typeof assume === "string" && this.content.length >= 2 && !this.content.endsWith('\\"') && this.content.endsWith('"') || typeof assume === "boolean" && this.content === "true" || typeof assume === "boolean" && this.content === "false" || assume === null && this.content === "null") {
            this.finish = true;
        }
        return true;
    }
    getOrAssume() {
        if (this.content === "") return null;
        if ("null".startsWith(this.content)) return null;
        if ("true".startsWith(this.content)) return true;
        if ("false".startsWith(this.content)) return false;
        if (this.content.startsWith('"')) {
            if (!this.content.endsWith('\\"') && this.content.endsWith('"')) return this.content.slice(1, -1).replaceAll('\\"', '"');
            return this.content.slice(1).replaceAll('\\"', '"');
        }
        if (this.content === "-") return 0;
        const numberRegex = /^-?\d+(\.\d*)?$/;
        if (numberRegex.test(this.content)) {
            return parseFloat(this.content);
        }
        return undefined;
    }
}
exports.LiteralScope = LiteralScope;
}}),
"[project]/node_modules/incomplete-json-parser/dist/scopes/utils.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isWhitespace = void 0;
const isWhitespace = (char)=>/\s/.test(char);
exports.isWhitespace = isWhitespace;
}}),
"[project]/node_modules/incomplete-json-parser/dist/scopes/object.scope.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ObjectScope = void 0;
const array_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/array.scope.js [app-client] (ecmascript)");
const literal_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/literal.scope.js [app-client] (ecmascript)");
const scope_interface_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-client] (ecmascript)");
const utils_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/utils.js [app-client] (ecmascript)");
class ObjectScope extends scope_interface_1.Scope {
    object = {};
    state = "key";
    keyScope;
    valueScope;
    write(letter) {
        if (this.finish) {
            throw new Error("Object already finished");
            return false;
        }
        if (Object.keys(this.object).length === 0 && this.state === "key" && this.keyScope === undefined && this.valueScope === undefined) {
            if (letter === "{") return true;
        }
        if (this.state === "key") {
            if (this.keyScope === undefined) {
                if ((0, utils_1.isWhitespace)(letter)) {
                    return true;
                } else if (letter === '"') {
                    this.keyScope = new literal_scope_1.LiteralScope();
                    return this.keyScope.write(letter);
                } else {
                    throw new Error(`Expected ", got ${letter}`);
                    return false;
                }
            } else {
                const success = this.keyScope.write(letter);
                const key = this.keyScope.getOrAssume();
                if (typeof key === "string") {
                    if (this.keyScope.finish) {
                        this.state = "colons";
                    }
                    return true;
                } else {
                    throw new Error(`Key is not a string: ${key}`);
                    return false;
                }
            }
        } else if (this.state === "colons") {
            if ((0, utils_1.isWhitespace)(letter)) {
                return true;
            } else if (letter === ":") {
                this.state = "value";
                this.valueScope = undefined;
                return true;
            } else {
                throw new Error(`Expected colons, got ${letter}`);
                return false;
            }
        } else if (this.state === "value") {
            if (this.valueScope === undefined) {
                if ((0, utils_1.isWhitespace)(letter)) {
                    return true;
                } else if (letter === "{") {
                    this.valueScope = new ObjectScope();
                    return this.valueScope.write(letter);
                } else if (letter === "[") {
                    this.valueScope = new array_scope_1.ArrayScope();
                    return this.valueScope.write(letter);
                } else {
                    this.valueScope = new literal_scope_1.LiteralScope();
                    return this.valueScope.write(letter);
                }
            } else {
                const success = this.valueScope.write(letter);
                if (this.valueScope.finish) {
                    const key = this.keyScope.getOrAssume();
                    this.object[key] = this.valueScope.getOrAssume();
                    this.state = "comma";
                    return true;
                } else if (success) {
                    return true;
                } else {
                    if ((0, utils_1.isWhitespace)(letter)) {
                        return true;
                    } else if (letter === ",") {
                        const key = this.keyScope.getOrAssume();
                        this.object[key] = this.valueScope.getOrAssume();
                        this.state = "key";
                        this.keyScope = undefined;
                        this.valueScope = undefined;
                        return true;
                    } else if (letter === "}") {
                        const key = this.keyScope.getOrAssume();
                        this.object[key] = this.valueScope.getOrAssume();
                        this.finish = true;
                        return true;
                    } else {
                        throw new Error(`Expected comma, got ${letter}`);
                    }
                }
            }
        } else if (this.state === "comma") {
            if ((0, utils_1.isWhitespace)(letter)) {
                return true;
            } else if (letter === ",") {
                this.state = "key";
                this.keyScope = undefined;
                this.valueScope = undefined;
                return true;
            } else if (letter === "}") {
                this.finish = true;
                return true;
            } else {
                throw new Error(`Expected comma or }, got "${letter}"`);
            }
        } else {
            throw new Error("Unexpected state");
            return false;
        }
    }
    getOrAssume() {
        const assume = {
            ...this.object
        };
        if (this.keyScope || this.valueScope) {
            const key = this.keyScope?.getOrAssume();
            const value = this.valueScope?.getOrAssume();
            if (typeof key === "string" && key.length > 0) {
                if (typeof value !== "undefined") assume[key] = value;
                else assume[key] = null;
            }
        }
        return assume;
    }
}
exports.ObjectScope = ObjectScope;
}}),
"[project]/node_modules/incomplete-json-parser/dist/scopes/array.scope.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ArrayScope = void 0;
const literal_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/literal.scope.js [app-client] (ecmascript)");
const object_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/object.scope.js [app-client] (ecmascript)");
const scope_interface_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-client] (ecmascript)");
const utils_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/utils.js [app-client] (ecmascript)");
class ArrayScope extends scope_interface_1.Scope {
    array = [];
    state = "value";
    scope;
    write(letter) {
        if (this.finish) {
            throw new Error("Array already finished");
        }
        if (this.array.length === 0 && this.state === "value" && this.scope === undefined) {
            if (letter === "[") {
                return true;
            }
        }
        if (this.state === "value") {
            if (this.scope === undefined) {
                if ((0, utils_1.isWhitespace)(letter)) {
                    return true;
                } else if (letter === "{") {
                    this.scope = new object_scope_1.ObjectScope();
                    this.array.push(this.scope);
                    return this.scope.write(letter);
                } else if (letter === "[") {
                    this.scope = new ArrayScope();
                    this.array.push(this.scope);
                    return this.scope.write(letter);
                } else {
                    this.scope = new literal_scope_1.LiteralScope();
                    this.array.push(this.scope);
                    const success = this.scope.write(letter);
                    return success;
                }
            } else {
                const success = this.scope.write(letter);
                if (success) {
                    if (this.scope.finish) this.state = "comma";
                    return true;
                } else {
                    if (this.scope.finish) {
                        this.state = "comma";
                        return true;
                    } else if (letter === ",") {
                        this.scope = undefined;
                    } else if (letter = "]") {
                        this.finish = true;
                        return true;
                    }
                    return true;
                }
            }
        } else if (this.state === "comma") {
            if ((0, utils_1.isWhitespace)(letter)) {
                return true;
            } else if (letter === ",") {
                this.state = "value";
                this.scope = undefined;
                return true;
            } else if (letter === "]") {
                this.finish = true;
                return true;
            } else {
                throw new Error(`Expected comma, got ${letter}`);
            }
        } else {
            throw new Error("Unexpected state");
        }
    }
    getOrAssume() {
        return this.array.map((scope)=>scope.getOrAssume());
    }
}
exports.ArrayScope = ArrayScope;
}}),
"[project]/node_modules/incomplete-json-parser/dist/scopes/index.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Scope = exports.ObjectScope = exports.LiteralScope = exports.ArrayScope = void 0;
const array_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/array.scope.js [app-client] (ecmascript)");
Object.defineProperty(exports, "ArrayScope", {
    enumerable: true,
    get: function() {
        return array_scope_1.ArrayScope;
    }
});
const literal_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/literal.scope.js [app-client] (ecmascript)");
Object.defineProperty(exports, "LiteralScope", {
    enumerable: true,
    get: function() {
        return literal_scope_1.LiteralScope;
    }
});
const object_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/object.scope.js [app-client] (ecmascript)");
Object.defineProperty(exports, "ObjectScope", {
    enumerable: true,
    get: function() {
        return object_scope_1.ObjectScope;
    }
});
const scope_interface_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-client] (ecmascript)");
Object.defineProperty(exports, "Scope", {
    enumerable: true,
    get: function() {
        return scope_interface_1.Scope;
    }
});
}}),
"[project]/node_modules/incomplete-json-parser/dist/IncompleteJsonParser.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IncompleteJsonParser = void 0;
const scopes_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/index.js [app-client] (ecmascript)");
const utils_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/utils.js [app-client] (ecmascript)");
class IncompleteJsonParser {
    scope;
    finish = false;
    static parse(chunk) {
        const parser = new IncompleteJsonParser();
        parser.write(chunk);
        return parser.getObjects();
    }
    reset() {
        this.scope = undefined;
        this.finish = false;
    }
    write(chunk) {
        for(let i = 0; i < chunk.length; i++){
            if (this.finish) throw new Error("Parser is already finished");
            const letter = chunk[i];
            if (this.scope === undefined) {
                if ((0, utils_1.isWhitespace)(letter)) continue;
                else if (letter === "{") this.scope = new scopes_1.ObjectScope();
                else if (letter === "[") this.scope = new scopes_1.ArrayScope();
                else this.scope = new scopes_1.LiteralScope();
                this.scope.write(letter);
            } else {
                const success = this.scope.write(letter);
                if (success) {
                    if (this.scope.finish) {
                        this.finish = true;
                        continue;
                    }
                } else {
                    throw new Error("Failed to parse the JSON string");
                }
            }
        }
    }
    getObjects() {
        if (this.scope) {
            return this.scope.getOrAssume();
        } else {
            throw new Error("No input to parse");
        }
    }
}
exports.IncompleteJsonParser = IncompleteJsonParser;
}}),
"[project]/node_modules/incomplete-json-parser/dist/index.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IncompleteJsonParser = void 0;
const IncompleteJsonParser_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/IncompleteJsonParser.js [app-client] (ecmascript)");
Object.defineProperty(exports, "IncompleteJsonParser", {
    enumerable: true,
    get: function() {
        return IncompleteJsonParser_1.IncompleteJsonParser;
    }
});
}}),
}]);

//# sourceMappingURL=_6df892._.js.map
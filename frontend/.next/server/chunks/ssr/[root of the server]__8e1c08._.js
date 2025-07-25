module.exports = {

"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
const mod = __turbopack_external_require__("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/src/components/TextArea.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$incomplete$2d$json$2d$parser$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/incomplete-json-parser/dist/index.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const TextArea = ({ className, setIsGenerating, isGenerating, setOutputs, outputs })=>{
    // Parser instance to handle incomplete JSON streaming responses
    const parser = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$incomplete$2d$json$2d$parser$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IncompleteJsonParser"]();
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const textAreaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        adjustHeight();
    }, [
        text
    ]);
    // Add resize event listener to adjust height on window resize
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleResize = ()=>adjustHeight();
        window.addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: submit,
        className: `flex gap-3 z-10 ${outputs.length > 0 ? "fixed bottom-0 left-0 right-0 container pb-5" : ""}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full flex items-center bg-gray-800 rounded border border-gray-600 text-white",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "submit",
                    disabled: isGenerating || !text,
                    className: "disabled:bg-gray-500 bg-[#09BDE1] transition-colors w-9 h-9 rounded-full shrink-0 flex items-center justify-center mr-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ArrowIcon, {}, void 0, false, {
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
const ArrowIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M5 12h14"
            }, void 0, false, {
                fileName: "[project]/src/components/TextArea.tsx",
                lineNumber: 218,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
const __TURBOPACK__default__export__ = TextArea;
}}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules ssr)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
} else {
    if ("TURBOPACK compile-time falsy", 0) {
        "TURBOPACK unreachable";
    } else {
        if ("TURBOPACK compile-time truthy", 1) {
            module.exports = __turbopack_require__("[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)");
        } else {
            "TURBOPACK unreachable";
        }
    }
} //# sourceMappingURL=module.compiled.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
module.exports = __turbopack_require__("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
module.exports = __turbopack_require__("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}}),
"[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
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
"[project]/node_modules/incomplete-json-parser/dist/scopes/literal.scope.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LiteralScope = void 0;
const scope_interface_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-ssr] (ecmascript)");
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
"[project]/node_modules/incomplete-json-parser/dist/scopes/utils.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isWhitespace = void 0;
const isWhitespace = (char)=>/\s/.test(char);
exports.isWhitespace = isWhitespace;
}}),
"[project]/node_modules/incomplete-json-parser/dist/scopes/object.scope.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ObjectScope = void 0;
const array_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/array.scope.js [app-ssr] (ecmascript)");
const literal_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/literal.scope.js [app-ssr] (ecmascript)");
const scope_interface_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-ssr] (ecmascript)");
const utils_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/utils.js [app-ssr] (ecmascript)");
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
"[project]/node_modules/incomplete-json-parser/dist/scopes/array.scope.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ArrayScope = void 0;
const literal_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/literal.scope.js [app-ssr] (ecmascript)");
const object_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/object.scope.js [app-ssr] (ecmascript)");
const scope_interface_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-ssr] (ecmascript)");
const utils_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/utils.js [app-ssr] (ecmascript)");
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
"[project]/node_modules/incomplete-json-parser/dist/scopes/index.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Scope = exports.ObjectScope = exports.LiteralScope = exports.ArrayScope = void 0;
const array_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/array.scope.js [app-ssr] (ecmascript)");
Object.defineProperty(exports, "ArrayScope", {
    enumerable: true,
    get: function() {
        return array_scope_1.ArrayScope;
    }
});
const literal_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/literal.scope.js [app-ssr] (ecmascript)");
Object.defineProperty(exports, "LiteralScope", {
    enumerable: true,
    get: function() {
        return literal_scope_1.LiteralScope;
    }
});
const object_scope_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/object.scope.js [app-ssr] (ecmascript)");
Object.defineProperty(exports, "ObjectScope", {
    enumerable: true,
    get: function() {
        return object_scope_1.ObjectScope;
    }
});
const scope_interface_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/scope.interface.js [app-ssr] (ecmascript)");
Object.defineProperty(exports, "Scope", {
    enumerable: true,
    get: function() {
        return scope_interface_1.Scope;
    }
});
}}),
"[project]/node_modules/incomplete-json-parser/dist/IncompleteJsonParser.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IncompleteJsonParser = void 0;
const scopes_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/index.js [app-ssr] (ecmascript)");
const utils_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/scopes/utils.js [app-ssr] (ecmascript)");
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
"[project]/node_modules/incomplete-json-parser/dist/index.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IncompleteJsonParser = void 0;
const IncompleteJsonParser_1 = __turbopack_require__("[project]/node_modules/incomplete-json-parser/dist/IncompleteJsonParser.js [app-ssr] (ecmascript)");
Object.defineProperty(exports, "IncompleteJsonParser", {
    enumerable: true,
    get: function() {
        return IncompleteJsonParser_1.IncompleteJsonParser;
    }
});
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__8e1c08._.js.map
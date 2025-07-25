// src/components/Output.tsx
"use client"; // Ensure this directive is at the very top for client-side hooks

import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Step, type ChatOutput } from "@/types";
import { useEffect, useState } from "react";

type ToolResult = {
  answer: string;
  tools_used: string[];
  image_url?: string;
  description?: string;
};

type OutputEntry = {
  question: string;
  steps: { name: string; result: Record<string, string> }[];
  result: ToolResult;
};

// Define the interface for your Output component's props
interface OutputProps {
  output: OutputEntry;
  isGenerating: boolean; // Added this prop to control loading state
}

const Output = ({ output, isGenerating }: OutputProps) => { // Destructure isGenerating here
  const detailsHidden = !!output.result?.answer;
  console.log("Output result:", output.result);
  return (
    <div className="border-t border-gray-700 py-10 first-of-type:pt-0 first-of-type:border-t-0">
      <p className="text-3xl">{output.question}</p>

      {/* Steps */}
      {output.steps.length > 0 && (
        <GenerationSteps steps={output.steps} done={detailsHidden} />
      )}

      {/* Output / Loading Spinner */}
      {/*
        Display loading spinner IF agent is generating AND the final answer is not yet available.
        Otherwise, display the MarkdownRenderer (if output.result.answer exists).
      */}
      {isGenerating && !output.result?.answer ? (
        // Loading state: Spinner and message
        <div className="mt-5 text-gray-500 animate-pulse">
          <p>MYRA is thinking...</p>
          <div className="flex justify-center items-center h-20">
            {/* Simple Tailwind CSS spinner SVG */}
            <svg
              className="animate-spin h-8 w-8 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      ) : (
        // Display the actual output answer once it's available
        // Ensure output.result.answer exists before rendering MarkdownRenderer
        output.result?.answer && (
          <div
            className="mt-5 prose dark:prose-invert min-w-full prose-pre:whitespace-pre-wrap text-gray-900"
            style={{
              overflowWrap: "anywhere",
            }}
          >
            <MarkdownRenderer content={output.result.answer} />

            {output.result?.image_url && (
              <div className="mt-5 flex justify-center">
                <img
                  src={`http://localhost:8000/${output.result.image_url}`}
                  alt="Generated Plot"
                  className="rounded-lg shadow-md max-w-full h-auto"
                />
              </div>
            )}
          </div>
        )
      )}

      {/* Tools */}
      {output.result?.tools_used?.length > 0 && (
        <div className="flex items-baseline mt-5 gap-1">
          <p className="text-xs text-gray-500">Tools used:</p>

          <div className="flex flex-wrap items-center gap-1">
            {output.result.tools_used.map((tool, i) => (
              <p
                key={i}
                className="text-xs px-1 py-[1px] bg-gray-800 rounded text-white"
              >
                {tool}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// GenerationSteps Component - This component also uses useState and useEffect
// For a clean separation, it's best practice to add "use client" to this file as well
// if it's a separate file, or keep it as part of Output.tsx if it's only used here.
// Assuming it's in the same file for minimal changes to your project structure.
const GenerationSteps = ({ steps, done }: { steps: Step[]; done: boolean }) => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (done) setHidden(true);
  }, [done]);

  return (
    <div className="border border-gray-700 rounded mt-5 p-3 flex flex-col">
      <button
        className="w-full text-left flex items-center justify-between"
        onClick={() => setHidden(!hidden)}
      >
        Steps {hidden ? <ChevronDown /> : <ChevronUp />}
      </button>

      {!hidden && (
        <div className="flex gap-2 mt-2">
          <div className="pt-2 flex flex-col items-center shrink-0">
            <span
              className={`inline-block w-3 h-3 transition-colors rounded-full ${
                !done ? "animate-pulse bg-emerald-400" : "bg-gray-500"
              }`}
            ></span>

            <div className="w-[1px] grow border-l border-gray-700"></div>
          </div>

          <div className="space-y-2.5">
            {steps.map((step, j) => {
              return (
                <div key={j}>
                  <p>{step.name}</p>

                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    {Object.entries(step.result).map(([key, value]) => {
                      return (
                        <p
                          key={key}
                          className="text-xs px-1.5 py-0.5 bg-gray-800 rounded text-white"
                        >
                          {key}: {value}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ChevronDown Component (No changes - doesn't use hooks)
const ChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-chevron-down"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// ChevronUp Component (No changes - doesn't use hooks)
const ChevronUp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-chevron-up"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

export default Output;
"use client";

import Output from "@/components/Output";
import TextArea from "@/components/TextArea";
import { type ChatOutput } from "@/types";
import { useState } from "react";
import MostRecentStrategyDisplay from "@/components/MostRecentStrategyDisplay";

export default function Home() {
  const [outputs, setOutputs] = useState<ChatOutput[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="flex min-h-screen bg-white text-black font-inter">
      {/* Sidebar - Takes 20% of the screen width */}
      <div className="w-1/5 p-4 border-r border-gray-300 flex-shrink-0 overflow-y-auto sticky top-0 h-screen">
        <MostRecentStrategyDisplay />
      </div>

      {/* Main content area - Takes the remaining 80% of the screen width */}
      <main
        // Main content area will now be scrollable if its content overflows.
        // We remove 'relative' as the fixed search bar will be relative to the viewport.
        className={`flex-1 flex flex-col items-center pt-10 overflow-y-auto`} // Added overflow-y-auto
      >
        {/*
          This div contains the "What do you want to know?" text and the Outputs.
          - w-full max-w-2xl mx-auto: Ensures horizontal centering and max-width.
          - flex-grow: Makes this div expand to fill available vertical space.
          - Conditional classes for vertical centering and bottom margin:
            - If no outputs: 'flex flex-col items-center justify-center flex-grow' for full vertical centering.
            - If outputs: 'mb-32' to provide space above the fixed search bar.
        */}
        <div
          className={`w-full max-w-2xl mx-auto ${
            outputs.length === 0
              ? "flex flex-col items-center justify-center flex-grow" // Vertically centers content and search bar
              : "flex-grow mb-32" // Pushes content up, provides space for fixed search bar
          }`}
        >
          {outputs.length === 0 && (
            <h1 className="text-4xl text-center mb-5">
              What do you want to know?
            </h1>
          )}

          {/* Render TextArea directly here when no outputs, so it's below the H1 */}
          {outputs.length === 0 && (
            <TextArea
              className={"bg-white text-black border border-gray-300 rounded-md p-3 w-full"}
              setIsGenerating={setIsGenerating}
              isGenerating={isGenerating}
              outputs={outputs}
              setOutputs={setOutputs}
            />
          )}

          {/* Outputs will render here */}
          {outputs.map((output, i) => (
            <Output key={i} output={output} isGenerating={isGenerating} />
          ))}
        </div>
      </main>

      {/*
        This div wraps the TextArea and is positioned FIXED at the bottom of the viewport
        ONLY when there are outputs.
        - fixed: Keeps it in place relative to the viewport during scroll.
        - bottom-0: Anchors it to the bottom of the viewport.
        - left-[20%]: Positions it to the right of the 20% sidebar.
        - right-0: Stretches it to the right edge of the viewport.
        - pb-8: Adds padding to ensure the search bar itself isn't right at the very edge.
        - z-10: Ensures it stays on top of other content.
      */}
      {outputs.length > 0 && (
        <div className="fixed bottom-0 left-[20%] right-0 pb-8 z-10">
          <div className="w-full max-w-2xl mx-auto"> {/* This div centers the textarea within the fixed area */}
            <TextArea
              className={"bg-white text-black border border-gray-300 rounded-md p-3 w-full"}
              setIsGenerating={setIsGenerating}
              isGenerating={isGenerating}
              outputs={outputs}
              setOutputs={setOutputs}
            />
          </div>
        </div>
      )}
    </div>
  );
}

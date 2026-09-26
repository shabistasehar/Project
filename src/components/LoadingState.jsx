import React from 'react';

/**
 * LoadingState component:
 * Displays a calm, Quizlet-inspired skeleton screen and status message
 * while the Groq LLM API processes and validates the flashcards.
 */
export default function LoadingState() {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6 items-center">
      {/* Skeleton Progress Bar */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
          <span className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-400 w-1/3 animate-pulse" />
        </div>
      </div>

      {/* Skeleton Card Container */}
      <div className="w-full h-[360px] sm:h-[380px] bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-between shadow-sm animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded-full mb-auto" />

        <div className="w-full flex flex-col items-center gap-3 my-auto px-4">
          <div className="h-5 w-5/6 bg-slate-200 rounded" />
          <div className="h-5 w-3/4 bg-slate-200 rounded" />
          <div className="h-5 w-2/3 bg-slate-100 rounded" />
        </div>

        <div className="h-3 w-36 bg-slate-100 rounded mt-auto" />
      </div>

      {/* Status Info */}
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">
          Generating study flashcards...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Groq AI is analyzing key concepts and validating JSON structure.
        </p>
      </div>
    </div>
  );
}

import React from 'react';

/**
 * ErrorState component:
 * Displays a friendly, diagnostic failure screen with explicit retry actions.
 * Handles malformed JSON, schema mismatch, rate limits, timeouts, and network drops.
 *
 * @param {{
 *   error: string,
 *   onRetry: () => void,
 *   onEditPrompt?: () => void
 * }} props
 */
export default function ErrorState({ error, onRetry, onEditPrompt }) {
  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
      <span className="inline-block text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
        Generation Error
      </span>

      <h2 className="text-lg font-semibold text-slate-900 mt-3">
        Unable to Generate Flashcards
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        We encountered an issue while requesting or validating the study deck:
      </p>

      {/* Error Diagnostic Box */}
      <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left">
        <p className="font-mono text-xs text-rose-800 break-words leading-relaxed">
          {error || 'An unexpected error occurred. Please verify your connection or try again.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-2">
        {onEditPrompt && (
          <button
            type="button"
            onClick={onEditPrompt}
            className="min-h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Edit Notes
          </button>
        )}

        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

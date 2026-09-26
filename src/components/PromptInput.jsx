import React from 'react';

/**
 * PromptInput component:
 * Free-form text input is the only way user information enters the application.
 *
 * @param {{
 *   prompt: string,
 *   setPrompt: (value: string) => void,
 *   onSubmit: () => void,
 *   isLoading: boolean
 * }} props
 */
export default function PromptInput({ prompt, setPrompt, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit();
    }
  };

  const charCount = prompt.length;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <label htmlFor="study-notes" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Study Notes or Topic
        </label>
        <span className="text-xs text-slate-400 font-mono">
          {charCount} characters
        </span>
      </div>

      <div className="relative">
        <textarea
          id="study-notes"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste your study notes, summary, or enter a topic (e.g. Cellular Respiration, React State Machine, World History)..."
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-y min-h-[110px]"
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        {prompt ? (
          <button
            type="button"
            onClick={() => setPrompt('')}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-2 py-1"
          >
            Clear text
          </button>
        ) : (
          <span className="text-xs text-slate-400 px-1">Minimum 1 word</span>
        )}

        <button
          type="submit"
          disabled={!prompt.trim()}
          className="min-h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors ml-auto"
        >
          Generate Flashcards
        </button>
      </div>
    </form>
  );
}

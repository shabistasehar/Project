import React, { useState, useRef } from 'react';
import PromptInput from './components/PromptInput.jsx';
import EmptyState from './components/EmptyState.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import ResultView from './components/ResultView.jsx';
import { generateFlashcards } from './lib/api.js';
import { validateResult } from './lib/validateResult.js';

export default function App() {
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'
  const [inputMode, setInputMode] = useState('notes'); // 'notes' | 'topic'
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState('');
  const [lastRequestParams, setLastRequestParams] = useState(null);
  const [cards, setCards] = useState(null);
  const [error, setError] = useState(null);

  // Stale-response guard using a monotonic request-id ref
  const requestId = useRef(0);

  const handleGenerate = async (params) => {
    let payload;
    if (typeof params === 'string') {
      payload = { prompt: params, mode: 'notes' };
    } else if (params && typeof params === 'object') {
      payload = params;
    } else {
      payload = inputMode === 'topic'
        ? { topic, mode: 'topic' }
        : { prompt, mode: 'notes' };
    }

    const contentToCheck = payload.mode === 'topic' ? payload.topic : payload.prompt;
    if (!contentToCheck || !contentToCheck.trim()) {
      return;
    }

    setLastRequestParams(payload);
    const currentId = ++requestId.current;
    setStatus('LOADING');
    setError(null);

    try {
      const raw = await generateFlashcards(payload);

      // Guard against stale responses resolving out of order
      if (currentId !== requestId.current) {
        console.warn(`[Request-ID Guard] Ignored stale response #${currentId} (latest is #${requestId.current})`);
        return;
      }

      // Defensive validation (returns data object on success, null on failure)
      const validated = validateResult(raw);
      if (!validated) {
        setStatus('ERROR');
        setError('The AI output was incomplete or formatted incorrectly. Expected non-empty cards with id, question, and answer.');
        return;
      }

      setCards(validated.cards);
      setStatus('SUCCESS');
    } catch (err) {
      if (currentId !== requestId.current) {
        return;
      }
      setStatus('ERROR');
      setError(err.message || 'An unexpected error occurred while communicating with the study assistant service.');
    }
  };

  const handleSelectSampleNotes = (sampleText) => {
    setInputMode('notes');
    setPrompt(sampleText);
    handleGenerate({ prompt: sampleText, mode: 'notes' });
  };

  const handleSelectSampleTopic = (sampleTopic) => {
    setInputMode('topic');
    setTopic(sampleTopic);
    handleGenerate({ topic: sampleTopic, mode: 'topic' });
  };

  const handleNewDeck = () => {
    setStatus('IDLE');
    setCards(null);
    setError(null);
  };

  const handleEditInput = () => {
    setStatus('IDLE');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">Study Assistant</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Notes • Files • Topics
            </span>
          </div>

          {status === 'SUCCESS' && (
            <button
              type="button"
              onClick={handleNewDeck}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-colors"
            >
              + Create New Deck
            </button>
          )}
        </div>
      </header>

      {/* Main Content State Router */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full flex flex-col justify-center">
        {status === 'IDLE' && (
          <div className="flex flex-col gap-6">
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              topic={topic}
              setTopic={setTopic}
              inputMode={inputMode}
              setInputMode={setInputMode}
              onSubmit={handleGenerate}
            />
            <EmptyState
              onSelectSampleNotes={handleSelectSampleNotes}
              onSelectSampleTopic={handleSelectSampleTopic}
            />
          </div>
        )}

        {status === 'LOADING' && (
          <LoadingState />
        )}

        {status === 'ERROR' && (
          <ErrorState
            error={error}
            onRetry={() => handleGenerate(lastRequestParams)}
            onEditPrompt={handleEditInput}
          />
        )}

        {status === 'SUCCESS' && cards && (
          <ResultView cards={cards} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 px-4 text-center">
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Quizlet-Inspired Anti-AI-Slop Interface • Pure CSS 3D Transforms • Groq LLM
        </p>
      </footer>
    </div>
  );
}

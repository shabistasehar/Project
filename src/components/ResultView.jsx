import React, { useState } from 'react';
import FlashcardDeck from './FlashcardDeck.jsx';
import QuizMode from './QuizMode.jsx';

/**
 * ResultView component:
 * Host container for the two interactive modes:
 *   1. Flashcard Deck (pure-CSS 3D flip card navigation)
 *   2. Quiz Mode (interactive testing, score tracking, re-test wrong cards)
 *
 * @param {{
 *   cards: Array<{ id: string, question: string, answer: string }>,
 *   onNewDeck: () => void
 * }} props
 */
export default function ResultView({ cards = [] }) {
  const [activeMode, setActiveMode] = useState('deck'); // 'deck' | 'quiz'
  const [testCards, setTestCards] = useState(cards);
  const [quizState, setQuizState] = useState('in_progress'); // 'in_progress' | 'completed'
  const [quizSummary, setQuizSummary] = useState(null);

  const handleQuizComplete = (summary) => {
    setQuizSummary(summary);
    setQuizState('completed');
  };

  const handleStartFullQuiz = () => {
    setTestCards(cards);
    setQuizSummary(null);
    setQuizState('in_progress');
    setActiveMode('quiz');
  };

  const handleRetestWrongOnly = () => {
    if (quizSummary?.wrongCards && quizSummary.wrongCards.length > 0) {
      setTestCards(quizSummary.wrongCards);
      setQuizSummary(null);
      setQuizState('in_progress');
    }
  };

  const scorePercent = quizSummary
    ? Math.round((quizSummary.correctCount / quizSummary.total) * 100)
    : 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode('deck')}
            className={`min-h-10 px-5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeMode === 'deck'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flashcard Deck ({cards.length})
          </button>

          <button
            type="button"
            onClick={handleStartFullQuiz}
            className={`min-h-10 px-5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeMode === 'quiz'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quiz Mode
          </button>
        </div>
      </div>

      {/* Mode 1: Flashcard Deck */}
      {activeMode === 'deck' && (
        <FlashcardDeck cards={cards} />
      )}

      {/* Mode 2: Quiz Mode */}
      {activeMode === 'quiz' && quizState === 'in_progress' && (
        <div>
          {testCards.length < cards.length && (
            <div className="max-w-lg mx-auto mb-4 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 text-center font-medium">
              Re-testing {testCards.length} previously missed {testCards.length === 1 ? 'card' : 'cards'}
            </div>
          )}
          <QuizMode
            cards={testCards}
            onComplete={handleQuizComplete}
            onExitQuiz={() => setActiveMode('deck')}
          />
        </div>
      )}

      {/* Mode 2: Quiz Summary / Re-Test View */}
      {activeMode === 'quiz' && quizState === 'completed' && quizSummary && (
        <div className="w-full max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm flex flex-col gap-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Quiz Completed
          </span>

          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold tracking-tight text-slate-900">
              {scorePercent}%
            </span>
            <p className="text-sm font-medium text-slate-600 mt-2">
              You got {quizSummary.correctCount} of {quizSummary.total} correct
            </p>
          </div>

          {/* Score Bar */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                scorePercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          {/* Feedback & Wrong Cards Summary */}
          {quizSummary.wrongCards.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Cards To Review ({quizSummary.wrongCards.length})
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  {quizSummary.wrongCards.map((card) => (
                    <li key={card.id} className="truncate">
                      <span className="font-medium text-slate-800">{card.question}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Locked Requirement: Re-test only wrong answers */}
              <button
                type="button"
                onClick={handleRetestWrongOnly}
                className="w-full min-h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-colors"
              >
                Re-test Only Wrong Answers ({quizSummary.wrongCards.length})
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <p className="text-sm font-semibold text-emerald-800">
                🎉 Perfect Score!
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                You mastered all questions in this study deck.
              </p>
            </div>
          )}

          {/* Secondary Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveMode('deck')}
              className="flex-1 min-h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              Review Full Deck
            </button>

            <button
              type="button"
              onClick={handleStartFullQuiz}
              className="flex-1 min-h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              Restart Full Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

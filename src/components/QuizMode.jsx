import React, { useState } from 'react';

/**
 * QuizMode component:
 * Interactive self-testing flow:
 *   1. Show Question
 *   2. Reveal Answer
 *   3. Mark Correct / Incorrect
 *   4. Track wrong cards for targeted re-testing
 *
 * @param {{
 *   cards: Array<{ id: string, question: string, answer: string }>,
 *   onComplete: (summary: { correctCount: number, wrongCards: Array<any>, total: number }) => void,
 *   onExitQuiz?: () => void
 * }} props
 */
export default function QuizMode({ cards = [], onComplete, onExitQuiz }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCards, setWrongCards] = useState([]);

  if (!cards || cards.length === 0) {
    return null;
  }

  const currentCard = cards[currentIndex];
  const total = cards.length;
  const progressPercent = Math.round(((currentIndex) / total) * 100);

  const handleMark = (isCorrect) => {
    const updatedCorrect = isCorrect ? correctCount + 1 : correctCount;
    const updatedWrong = isCorrect ? wrongCards : [...wrongCards, currentCard];

    if (isCorrect) {
      setCorrectCount(updatedCorrect);
    } else {
      setWrongCards(updatedWrong);
    }

    if (currentIndex + 1 < total) {
      setIsAnswerRevealed(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all cards in this round
      onComplete({
        correctCount: updatedCorrect,
        wrongCards: updatedWrong,
        total,
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
      {/* Quiz Progress & Stats Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Question {currentIndex + 1} of {total}</span>
          <span>Score: {correctCount} correct</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${Math.max(progressPercent, 5)}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm min-h-[360px] sm:min-h-[380px]">
        {/* Header Badge */}
        <div className="flex justify-between items-center mb-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Quiz Question
          </span>
          {onExitQuiz && (
            <button
              type="button"
              onClick={onExitQuiz}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Exit Quiz
            </button>
          )}
        </div>

        {/* Question Text */}
        <div className="my-auto w-full text-center overflow-y-auto max-h-[220px] px-2 py-4">
          <p className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed">
            {currentCard.question}
          </p>
        </div>

        {/* Revealed Answer Box */}
        {isAnswerRevealed && (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1 block">
              Correct Answer
            </span>
            <p className="text-base sm:text-lg font-normal text-slate-800 leading-relaxed">
              {currentCard.answer}
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2">
          {!isAnswerRevealed ? (
            <button
              type="button"
              onClick={() => setIsAnswerRevealed(true)}
              className="w-full min-h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-colors"
            >
              Reveal Answer
            </button>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleMark(false)}
                className="flex-1 min-h-11 px-3 sm:px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium text-xs sm:text-sm transition-colors"
              >
                ✕ Need Review
              </button>

              <button
                type="button"
                onClick={() => handleMark(true)}
                className="flex-1 min-h-11 px-3 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-colors"
              >
                ✓ Got It Right
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

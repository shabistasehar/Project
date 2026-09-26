import React, { useState } from 'react';

/**
 * FlashcardDeck component displays flashcards one card at a time.
 * Adheres strictly to the mandatory pure-CSS 3D flip card structure:
 *   .scene          -> perspective: 1000px
 *     .card         -> transform-style: preserve-3d, transition, relative, full size
 *       .card-face  -> absolute inset-0, backface-visibility: hidden, flex center content
 *         .front
 *         .back     -> transform: rotateY(180deg)
 *
 * @param {{ cards: Array<{ id: string, question: string, answer: string }> }} props
 */
export default function FlashcardDeck({ cards = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return null;
  }

  const currentCard = cards[currentIndex];
  const total = cards.length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
      {/* Progress Counter & Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Card {currentIndex + 1} of {total}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mandatory Pure-CSS 3D Flip Scene */}
      <div
        className="scene h-[360px] sm:h-[380px] cursor-pointer select-none"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard: ${isFlipped ? 'Answer shown' : 'Question shown'}. Click to flip.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        <div className={`card ${isFlipped ? 'is-flipped' : ''}`}>
          {/* Front Face: Question */}
          <div className="card-face front p-6 sm:p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-auto">
              Question
            </span>
            <div className="my-auto w-full text-center overflow-y-auto max-h-[220px] px-2">
              <p className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed">
                {currentCard.question}
              </p>
            </div>
            <div className="mt-auto flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Click or tap to reveal answer</span>
            </div>
          </div>

          {/* Back Face: Answer */}
          <div className="card-face back p-6 sm:p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-auto border border-indigo-100">
              Answer
            </span>
            <div className="my-auto w-full text-center overflow-y-auto max-h-[220px] px-2">
              <p className="text-lg sm:text-xl font-normal text-slate-800 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>
            <div className="mt-auto flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Click or tap to flip back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="min-h-11 px-3.5 sm:px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous card"
        >
          ← Prev
        </button>

        <button
          type="button"
          onClick={handleFlip}
          className="min-h-11 px-4 sm:px-6 rounded-xl bg-indigo-600 text-white font-medium text-xs sm:text-sm hover:bg-indigo-700 shadow-sm transition-colors"
          aria-label="Flip card"
        >
          {isFlipped ? 'Show Question' : 'Flip to Answer'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === total - 1}
          className="min-h-11 px-3.5 sm:px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next card"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

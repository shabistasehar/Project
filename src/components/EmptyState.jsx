import React from 'react';

/**
 * Text-only EmptyState component (strictly anti-AI-slop, no decorative illustrations).
 * Features simple guiding copy and interactive sample buttons.
 *
 * @param {{
 *   onSelectSampleNotes: (text: string) => void,
 *   onSelectSampleTopic: (topicTitle: string) => void
 * }} props
 */
export default function EmptyState({ onSelectSampleNotes, onSelectSampleTopic }) {
  const sampleTopics = [
    {
      title: 'Cellular Respiration',
      prompt: 'Cellular respiration is a set of metabolic reactions that convert chemical energy from nutrients into ATP. The three main stages are Glycolysis (in cytoplasm, produces 2 pyruvate and 2 ATP), the Krebs cycle / Citric Acid cycle (in mitochondrial matrix, produces electron carriers NADH and FADH2), and Oxidative Phosphorylation (in inner mitochondrial membrane, uses electron transport chain to produce ~30-32 ATP).',
    },
    {
      title: 'JavaScript Closures',
      prompt: 'A closure in JavaScript is the combination of a function bundled together with references to its surrounding lexical environment. In other words, a closure gives an inner function access to an outer function\'s scope even after the outer function has returned. Common uses include data privacy, currying, and event handlers.',
    },
    {
      title: 'Newton\'s Laws of Motion',
      prompt: 'Newton\'s Three Laws of Motion: 1. An object remains at rest or in uniform motion unless acted upon by a net external force (Inertia). 2. Force equals mass times acceleration (F = m * a). 3. For every action, there is an equal and opposite reaction.',
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
        Ready to Study
      </span>
      <h2 className="text-lg font-semibold text-slate-800 mt-2">
        Choose your study method
      </h2>
      <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
        Paste lecture notes, upload a study document (<span className="font-mono text-slate-600">.pdf, .txt, .md</span>), or simply specify any topic name to generate flashcards and an interactive quiz.
      </p>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Or try a sample topic:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {sampleTopics.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                if (onSelectSampleNotes) {
                  onSelectSampleNotes(item.prompt);
                } else if (onSelectSampleTopic) {
                  onSelectSampleTopic(item.title);
                }
              }}
              className="min-h-9 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium hover:bg-slate-100 hover:border-slate-300 transition-colors"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

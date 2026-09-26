import React, { useState, useRef } from 'react';
import { extractTextFromFile } from '../lib/api.js';

/**
 * PromptInput component:
 * Offers two intuitive creation workflows:
 *   1. "Study Notes & Files": Free-form text input or file upload (.txt, .md, .pdf, .csv)
 *   2. "Topic Explorer": Generate comprehensive flashcards directly from a topic name
 *
 * @param {{
 *   prompt: string,
 *   setPrompt: (value: string) => void,
 *   topic: string,
 *   setTopic: (value: string) => void,
 *   inputMode: 'notes' | 'topic',
 *   setInputMode: (mode: 'notes' | 'topic') => void,
 *   onSubmit: (options: { prompt?: string, topic?: string, mode: 'notes' | 'topic' }) => void
 * }} props
 */
export default function PromptInput({
  prompt,
  setPrompt,
  topic,
  setTopic,
  inputMode = 'notes',
  setInputMode,
  onSubmit,
}) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const topicPresets = [
    'Cellular Respiration',
    'JavaScript Event Loop',
    'World War II Timeline',
    'Neural Networks',
    'Supply and Demand',
  ];

  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileError(null);
    setIsExtracting(true);

    try {
      const extracted = await extractTextFromFile(file);
      setUploadedFile({
        name: extracted.filename,
        size: extracted.fileSize,
        wordCount: extracted.wordCount,
        pages: extracted.pages,
      });
      setPrompt(extracted.text);
    } catch (err) {
      console.error('File extraction failed:', err);
      setFileError(err.message || 'Could not extract text from the uploaded file.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMode === 'topic') {
      if (topic.trim()) {
        onSubmit({ topic: topic.trim(), mode: 'topic' });
      }
    } else {
      if (prompt.trim()) {
        onSubmit({ prompt: prompt.trim(), mode: 'notes' });
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const wordCount = prompt ? prompt.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setInputMode('notes')}
            className={`flex-1 sm:flex-initial min-h-10 px-5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              inputMode === 'notes'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Notes & Files
          </button>

          <button
            type="button"
            onClick={() => setInputMode('topic')}
            className={`flex-1 sm:flex-initial min-h-10 px-5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              inputMode === 'topic'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Generate by Topic
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* MODE 1: STUDY NOTES & FILE UPLOAD */}
        {inputMode === 'notes' && (
          <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            {/* File Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.markdown,.pdf,.csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                <span className="text-xl">📄</span>
                <p className="text-xs font-semibold text-slate-700">
                  {isExtracting
                    ? 'Extracting notes from file...'
                    : 'Upload notes document (.pdf, .txt, .md, .csv)'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Drag and drop here, or click to browse
                </p>
              </div>
            </div>

            {/* Uploaded File Chip */}
            {uploadedFile && (
              <div className="flex items-center justify-between gap-2 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-indigo-700 truncate">
                    {uploadedFile.name}
                  </span>
                  <span className="text-slate-500 text-[11px] whitespace-nowrap">
                    ({formatFileSize(uploadedFile.size)} • {uploadedFile.wordCount} words)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-0.5 rounded hover:bg-indigo-100/50 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}

            {/* File Extraction Error Notice */}
            {fileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {fileError}
              </div>
            )}

            {/* Notes Textarea */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between items-center px-0.5">
                <label
                  htmlFor="study-notes-input"
                  className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Notes Content
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  {wordCount} words ({prompt.length} chars)
                </span>
              </div>

              <textarea
                id="study-notes-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Paste your lecture notes, summaries, definitions, or type study material..."
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-y min-h-[120px]"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {prompt ? (
                <button
                  type="button"
                  onClick={() => {
                    setPrompt('');
                    handleRemoveFile();
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-1 py-1"
                >
                  Clear notes
                </button>
              ) : (
                <span className="text-xs text-slate-400">Minimum 1 word</span>
              )}

              <button
                type="submit"
                disabled={!prompt.trim() || isExtracting}
                className="min-h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors ml-auto"
              >
                Generate Flashcards
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: GENERATE BY TOPIC */}
        {inputMode === 'topic' && (
          <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="topic-input"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Topic or Subject Name
              </label>
              <p className="text-xs text-slate-500">
                No notes needed. Enter any topic or concept and the AI will create comprehensive study flashcards.
              </p>
            </div>

            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, React Hooks, French Revolution, Quantum Computing..."
              className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />

            {/* Topic Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Popular topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topicPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTopic(preset)}
                    className={`min-h-8 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      topic === preset
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              {topic ? (
                <button
                  type="button"
                  onClick={() => setTopic('')}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-1 py-1"
                >
                  Clear topic
                </button>
              ) : (
                <span className="text-xs text-slate-400">Enter a topic name</span>
              )}

              <button
                type="submit"
                disabled={!topic.trim()}
                className="min-h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors ml-auto"
              >
                Generate on Topic
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

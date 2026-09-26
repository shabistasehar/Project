/**
 * Client API utilities to interact with backend endpoints.
 * Handles flashcard generation (by notes, file, or topic) and document text extraction.
 */

/**
 * Generate flashcards from notes or topic.
 *
 * @param {string | { prompt?: string, topic?: string, mode?: 'notes' | 'topic' }} input
 * @returns {Promise<{ cards: Array<{ id: string, question: string, answer: string }> }>}
 */
export async function generateFlashcards(input) {
  const payload = typeof input === 'string'
    ? { prompt: input.trim(), mode: 'notes' }
    : {
        prompt: input.prompt ? input.prompt.trim() : undefined,
        topic: input.topic ? input.topic.trim() : undefined,
        mode: input.mode || (input.topic ? 'topic' : 'notes'),
      };

  const targetContent = payload.mode === 'topic' ? payload.topic : payload.prompt;
  if (!targetContent) {
    throw new Error(
      payload.mode === 'topic'
        ? 'Please enter a topic name before generating flashcards.'
        : 'Please enter study notes or upload a notes file.'
    );
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  if (!data) {
    throw new Error('Received an empty response from the server.');
  }

  return data;
}

/**
 * Extract readable text from uploaded study notes files.
 * Supports: .txt, .md, .markdown, .json, .csv (client-side) and .pdf (via backend proxy).
 *
 * @param {File} file
 * @returns {Promise<{ text: string, filename: string, fileSize: number, wordCount: number, pages?: number }>}
 */
export async function extractTextFromFile(file) {
  if (!file) {
    throw new Error('No file selected.');
  }

  const fileName = file.name || 'document';
  const ext = fileName.split('.').pop()?.toLowerCase();

  // 1. Text-based files: Native instant client-side read
  if (['txt', 'md', 'markdown', 'json', 'csv', 'rtf'].includes(ext)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result || '').toString().trim();
        if (!text) {
          reject(new Error('The uploaded file is empty. Please choose a file containing notes.'));
          return;
        }
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        resolve({
          text,
          filename: fileName,
          fileSize: file.size,
          wordCount,
          pages: 1,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read local file content.'));
      reader.readAsText(file);
    });
  }

  // 2. PDF documents: Backend proxy extraction using PDFParse
  if (ext === 'pdf') {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result.toString();
        const base64Data = result.split(',')[1] || result;
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to process PDF file.'));
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, filename: fileName }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error || `PDF extraction failed with status ${res.status}`);
    }

    return {
      text: data.text,
      filename: fileName,
      fileSize: file.size,
      wordCount: data.wordCount,
      pages: data.pages || 1,
    };
  }

  throw new Error(`Unsupported format (.${ext}). Please upload a .txt, .md, .pdf, or .csv document.`);
}

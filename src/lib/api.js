/**
 * Client API utility to request flashcards from the backend proxy.
 * The Groq API key is never exposed here — all traffic routes through /api/generate.
 *
 * @param {string} prompt - Free-form study notes or topic text
 * @param {AbortSignal} [signal] - Optional abort signal for request cancellation
 * @returns {Promise<any>} Raw parsed JSON from the server
 */
export async function generateFlashcards(prompt) {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Please enter study notes or a topic before generating flashcards.');
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: prompt.trim() }),
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

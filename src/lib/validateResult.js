/**
 * Validates the raw response from the LLM or API against the locked schema:
 * {
 *   "cards": [
 *     {
 *       "id": "string",
 *       "question": "string",
 *       "answer": "string"
 *     }
 *   ]
 * }
 *
 * Conforms to the reference guide specification:
 * Returns the validated data object on success, or null on any failure.
 *
 * @param {any} raw
 * @returns {{ cards: Array<{ id: string, question: string, answer: string }> } | null}
 */
export function validateResult(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.cards) || data.cards.length === 0) {
    return null;
  }

  const isValid = data.cards.every(
    (card) =>
      card &&
      typeof card === 'object' &&
      !Array.isArray(card) &&
      typeof card.id === 'string' &&
      card.id.trim() &&
      typeof card.question === 'string' &&
      card.question.trim() &&
      typeof card.answer === 'string' &&
      card.answer.trim()
  );

  return isValid ? data : null;
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Document Text Extraction Endpoint (PDF / Documents)
app.post('/api/extract', async (req, res) => {
  try {
    const { base64, filename } = req.body || {};
    if (!base64) {
      return res.status(400).json({ error: 'No document data provided.' });
    }

    const buffer = Buffer.from(base64, 'base64');
    const parser = new PDFParse(new Uint8Array(buffer));
    await parser.load();
    const result = await parser.getText();
    const text = result?.text?.trim() || '';

    if (!text) {
      return res.status(422).json({
        error: 'No readable text could be extracted from this PDF document (it may contain only scanned images or be password-protected).',
      });
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return res.json({
      text,
      pages: result.total || 1,
      wordCount,
      filename: filename || 'document.pdf',
    });
  } catch (err) {
    console.error('Error parsing document:', err);
    return res.status(500).json({
      error: 'Failed to extract text from the uploaded document.',
      details: err.message,
    });
  }
});

// Flashcard Generation Proxy Endpoint (Supports Study Notes, File Notes, and Topic-only Generation)
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, topic, mode = 'notes' } = req.body || {};

    const isTopicMode = mode === 'topic' || (!prompt && Boolean(topic));
    const contentToUse = isTopicMode ? topic : prompt;

    if (!contentToUse || typeof contentToUse !== 'string' || !contentToUse.trim()) {
      return res.status(400).json({
        error: isTopicMode
          ? 'Please specify a valid topic name (e.g. Photosynthesis, React Hooks, French Revolution).'
          : 'Please provide valid, non-empty study notes or upload a notes file.',
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'gsk_your_groq_api_key_here') {
      return res.status(500).json({
        error: 'GROQ_API_KEY is missing. Please add your Groq API key to the .env file to enable generation.',
      });
    }

    const systemPrompt = isTopicMode
      ? `You are an expert educator and study assistant. The user wants to learn about the topic: "${contentToUse.trim()}". Generate between 4 and 10 high-quality, comprehensive study flashcards that thoroughly teach this topic from fundamentals to key concepts, core mechanisms or principles, and real-world applications. Ensure questions test deep understanding rather than superficial trivia.
Return ONLY the JSON object. No markdown, no code fences, no explanations, no extra keys, no introductory or closing text.
The JSON must strictly conform to this schema:
{
  "cards": [
    {
      "id": "card-1",
      "question": "Clear, concise question",
      "answer": "Accurate, digestible answer"
    }
  ]
}`
      : `You are a specialized study assistant. Given study notes or text from the user, generate between 3 and 10 high-quality, concise study flashcards that directly test the key concepts, definitions, and facts in these notes.
Return ONLY the JSON object. No markdown, no code fences, no explanations, no extra keys, no introductory or closing text.
The JSON must strictly conform to this schema:
{
  "cards": [
    {
      "id": "card-1",
      "question": "Clear, concise question",
      "answer": "Accurate, digestible answer"
    }
  ]
}`;

    const userContent = isTopicMode
      ? `Topic to study:\n${contentToUse.trim()}`
      : `Study Notes / Text:\n${contentToUse.trim()}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Groq API responded with status ${groqResponse.status}`;

      if (groqResponse.status === 429) {
        return res.status(429).json({
          error: 'Groq API rate limit reached. Please wait a few seconds and try again.',
        });
      }

      if (groqResponse.status === 401) {
        return res.status(401).json({
          error: 'Invalid Groq API key. Please check your GROQ_API_KEY in the .env file.',
        });
      }

      return res.status(groqResponse.status).json({
        error: `LLM service error: ${errorMessage}`,
      });
    }

    const data = await groqResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        error: 'Empty response received from LLM service.',
      });
    }

    // Parse the JSON content
    let parsedCards;
    try {
      parsedCards = JSON.parse(content);
    } catch {
      return res.status(502).json({
        error: 'LLM returned malformed JSON syntax.',
        raw: content,
      });
    }

    return res.json(parsedCards);
  } catch (err) {
    console.error('Server error during generation:', err);
    return res.status(500).json({
      error: err.message || 'An unexpected internal server error occurred.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy server listening on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Flashcard Generation Proxy Endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'Please provide valid, non-empty study notes or topic text.',
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'gsk_your_groq_api_key_here') {
      return res.status(500).json({
        error: 'GROQ_API_KEY is missing. Please add your Groq API key to the .env file to enable generation.',
      });
    }

    const systemPrompt = `You are a specialized study assistant. Given notes or a topic from the user, generate between 3 and 10 high-quality, concise study flashcards.
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
          { role: 'user', content: `Study Notes / Topic:\n${prompt.trim()}` },
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

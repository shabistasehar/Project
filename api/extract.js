import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

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
    return res.status(200).json({
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
}

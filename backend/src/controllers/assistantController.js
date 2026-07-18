// backend/src/controllers/assistantController.js
const SYSTEM_PROMPT = `You are FarmerLearn's in-app assistant, helping small-scale farmers in Kenya with
practical agricultural questions (crops, livestock, pest and disease management, soil health,
irrigation, post-harvest handling, and market access).

Rules:
- Keep answers short, practical, and easy to follow — assume a mobile screen and no technical background.
- Use simple language and short paragraphs or numbered steps, not long essays.
- If a question is unrelated to farming, politely redirect the user back to agricultural topics.
- If you are not confident about something (e.g. a specific pesticide name or local regulation),
  say so plainly and suggest the farmer consult a local agricultural extension officer.
- Never invent specific product names, dosages, or regulations you are not sure about.`;

exports.ask = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'A question is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ message: 'AI assistant is not configured on the server' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: question.trim() }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(502).json({ message: 'AI assistant is temporarily unavailable' });
    }

    const data = await response.json();
    const answer = data.content?.[0]?.text || 'Sorry, I could not generate an answer.';

    res.json({ answer });
  } catch (err) {
    console.error('assistant ask error:', err);
    res.status(500).json({ message: 'Server error while contacting the AI assistant' });
  }
};
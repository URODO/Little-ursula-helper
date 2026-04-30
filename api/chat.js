export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, system } = req.body;

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { maxOutputTokens: 1000 }
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!text) {
      console.error('Unexpected response structure:', JSON.stringify(data));
      return res.status(200).json({ text: 'Sorry, I could not get a response. Please try again.' });
    }

    res.status(200).json({ text });
  } catch (e) {
    console.error('Error:', e);
    res.status(500).json({ error: 'Server error' });
  }
}

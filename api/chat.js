export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, system } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();
    console.log('Anthropic response:', JSON.stringify(data));

    const text = data?.content?.[0]?.text || null;

    if (!text) {
      console.error('Unexpected response:', JSON.stringify(data));
      return res.status(200).json({ text: 'Sorry, I could not get a response. Please try again.' });
    }

    res.status(200).json({ text });
  } catch (e) {
    console.error('Error:', e);
    res.status(500).json({ error: 'Server error' });
  }
}

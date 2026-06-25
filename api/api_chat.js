export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-xlarge-nightly',
        prompt: message,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data && data.generations && data.generations.length > 0) {
      return res.status(200).json({ text: data.generations[0].text });
    } else {
      return res.status(500).json({ error: 'Failed to generate text from Cohere AI' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Construct messages array
    const messages = [
      {
        role: 'system',
        content: 'You are MindCareAI, a compassionate and trauma-informed AI mental health assistant. Speak kindly and supportively. Be empathetic and never repeat the same phrase like "tell me more about what\'s been on your mind lately." Always respond in a context-aware way. Your role is to guide users through difficult emotions, gently validate their feelings, and avoid sounding robotic.'
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.5,
      frequency_penalty: 0.5,
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

    res.status(200).json({
      reply,
      raw: completion
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    let errorMessage = 'An error occurred while processing your request.';
    let statusCode = 500;

    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please try again later.';
      statusCode = 503;
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'OpenAI API key is invalid or missing.';
      statusCode = 401;
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
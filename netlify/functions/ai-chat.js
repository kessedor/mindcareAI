export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    const { message, history = [] } = JSON.parse(event.body || '{}');

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required and must be a string' })
      };
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    // Construct messages array with full conversation history
    const systemPrompt = {
      role: "system",
      content: "You are MindCareAI, a compassionate and trauma-informed AI mental health assistant. You provide personalized, context-aware responses based on the full conversation history. Never repeat generic phrases like 'tell me more about what's been on your mind lately.' Instead, reference what the user has specifically shared and build upon previous exchanges. Be empathetic, supportive, and remember details from earlier in the conversation. Keep responses concise but meaningful, and always respond in a way that shows you're actively listening and remembering what the user has told you."
    };

    // Include the FULL conversation history
    const messages = [systemPrompt, ...history, { role: "user", content: message }];

    console.log('Sending to OpenAI:', {
      messageCount: messages.length,
      historyLength: history.length,
      lastUserMessage: message
    });

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.8,
        max_tokens: 500,
        presence_penalty: 0.6,  // Encourage new topics
        frequency_penalty: 0.7  // Discourage repetition
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', response.status, errorData);
      
      let errorMessage = 'Failed to get response from AI service';
      
      if (response.status === 401) {
        errorMessage = 'Invalid OpenAI API key';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (response.status === 402) {
        errorMessage = 'OpenAI API quota exceeded';
      }

      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: errorMessage })
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    console.log('OpenAI Response:', {
      reply: reply.substring(0, 100) + '...',
      usage: data.usage
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        reply, 
        raw: data 
      })
    };

  } catch (error) {
    console.error('Function Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
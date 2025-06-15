const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
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
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('🚀 AI Chat function called');
    console.log('📋 Event details:', {
      httpMethod: event.httpMethod,
      path: event.path,
      headers: Object.keys(event.headers || {}),
      bodyLength: event.body?.length || 0,
      isBase64Encoded: event.isBase64Encoded
    });

    // Parse request body
    let requestData;
    try {
      const body = event.isBase64Encoded ? 
        Buffer.from(event.body, 'base64').toString() : 
        event.body;
      
      requestData = JSON.parse(body || '{}');
      console.log('📝 Parsed request data:', {
        hasMessage: !!requestData.message,
        messageLength: requestData.message?.length || 0,
        historyLength: requestData.history?.length || 0
      });
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { message, history = [] } = requestData;

    // Validate input
    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message:', { message, type: typeof message });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required and must be a string' })
      };
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    console.log('🔑 OpenAI API key found (first 10 chars):', process.env.OPENAI_API_KEY.substring(0, 10) + '...');

    // Construct messages array with system prompt and conversation history
    const systemPrompt = {
      role: "system",
      content: "You are MindCareAI, a compassionate and trauma-informed AI mental health assistant. You provide personalized, context-aware responses based on the full conversation history. Never repeat generic phrases like 'tell me more about what's been on your mind lately.' Instead, reference what the user has specifically shared and build upon previous exchanges. Be empathetic, supportive, and remember details from earlier in the conversation. Keep responses concise but meaningful (2-3 sentences), and always respond in a way that shows you're actively listening and remembering what the user has told you. Provide practical coping strategies when appropriate. You can communicate in any language the user prefers - respond in the same language they use."
    };

    // Include the FULL conversation history to maintain context
    const messages = [systemPrompt, ...history, { role: "user", content: message }];

    console.log('💬 Sending to OpenAI:', {
      totalMessages: messages.length,
      historyLength: history.length,
      userMessage: message.substring(0, 100) + (message.length > 100 ? '...' : '')
    });

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.8,
        max_tokens: 300,
        presence_penalty: 0.6,  // Encourage new topics
        frequency_penalty: 0.7, // Discourage repetition
        top_p: 0.9
      })
    });

    console.log('📡 OpenAI Response status:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API Error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorText
      });
      
      let errorMessage = 'Failed to get response from AI service';
      
      if (openaiResponse.status === 401) {
        errorMessage = 'Invalid OpenAI API key';
      } else if (openaiResponse.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (openaiResponse.status === 402) {
        errorMessage = 'OpenAI API quota exceeded';
      } else if (openaiResponse.status === 400) {
        errorMessage = 'Invalid request to OpenAI API';
      }

      return {
        statusCode: openaiResponse.status,
        headers,
        body: JSON.stringify({ error: errorMessage, details: errorText })
      };
    }

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    console.log('✅ OpenAI Response received:', {
      reply: reply.substring(0, 100) + (reply.length > 100 ? '...' : ''),
      usage: data.usage,
      finishReason: data.choices?.[0]?.finish_reason
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
    console.error('💥 Function Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      })
    };
  }
};
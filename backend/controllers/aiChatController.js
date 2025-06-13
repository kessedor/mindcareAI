import OpenAI from 'openai';
import { logger } from '../config/logger.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock conversation storage (replace with actual database)
const conversations = [];

// Generic responses to detect and avoid
const GENERIC_RESPONSES = [
  "Thank you for sharing that with me. It takes courage to open up about how you're feeling. Can you tell me more about what's been on your mind lately?",
  "I understand that you're feeling this way. It's important to acknowledge these feelings.",
  "That's a very insightful observation. Many people experience similar feelings.",
  "I appreciate you opening up about this. It takes courage to share personal experiences.",
  "It sounds like you're being very reflective about your situation. That's a positive step."
];

const isGenericResponse = (response) => {
  return GENERIC_RESPONSES.some(generic => 
    response.toLowerCase().includes(generic.toLowerCase().substring(0, 50))
  );
};

const testOpenAIConnection = async () => {
  try {
    logger.info('Testing OpenAI connection...');
    
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OPENAI_API_KEY not configured',
        code: 'CONFIG_ERROR'
      };
    }

    const testResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a test assistant. Respond with exactly: "Connection successful"'
        },
        {
          role: 'user',
          content: 'Test connection'
        }
      ],
      max_tokens: 10,
      temperature: 0
    });

    const response = testResponse.choices[0]?.message?.content;
    
    return {
      success: true,
      response,
      usage: testResponse.usage,
      model: testResponse.model
    };
  } catch (error) {
    logger.error('OpenAI connection test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
};

const generateDynamicSystemPrompt = (userMessage) => {
  return `You are MindCareAI, a compassionate and empathetic AI mental health assistant.

CRITICAL INSTRUCTIONS FOR THIS SPECIFIC MESSAGE:
The user just said: "${userMessage}"

You MUST:
1. Respond SPECIFICALLY and DIRECTLY to what they just shared: "${userMessage}"
2. Reference their exact words and situation
3. Provide a UNIQUE response that shows you understood their specific message
4. NEVER use generic therapeutic responses
5. Be conversational and natural, not clinical

FORBIDDEN RESPONSES:
- Do NOT say "Thank you for sharing that with me"
- Do NOT ask "Can you tell me more about what's been on your mind lately?"
- Do NOT use any generic therapeutic language
- Do NOT ignore what they specifically said

REQUIRED APPROACH:
- Address their specific situation directly
- Show you heard and understood their exact message
- Provide relevant, personalized support
- Ask follow-up questions that relate to what they shared
- Use their own words when appropriate

Current user message to respond to: "${userMessage}"

Remember: Each person's experience is unique. Respond to THEIR specific message, not a template.`;
};

const aiChatController = {
  // Test endpoint for OpenAI connectivity
  testConnection: async (req, res) => {
    try {
      const result = await testOpenAIConnection();
      res.json(result);
    } catch (error) {
      logger.error('Test connection error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test connection',
        code: 'TEST_ERROR'
      });
    }
  },

  // Send message to AI therapist
  sendMessage: async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      const userId = req.user.id;

      logger.info('=== AI CHAT REQUEST START ===', {
        userId,
        messagePreview: message.substring(0, 100),
        conversationId,
        timestamp: new Date().toISOString(),
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0
      });

      // Enhanced input validation
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Message content is required and must be a non-empty string',
          code: 'INVALID_INPUT'
        });
      }

      if (message.length > 2000) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Message too long. Please keep it under 2000 characters.',
          code: 'MESSAGE_TOO_LONG'
        });
      }

      // Check OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        logger.error('OpenAI API key is not configured!');
        return res.status(500).json({
          error: 'Configuration Error',
          message: 'AI service is not properly configured. Please check server configuration.',
          code: 'CONFIG_ERROR'
        });
      }

      // Find or create conversation
      let conversation = conversations.find(c => c.id === conversationId && c.userId === userId);
      if (!conversation) {
        conversation = {
          id: conversationId || `conv_${Date.now()}_${userId}`,
          userId,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        conversations.push(conversation);
        logger.info('Created new conversation:', { conversationId: conversation.id });
      }

      // Add user message to conversation
      const userMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        emotion: await analyzeEmotion(message),
      };
      conversation.messages.push(userMessage);

      logger.info('Added user message:', {
        messageId: userMessage.id,
        emotion: userMessage.emotion,
        contentPreview: userMessage.content.substring(0, 100)
      });

      // Prepare conversation history (last 6 messages for context)
      const recentMessages = conversation.messages.slice(-6);
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate dynamic system prompt
      const systemPrompt = {
        role: 'system',
        content: generateDynamicSystemPrompt(message)
      };

      // Prepare messages for OpenAI
      const messagesForAI = [systemPrompt, ...conversationHistory];

      logger.info('=== OPENAI API REQUEST ===', {
        model: 'gpt-3.5-turbo',
        messageCount: messagesForAI.length,
        systemPromptLength: systemPrompt.content.length,
        userMessagePreview: message.substring(0, 100),
        conversationHistoryLength: conversationHistory.length
      });

      // Enhanced OpenAI API call with retry logic
      let completion;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          
          completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messagesForAI,
            max_tokens: 300,
            temperature: 0.8, // Increased for more creativity
            presence_penalty: 0.6, // Increased to avoid repetition
            frequency_penalty: 0.7, // Increased to avoid repetitive phrases
            top_p: 0.9,
            user: userId,
          });

          break; // Success, exit retry loop
        } catch (apiError) {
          logger.error(`OpenAI API attempt ${attempts} failed:`, {
            error: apiError.message,
            code: apiError.code,
            status: apiError.status
          });

          if (attempts === maxAttempts) {
            throw apiError; // Re-throw after all attempts failed
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      logger.info('=== OPENAI API RESPONSE ===', {
        choices: completion.choices?.length || 0,
        finishReason: completion.choices?.[0]?.finish_reason,
        usage: completion.usage,
        model: completion.model
      });

      // Enhanced response validation
      if (!completion || !completion.choices || completion.choices.length === 0) {
        throw new Error('No choices returned from OpenAI API');
      }

      const choice = completion.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error('No message content in OpenAI response');
      }

      let aiResponse = choice.message.content.trim();

      // Check for generic responses and regenerate if needed
      if (isGenericResponse(aiResponse)) {
        logger.warn('Generic response detected, regenerating...', {
          response: aiResponse.substring(0, 100)
        });

        // Try one more time with even more specific instructions
        const specificSystemPrompt = {
          role: 'system',
          content: `URGENT: The user said "${message}". You MUST respond specifically to this. Do not use any generic responses. Address their exact situation directly and personally.`
        };

        const retryCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [specificSystemPrompt, { role: 'user', content: message }],
          max_tokens: 300,
          temperature: 0.9,
          presence_penalty: 0.8,
          frequency_penalty: 0.8,
          user: userId,
        });

        aiResponse = retryCompletion.choices[0]?.message?.content?.trim() || aiResponse;
      }

      // Final validation
      if (!aiResponse || aiResponse.length < 10) {
        throw new Error('AI response too short or empty');
      }

      logger.info('=== FINAL AI RESPONSE ===', {
        responseLength: aiResponse.length,
        responsePreview: aiResponse.substring(0, 150),
        isGeneric: isGenericResponse(aiResponse),
        finishReason: choice.finish_reason
      });

      // Add AI response to conversation
      const aiMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      conversation.messages.push(aiMessage);
      conversation.updatedAt = new Date().toISOString();

      // Return successful response
      res.json({
        message: 'Message sent successfully',
        conversationId: conversation.id,
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          timestamp: userMessage.timestamp,
          emotion: userMessage.emotion,
        },
        aiMessage: {
          id: aiMessage.id,
          content: aiMessage.content,
          timestamp: aiMessage.timestamp,
        },
        usage: completion.usage,
        model: completion.model
      });

    } catch (error) {
      logger.error('=== AI CHAT ERROR ===', {
        error: error.message,
        stack: error.stack,
        openaiError: error.response?.data,
        statusCode: error.response?.status,
        code: error.code
      });

      // Enhanced error handling with specific error codes
      let errorResponse = {
        error: 'Internal Server Error',
        message: 'Failed to process your message. Please try again.',
        code: 'UNKNOWN_ERROR'
      };

      if (error.code === 'insufficient_quota') {
        errorResponse = {
          error: 'Service Unavailable',
          message: 'AI service quota exceeded. Please try again later.',
          code: 'QUOTA_EXCEEDED'
        };
        res.status(503);
      } else if (error.code === 'rate_limit_exceeded') {
        errorResponse = {
          error: 'Too Many Requests',
          message: 'Please wait a moment before sending another message.',
          code: 'RATE_LIMIT'
        };
        res.status(429);
      } else if (error.status === 401 || error.code === 'invalid_api_key') {
        errorResponse = {
          error: 'Service Unavailable',
          message: 'AI service authentication failed. Please check configuration.',
          code: 'AUTH_ERROR'
        };
        res.status(503);
      } else {
        res.status(500);
      }

      // Include debug info in development
      if (process.env.NODE_ENV === 'development') {
        errorResponse.debug = {
          originalError: error.message,
          code: error.code,
          status: error.status
        };
      }

      res.json(errorResponse);
    }
  },

  // Test endpoint to verify backend is working
  test: async (req, res) => {
    logger.info('=== TEST ENDPOINT CALLED ===', {
      timestamp: new Date().toISOString(),
      user: req.user,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });

    const connectionTest = await testOpenAIConnection();

    res.json({
      message: 'Backend is working!',
      timestamp: new Date().toISOString(),
      user: req.user,
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      environment: process.env.NODE_ENV,
      model: 'gpt-3.5-turbo',
      connectionTest
    });
  },

  // Get conversation history
  getConversation: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      const conversation = conversations.find(
        c => c.id === conversationId && c.userId === userId
      );

      if (!conversation) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Conversation not found',
        });
      }

      res.json({
        conversation: {
          id: conversation.id,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          messages: conversation.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            emotion: msg.emotion,
          })),
        },
      });
    } catch (error) {
      logger.error('Get conversation error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get conversation',
      });
    }
  },

  // Get user's conversations
  getConversations: async (req, res) => {
    try {
      const userId = req.user.id;
      const userConversations = conversations.filter(c => c.userId === userId);

      res.json({
        conversations: userConversations.map(conv => ({
          id: conv.id,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.messages.length,
          lastMessage: conv.messages[conv.messages.length - 1]?.content.substring(0, 100) + '...',
        })),
      });
    } catch (error) {
      logger.error('Get conversations error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get conversations',
      });
    }
  },

  // Delete conversation
  deleteConversation: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      const conversationIndex = conversations.findIndex(
        c => c.id === conversationId && c.userId === userId
      );

      if (conversationIndex === -1) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Conversation not found',
        });
      }

      conversations.splice(conversationIndex, 1);

      logger.info(`Conversation deleted: ${conversationId}`);

      res.json({
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      logger.error('Delete conversation error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete conversation',
      });
    }
  },

  // Summarize conversation
  summarizeConversation: async (req, res) => {
    try {
      const { conversationId } = req.body;
      const userId = req.user.id;

      const conversation = conversations.find(
        c => c.id === conversationId && c.userId === userId
      );

      if (!conversation) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Conversation not found',
        });
      }

      // Prepare conversation for summarization
      const conversationText = conversation.messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional therapist creating a session summary. Summarize the key themes, emotions, insights, and progress discussed in this conversation. Keep it professional, empathetic, and focused on therapeutic value.',
          },
          {
            role: 'user',
            content: `Please summarize this therapy conversation:\n\n${conversationText}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const summary = completion.choices[0]?.message?.content;

      res.json({
        summary,
        conversationId,
        messageCount: conversation.messages.length,
        createdAt: conversation.createdAt,
      });
    } catch (error) {
      logger.error('Summarize conversation error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to summarize conversation',
      });
    }
  },

  // Get chat analytics
  getAnalytics: async (req, res) => {
    try {
      const userId = req.user.id;
      const userConversations = conversations.filter(c => c.userId === userId);

      // Calculate analytics
      const totalMessages = userConversations.reduce((sum, conv) => sum + conv.messages.length, 0);
      const totalConversations = userConversations.length;
      const averageMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0;

      // Emotion analysis
      const emotions = {};
      const moodTrends = [];
      
      userConversations.forEach(conv => {
        conv.messages.forEach(msg => {
          if (msg.role === 'user' && msg.emotion) {
            emotions[msg.emotion] = (emotions[msg.emotion] || 0) + 1;
            moodTrends.push({
              date: msg.timestamp.split('T')[0],
              emotion: msg.emotion,
            });
          }
        });
      });

      // Word count analysis
      const totalWords = userConversations.reduce((sum, conv) => {
        return sum + conv.messages
          .filter(msg => msg.role === 'user')
          .reduce((wordSum, msg) => wordSum + msg.content.split(' ').length, 0);
      }, 0);

      res.json({
        totalConversations,
        totalMessages,
        totalWords,
        averageMessagesPerConversation: Math.round(averageMessagesPerConversation * 10) / 10,
        emotionDistribution: emotions,
        moodTrends: moodTrends.slice(-30), // Last 30 entries
        activeTimeAnalysis: {
          mostActiveHour: getMostActiveHour(userConversations),
          conversationsThisWeek: getConversationsThisWeek(userConversations),
          conversationsThisMonth: getConversationsThisMonth(userConversations),
        },
      });
    } catch (error) {
      logger.error('Get analytics error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get analytics',
      });
    }
  },
};

// Helper function to analyze emotion using OpenAI
const analyzeEmotion = async (message) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return 'neutral';
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Analyze the emotion in this message and respond with only one word: happy, sad, anxious, angry, neutral, excited, frustrated, or hopeful.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    return completion.choices[0]?.message?.content?.toLowerCase().trim() || 'neutral';
  } catch (error) {
    logger.error('Emotion analysis error:', error);
    return 'neutral';
  }
};

// Helper functions for analytics
const getMostActiveHour = (conversations) => {
  const hourCounts = {};
  conversations.forEach(conv => {
    conv.messages.forEach(msg => {
      const hour = new Date(msg.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
  });
  
  const mostActiveHour = Object.keys(hourCounts).reduce((a, b) => 
    hourCounts[a] > hourCounts[b] ? a : b, '0'
  );
  
  return parseInt(mostActiveHour);
};

const getConversationsThisWeek = (conversations) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return conversations.filter(conv => 
    new Date(conv.createdAt) >= oneWeekAgo
  ).length;
};

const getConversationsThisMonth = (conversations) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  return conversations.filter(conv => 
    new Date(conv.createdAt) >= oneMonthAgo
  ).length;
};

export { aiChatController };
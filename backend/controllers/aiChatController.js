import OpenAI from 'openai';
import { logger } from '../config/logger.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock conversation storage (replace with actual database)
const conversations = [];

const aiChatController = {
  // Send message to AI therapist
  sendMessage: async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      const userId = req.user.id;

      logger.info('=== AI CHAT REQUEST START ===', {
        userId,
        message: message.substring(0, 100),
        conversationId,
        timestamp: new Date().toISOString(),
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0
      });

      // Validate input
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Message content is required',
        });
      }

      if (message.length > 2000) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Message too long. Please keep it under 2000 characters.',
        });
      }

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        logger.error('OpenAI API key is not configured!');
        return res.status(500).json({
          error: 'Configuration Error',
          message: 'AI service is not properly configured. Please check server configuration.',
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
      } else {
        logger.info('Found existing conversation:', { 
          conversationId: conversation.id, 
          messageCount: conversation.messages.length 
        });
      }

      // Add user message to conversation
      const userMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        emotion: await analyzeEmotion(message), // Add emotion analysis
      };
      conversation.messages.push(userMessage);

      logger.info('Added user message:', {
        messageId: userMessage.id,
        emotion: userMessage.emotion,
        content: userMessage.content.substring(0, 100)
      });

      // Prepare messages for OpenAI - Get last 6 messages for context
      const systemPrompt = {
        role: 'system',
        content: `You are MindCareAI, a compassionate and empathetic AI mental health assistant. 

CRITICAL INSTRUCTIONS:
- You MUST respond uniquely and specifically to each user message
- NEVER use generic responses or repeat the same phrases
- Always reference what the user just shared with you
- Provide personalized, contextual responses based on their specific situation
- Vary your language and approach for each response

Current user message: "${message}"

Your role:
1. Provide empathetic, personalized responses that directly address what the user shared
2. Use evidence-based therapeutic techniques (CBT, mindfulness, validation)
3. Ask thoughtful follow-up questions that are relevant to their specific situation
4. Offer practical coping strategies when appropriate
5. Encourage professional help for serious concerns
6. NEVER diagnose or prescribe medications

Response guidelines:
- Keep responses under 200 words
- Use warm, conversational tone
- Validate their specific feelings and experiences
- Reference their actual situation (job loss, relationships, etc.)
- Provide hope and encouragement tailored to their circumstances
- For crisis situations, immediately suggest emergency services

AVOID: Generic phrases, repetitive responses, clinical jargon, one-size-fits-all advice
FOCUS: Personalized support that shows you understand their unique situation

Remember: Each person's experience is unique. Respond to THEIR specific message, not a template.`
      };

      // Get conversation history (last 4 messages to maintain context but stay within limits)
      const recentMessages = conversation.messages.slice(-4);
      
      // Convert to OpenAI format
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Prepare full message array for OpenAI
      const messagesForAI = [systemPrompt, ...conversationHistory];

      // Use GPT-3.5-turbo for free tier compatibility
      const openaiPayload = {
        model: 'gpt-3.5-turbo', // Changed from gpt-4 to gpt-3.5-turbo for free tier
        messages: messagesForAI,
        max_tokens: 300, // Reduced for free tier limits
        temperature: 0.7, // Slightly reduced for more consistent responses
        presence_penalty: 0.3, // Reduced to avoid repetition
        frequency_penalty: 0.5, // Increased to avoid repetitive phrases
        user: userId,
      };

      logger.info('=== OPENAI API PAYLOAD ===', {
        model: openaiPayload.model,
        messageCount: messagesForAI.length,
        systemPromptLength: systemPrompt.content.length,
        conversationHistoryLength: conversationHistory.length,
        lastUserMessage: conversationHistory[conversationHistory.length - 1]?.content,
        temperature: openaiPayload.temperature,
        presence_penalty: openaiPayload.presence_penalty,
        frequency_penalty: openaiPayload.frequency_penalty
      });

      // Call OpenAI API with improved parameters
      logger.info('Calling OpenAI API...');
      const completion = await openai.chat.completions.create(openaiPayload);

      logger.info('=== OPENAI API RESPONSE ===', {
        choices: completion.choices?.length || 0,
        finishReason: completion.choices?.[0]?.finish_reason,
        usage: completion.usage,
        responseContent: completion.choices?.[0]?.message?.content?.substring(0, 200) + '...'
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (!aiResponse) {
        logger.error('No response content from OpenAI:', { completion });
        throw new Error('No response from OpenAI');
      }

      logger.info('=== AI RESPONSE EXTRACTED ===', {
        responseLength: aiResponse.length,
        responsePreview: aiResponse.substring(0, 200),
        isGeneric: aiResponse.includes('Tell me more about what\'s been on your mind lately')
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

      // Log successful response
      logger.info('=== FINAL RESPONSE BEING SENT ===', {
        conversationId: conversation.id,
        messageCount: conversation.messages.length,
        userEmotion: userMessage.emotion,
        aiResponseLength: aiResponse.length,
        responsePreview: aiResponse.substring(0, 100)
      });

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
      });
    } catch (error) {
      logger.error('=== AI CHAT ERROR ===', {
        error: error.message,
        stack: error.stack,
        openaiError: error.response?.data,
        statusCode: error.response?.status,
        isOpenAIError: error.message?.includes('OpenAI')
      });

      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'AI service quota exceeded. Please try again later.',
        });
      }

      if (error.code === 'rate_limit_exceeded') {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Please wait a moment before sending another message.',
        });
      }

      if (error.status === 401) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'AI service authentication failed. Please check configuration.',
        });
      }

      // Return a more specific error message
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process your message. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Test endpoint to verify backend is working
  test: async (req, res) => {
    logger.info('=== TEST ENDPOINT CALLED ===', {
      timestamp: new Date().toISOString(),
      user: req.user,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });

    res.json({
      message: 'Backend is working!',
      timestamp: new Date().toISOString(),
      user: req.user,
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      environment: process.env.NODE_ENV,
      model: 'gpt-3.5-turbo' // Updated to reflect actual model being used
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
        model: 'gpt-3.5-turbo', // Changed from gpt-4 to gpt-3.5-turbo
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
        max_tokens: 200, // Reduced for free tier
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
      model: 'gpt-3.5-turbo', // Changed from gpt-3.5-turbo to ensure consistency
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
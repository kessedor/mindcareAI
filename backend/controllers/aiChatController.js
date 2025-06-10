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
        timestamp: new Date().toISOString()
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

      // Prepare messages for OpenAI - Get last 10 messages for context
      const systemPrompt = {
        role: 'system',
        content: `You are MindCareAI, a compassionate and trauma-informed AI mental health assistant. Your role is to:

1. Provide empathetic, supportive responses that are contextually relevant to the conversation
2. Use evidence-based therapeutic techniques (CBT, mindfulness, validation) when appropriate
3. Encourage users to seek professional help for serious concerns
4. NEVER diagnose mental health conditions or prescribe medications
5. Maintain appropriate boundaries while being warm and understanding
6. Ask thoughtful, varied follow-up questions that build on previous responses
7. Provide practical coping strategies and self-care suggestions
8. AVOID repetitive responses - each response should be unique and contextually appropriate

Guidelines for responses:
- Keep responses concise but meaningful (under 300 words)
- Use a warm, professional tone that varies based on the user's emotional state
- Validate the user's feelings and experiences
- Offer hope and encouragement appropriately
- If someone mentions self-harm or suicide, immediately encourage them to contact emergency services
- Reference previous parts of the conversation when relevant
- Adapt your communication style to match the severity and nature of the user's concerns

CRITICAL: Avoid generic responses like "Tell me more about what's been on your mind lately" - instead, respond specifically to what the user has shared and build on the conversation naturally.

Remember: You are a supportive companion providing personalized guidance, not a replacement for professional therapy.`
      };

      // Get conversation history (last 8 messages to maintain context while managing tokens)
      const recentMessages = conversation.messages.slice(-8);
      
      // Convert to OpenAI format
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Prepare full message array for OpenAI
      const messagesForAI = [systemPrompt, ...conversationHistory];

      // Log the EXACT payload being sent to OpenAI
      const openaiPayload = {
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: messagesForAI,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
        temperature: 0.7,
        presence_penalty: 0.5,
        frequency_penalty: 0.5,
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
        frequency_penalty: openaiPayload.frequency_penalty,
        fullPayload: JSON.stringify(openaiPayload, null, 2)
      });

      // Call OpenAI API with improved parameters
      logger.info('Calling OpenAI API...');
      const completion = await openai.chat.completions.create(openaiPayload);

      logger.info('=== OPENAI API RESPONSE ===', {
        choices: completion.choices?.length || 0,
        finishReason: completion.choices?.[0]?.finish_reason,
        usage: completion.usage,
        fullResponse: JSON.stringify(completion, null, 2)
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (!aiResponse) {
        logger.error('No response content from OpenAI:', { completion });
        throw new Error('No response from OpenAI');
      }

      logger.info('=== AI RESPONSE EXTRACTED ===', {
        responseLength: aiResponse.length,
        responsePreview: aiResponse.substring(0, 200),
        fullResponse: aiResponse
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
        finalResponse: {
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
        }
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
        statusCode: error.response?.status
      });

      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'AI service is temporarily unavailable. Please try again later.',
        });
      }

      if (error.code === 'rate_limit_exceeded') {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Please wait a moment before sending another message.',
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process your message. Please try again.',
      });
    }
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
        model: 'gpt-4',
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
        max_tokens: 300,
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
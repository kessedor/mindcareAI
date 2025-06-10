import api from '../utils/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotion?: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  message: string;
  conversationId: string;
  userMessage: {
    id: string;
    content: string;
    timestamp: string;
    emotion?: string;
  };
  aiMessage: {
    id: string;
    content: string;
    timestamp: string;
  };
}

export interface ConversationSummary {
  summary: string;
  conversationId: string;
  messageCount: number;
  createdAt: string;
}

export interface ChatAnalytics {
  totalConversations: number;
  totalMessages: number;
  totalWords: number;
  averageMessagesPerConversation: number;
  emotionDistribution: Record<string, number>;
  moodTrends: Array<{ date: string; emotion: string }>;
  activeTimeAnalysis: {
    mostActiveHour: number;
    conversationsThisWeek: number;
    conversationsThisMonth: number;
  };
}

export const chatAPI = {
  // Send message to AI assistant
  sendMessage: (message: string, conversationId?: string): Promise<{ data: SendMessageResponse }> =>
    api.post('/ai-chat/message', { message, conversationId }),

  // Get conversation history
  getConversation: (conversationId: string): Promise<{ data: { conversation: Conversation } }> =>
    api.get(`/ai-chat/conversations/${conversationId}`),

  // Get all user conversations
  getConversations: (): Promise<{ data: { conversations: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    lastMessage: string;
  }> } }> =>
    api.get('/ai-chat/conversations'),

  // Delete conversation
  deleteConversation: (conversationId: string): Promise<{ data: { message: string } }> =>
    api.delete(`/ai-chat/conversations/${conversationId}`),

  // Summarize conversation
  summarizeConversation: (conversationId: string): Promise<{ data: ConversationSummary }> =>
    api.post('/ai-chat/summarize', { conversationId }),

  // Get chat analytics
  getAnalytics: (): Promise<{ data: ChatAnalytics }> =>
    api.get('/ai-chat/analytics'),
};
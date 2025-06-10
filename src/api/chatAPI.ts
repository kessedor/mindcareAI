import api from '../utils/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
  };
  aiMessage: {
    id: string;
    content: string;
    timestamp: string;
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
};
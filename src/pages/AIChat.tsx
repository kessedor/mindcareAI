import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageCircle, Trash2, Plus, FileText, Calendar, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import api from '../utils/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotion?: string;
}

interface SendMessageResponse {
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

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI mental health companion. I'm here to listen, provide support, and help you work through any challenges you're facing. How are you feeling today?",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      // Call the correct AI chat endpoint
      const response = await api.post('/ai-chat/message', {
        message: inputValue.trim(),
        conversationId: conversationId || undefined
      });

      const { conversationId: newConversationId, userMessage: confirmedUserMessage, aiMessage } = response.data;

      // Update conversation ID if this is the first message
      if (!conversationId) {
        setConversationId(newConversationId);
      }

      // Replace temporary user message with confirmed one and add AI response
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => msg.id !== userMessage.id);
        return [
          ...withoutTemp,
          {
            id: confirmedUserMessage.id,
            role: 'user' as const,
            content: confirmedUserMessage.content,
            timestamp: confirmedUserMessage.timestamp,
            emotion: confirmedUserMessage.emotion,
          },
          {
            id: aiMessage.id,
            role: 'assistant' as const,
            content: aiMessage.content,
            timestamp: aiMessage.timestamp,
          },
        ];
      });
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Remove the temporary user message
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      // Show specific error messages
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.response?.status === 503) {
        errorMessage = 'AI service is temporarily unavailable. This might be due to API quota limits.';
      } else if (error.response?.status === 401) {
        errorMessage = 'AI service authentication failed. Please check the API configuration.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before sending another message.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewConversation = () => {
    setMessages([{
      id: 'welcome_new',
      role: 'assistant',
      content: "Hello! I'm here to support you. What would you like to talk about today?",
      timestamp: new Date().toISOString(),
    }]);
    setConversationId(null);
    setError(null);
    setSummary(null);
  };

  const clearConversation = async () => {
    if (conversationId) {
      try {
        await api.delete(`/ai-chat/conversations/${conversationId}`);
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
    startNewConversation();
  };

  const handleSummarize = async () => {
    if (!conversationId) return;

    setIsSummarizing(true);
    try {
      const response = await api.post('/ai-chat/summarize', { conversationId });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to summarize conversation:', error);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'anxious': return '😰';
      case 'angry': return '😠';
      case 'excited': return '🤗';
      case 'frustrated': return '😤';
      case 'hopeful': return '🌟';
      default: return '😐';
    }
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return 'text-green-500';
      case 'sad': return 'text-blue-500';
      case 'anxious': return 'text-yellow-500';
      case 'angry': return 'text-red-500';
      case 'excited': return 'text-purple-500';
      case 'frustrated': return 'text-orange-500';
      case 'hopeful': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-neutral-900">AI Therapy Assistant</h1>
              <p className="text-neutral-600">Safe, confidential, and always available</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <Link to="/schedule-therapy">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          </Link>
          <Link to="/chat-analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          {conversationId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummarize}
              disabled={isSummarizing}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isSummarizing ? 'Summarizing...' : 'Summarize'}
            </Button>
          )}
        </div>

        {/* Summary Display */}
        {summary && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Session Summary</h3>
            <p className="text-blue-800 text-sm leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="border-b border-neutral-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-neutral-900">
                {conversationId ? 'Active Session' : 'New Session'}
              </span>
              <span className="text-xs text-neutral-500 bg-green-100 px-2 py-1 rounded-full">
                GPT-3.5 Turbo
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewConversation}
                className="text-neutral-600 hover:text-primary-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
              {conversationId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  className="text-neutral-600 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot className="h-4 w-4 mt-1 text-primary-600 flex-shrink-0" />
                    )}
                    {message.role === 'user' && (
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 mt-1 text-white flex-shrink-0" />
                        {message.emotion && (
                          <span 
                            className="text-xs"
                            title={`Detected emotion: ${message.emotion}`}
                          >
                            {getEmotionIcon(message.emotion)}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.role === 'user' ? 'text-white/70' : 'text-neutral-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        {message.role === 'user' && message.emotion && (
                          <span className={`text-xs capitalize ${
                            message.role === 'user' ? 'text-white/70' : getEmotionColor(message.emotion)
                          }`}>
                            {message.emotion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-neutral-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 pb-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  Note: This app uses GPT-3.5 Turbo which is compatible with free OpenAI accounts.
                </p>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's on your mind..."
                  className="w-full p-3 border border-neutral-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  maxLength={2000}
                  disabled={isTyping}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="h-12 w-12 p-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span>Powered by OpenAI GPT-3.5 Turbo</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{inputValue.length}/2000</span>
                <span>Press Enter to send</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500 max-w-2xl mx-auto">
            This AI assistant provides supportive guidance but is not a replacement for professional mental health care. 
            If you're experiencing a crisis, please contact emergency services or a mental health professional immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
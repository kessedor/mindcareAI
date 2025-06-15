import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageCircle, Trash2, Plus, FileText, Calendar, BarChart3, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import LanguageSelector from '../components/LanguageSelector';
import { useUITranslations } from '../hooks/useUITranslations';
import { SupportedLanguage } from '../lib/uiTranslations';

// Use Netlify function for AI chat (recommended for production)
import { netlifyAiService as aiChatService } from '../services/netlifyAiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotion?: string;
  language?: SupportedLanguage;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load UI translations for the selected language
  const { translate, isLoading: translationsLoading } = useUITranslations(selectedLanguage, [
    'ai_assistant',
    'chat_title',
    'chat_subtitle',
    'chat_input_placeholder',
    'chat_input_placeholder_multilingual',
    'ai_thinking',
    'new_conversation',
    'connected_status',
    'connecting_status',
    'connection_failed',
    'book_session',
    'analytics',
    'emergency_disclaimer',
    'language'
  ]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        setDebugInfo('Testing connection to /.netlify/functions/ai-chat...');
        
        // Test with a simple message
        const response = await aiChatService.sendMessage({
          message: "Hello",
          history: []
        });
        
        console.log('Connection test successful:', response);
        setConnectionStatus('connected');
        setDebugInfo('✅ Connection successful!');
        
      } catch (error: any) {
        console.error('Connection test failed:', error);
        setConnectionStatus('error');
        setDebugInfo(`❌ Connection failed: ${error.message}`);
        setError(`Failed to connect to AI service: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI mental health companion. I'm here to listen, provide support, and help you work through any challenges you're facing. How are you feeling today?",
      timestamp: new Date().toISOString(),
      language: selectedLanguage,
    };
    setMessages([welcomeMessage]);
  }, [selectedLanguage]);

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setSelectedLanguage(newLanguage);
    // Note: We don't translate existing messages - GPT handles multilingual conversations natively
    // The UI will update to the new language, but chat history remains as-is
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || connectionStatus !== 'connected') return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      language: selectedLanguage,
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      // Prepare history for AI service - GPT handles multilingual conversations natively
      const conversationHistory = messages
        .filter(msg => msg.id !== 'welcome' && msg.id !== 'welcome_new')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      console.log('Sending to AI:', {
        message: userMessage.content,
        historyLength: conversationHistory.length,
        history: conversationHistory
      });

      // Call AI service - GPT will respond in the same language as the user input
      const response = await aiChatService.sendMessage({
        message: userMessage.content,
        history: conversationHistory
      });

      console.log('AI Response:', response);

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        language: selectedLanguage,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Set conversation ID if this is the first exchange
      if (!conversationId) {
        setConversationId(`conv_${Date.now()}`);
      }

    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError(error.message || 'Failed to send message. Please try again.');
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
    const welcomeMessage: ChatMessage = {
      id: 'welcome_new',
      role: 'assistant',
      content: "Hello! I'm here to support you. What would you like to talk about today?",
      timestamp: new Date().toISOString(),
      language: selectedLanguage,
    };

    setMessages([welcomeMessage]);
    setConversationId(null);
    setError(null);
  };

  // Test function for debugging
  const testNetlifyFunction = async () => {
    try {
      setDebugInfo('Testing Netlify function directly...');
      
      const response = await fetch("/.netlify/functions/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: "Test message",
          history: []
        })
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!response.ok) {
        setDebugInfo(`❌ HTTP ${response.status}: ${responseText}`);
        return;
      }

      const data = JSON.parse(responseText);
      setDebugInfo(`✅ Function works! Response: ${data.reply?.substring(0, 50)}...`);
      
    } catch (error: any) {
      setDebugInfo(`❌ Function test failed: ${error.message}`);
      console.error('Function test error:', error);
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
              <h1 className="text-2xl font-display font-bold text-neutral-900">
                {translate('chat_title')}
              </h1>
              <p className="text-neutral-600">{translate('chat_subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus === 'checking' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800 font-medium">{translate('connecting_status')}</p>
            <p className="text-yellow-700 text-sm mt-1">{debugInfo}</p>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium">{translate('connection_failed')}</p>
            <p className="text-red-700 text-sm mt-1">{debugInfo}</p>
            <div className="mt-3 space-y-2">
              <p className="text-red-600 text-sm">Troubleshooting steps:</p>
              <ul className="text-red-600 text-sm list-disc list-inside space-y-1">
                <li>Make sure you've set the OPENAI_API_KEY environment variable</li>
                <li>Check that the Netlify function is deployed</li>
                <li>Verify your OpenAI API key is valid and has credits</li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testNetlifyFunction}
                className="mt-2"
              >
                Test Function
              </Button>
            </div>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 font-medium">✅ {translate('connected_status')}</p>
            <p className="text-green-700 text-sm mt-1">{debugInfo}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <Link to="/schedule-therapy">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              {translate('book_session')}
            </Button>
          </Link>
          <Link to="/chat-analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              {translate('analytics')}
            </Button>
          </Link>
        </div>

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
              {selectedLanguage !== 'en' && (
                <span className="text-xs text-neutral-500 bg-blue-100 px-2 py-1 rounded-full flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  {selectedLanguage.toUpperCase()}
                </span>
              )}
              {/* Debug info */}
              <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
                {messages.filter(m => m.id !== 'welcome' && m.id !== 'welcome_new').length} messages
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
                {translate('new_conversation')}
              </Button>
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
                      <User className="h-4 w-4 mt-1 text-white flex-shrink-0" />
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
                        {message.language && message.language !== 'en' && (
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            message.role === 'user' 
                              ? 'bg-white/20 text-white/80' 
                              : 'bg-neutral-200 text-neutral-600'
                          }`}>
                            {message.language.toUpperCase()}
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
                    <span className="text-sm text-neutral-600">{translate('ai_thinking')}</span>
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
                  placeholder={selectedLanguage === 'en' 
                    ? translate('chat_input_placeholder')
                    : translate('chat_input_placeholder_multilingual')
                  }
                  className="w-full p-3 border border-neutral-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  maxLength={2000}
                  disabled={isTyping || connectionStatus !== 'connected'}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || connectionStatus !== 'connected'}
                className="h-12 w-12 p-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span>Powered by OpenAI GPT-3.5 Turbo</span>
                {selectedLanguage !== 'en' && (
                  <>
                    <span>•</span>
                    <Globe className="h-3 w-3" />
                    <span>UI translated via Lingo.dev</span>
                  </>
                )}
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
            {translate('emergency_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
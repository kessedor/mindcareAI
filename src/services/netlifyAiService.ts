export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  raw?: any;
}

export const netlifyAiService = {
  async sendMessage({ message, history = [] }: ChatRequest): Promise<ChatResponse> {
    try {
      console.log('🚀 Calling Netlify function with:', { 
        message: message.substring(0, 50) + '...', 
        historyLength: history.length 
      });

      const response = await fetch("/.netlify/functions/ai-chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          message, 
          history 
        })
      });

      console.log('📡 Response status:', response.status, response.statusText);

      // Get response text first for better error handling
      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || `HTTP ${response.status}` };
        }
        
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('Invalid response format from AI service');
      }

      console.log('✅ Parsed response:', { 
        reply: data.reply?.substring(0, 100) + '...',
        hasRaw: !!data.raw 
      });
      
      return {
        reply: data.reply,
        raw: data.raw
      };

    } catch (error: any) {
      console.error('💥 Netlify Function Error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to connect to AI service. Please try again.';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('quota exceeded') || error.message.includes('402')) {
        errorMessage = 'AI service is temporarily unavailable due to quota limits.';
      } else if (error.message.includes('Rate limit') || error.message.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.message.includes('401') || error.message.includes('invalid_api_key')) {
        errorMessage = 'AI service authentication failed. Please check API key configuration.';
      } else if (error.message.includes('404')) {
        errorMessage = 'AI service endpoint not found. The Netlify function may not be deployed.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }
};
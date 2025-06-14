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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        reply: data.reply,
        raw: data.raw
      };

    } catch (error: any) {
      console.error('Netlify Function Error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to connect to AI service. Please try again.';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('quota exceeded')) {
        errorMessage = 'AI service is temporarily unavailable due to quota limits.';
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }
};
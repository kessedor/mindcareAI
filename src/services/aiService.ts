import OpenAI from 'openai';

// WARNING: This exposes your API key in the frontend
// Only use for development/testing
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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

export const aiChatService = {
  async sendMessage({ message, history = [] }: ChatRequest): Promise<ChatResponse> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are MindCareAI, a compassionate and trauma-informed AI mental health assistant. Speak kindly and supportively. Be empathetic and never repeat the same phrase like "tell me more about what\'s been on your mind lately." Always respond in a context-aware way. Your role is to guide users through difficult emotions, gently validate their feelings, and avoid sounding robotic.'
        },
        ...history,
        {
          role: 'user',
          content: message
        }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.5,
        frequency_penalty: 0.5,
      });

      const reply = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

      return {
        reply,
        raw: completion
      };

    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      
      let errorMessage = 'An error occurred while processing your request.';

      if (error.code === 'insufficient_quota') {
        errorMessage = 'OpenAI API quota exceeded. Please try again later.';
      } else if (error.code === 'invalid_api_key') {
        errorMessage = 'OpenAI API key is invalid or missing.';
      }

      throw new Error(errorMessage);
    }
  }
};
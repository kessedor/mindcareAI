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

const mockResponses = [
  "Thank you for sharing that with me. It sounds like you're going through a challenging time. How are you feeling about this situation right now?",
  "I hear you, and I want you to know that your feelings are completely valid. What do you think might help you feel a bit better today?",
  "That sounds really difficult. You're being very brave by talking about this. What kind of support feels most helpful to you right now?",
  "I can sense that this is weighing heavily on you. Sometimes it helps to take things one step at a time. What feels like the most manageable next step?",
  "Your awareness of these feelings shows real emotional intelligence. Have you noticed any patterns in when these feelings tend to be stronger or lighter?",
  "It takes courage to reach out when you're struggling. What are some things that have helped you cope with difficult emotions in the past?",
  "I'm glad you felt comfortable sharing this with me. How would you describe your support system right now?",
  "That's a lot to carry. Remember that healing isn't linear, and it's okay to have ups and downs. What brings you even small moments of peace?"
];

export const mockAiService = {
  async sendMessage({ message, history = [] }: ChatRequest): Promise<ChatResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Select a response based on message content or randomly
    let reply = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    // Add some context-aware responses
    if (message.toLowerCase().includes('anxious') || message.toLowerCase().includes('anxiety')) {
      reply = "I understand that anxiety can feel overwhelming. It's your mind's way of trying to protect you, even when it doesn't feel helpful. What does anxiety feel like in your body right now?";
    } else if (message.toLowerCase().includes('sad') || message.toLowerCase().includes('depression')) {
      reply = "Sadness is such a heavy feeling, and I want you to know that it's okay to feel this way. You don't have to carry this alone. What would comfort look like for you today?";
    } else if (message.toLowerCase().includes('work') || message.toLowerCase().includes('job')) {
      reply = "Work stress can really impact our overall well-being. It sounds like this is affecting you quite a bit. How are you taking care of yourself outside of work?";
    }

    return {
      reply,
      raw: {
        choices: [{ message: { content: reply } }],
        usage: { total_tokens: 150 },
        model: 'mock-gpt-3.5-turbo'
      }
    };
  }
};
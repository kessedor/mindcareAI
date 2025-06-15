// UI Translation utility for MindCareAI
// Uses Lingo.dev API for translating interface elements only

export type SupportedLanguage = 'en' | 'fr' | 'de' | 'es' | 'sw' | 'yo' | 'ig' | 'ha' | 'ar';

const defaultLanguage: SupportedLanguage = 'en';

// Define all UI text keys that need translation
export const UI_TEXT_KEYS = {
  // Navigation
  home: 'Home',
  dashboard: 'Dashboard',
  ai_assistant: 'AI Assistant',
  ai_chat: 'AI Chat',
  journal: 'Journal',
  mood_tracker: 'Mood Tracker',
  admin: 'Admin',
  
  // Authentication
  sign_in: 'Sign In',
  get_started: 'Get Started',
  
  // Actions
  book_session: 'Book Session',
  analytics: 'Analytics',
  new_entry: 'New Entry',
  new_check_in: 'New Check-In',
  
  // Language
  language: 'Language',
  
  // Status messages
  connected_status: 'Connected to OpenAI GPT-3.5 Turbo',
  connecting_status: 'Connecting to AI service...',
  connection_failed: 'Failed to connect to AI service',
  
  // Chat interface
  chat_title: 'AI Therapy Assistant',
  chat_subtitle: 'Safe, confidential, and always available',
  chat_input_placeholder: 'Share what\'s on your mind...',
  chat_input_placeholder_multilingual: 'Share what\'s on your mind... (type in your selected language)',
  ai_thinking: 'AI is thinking...',
  send_message: 'Send',
  new_conversation: 'New',
  
  // Translation notices
  translation_notice: 'Translation powered by Lingo.dev. Translations may not be perfect.',
  translating_messages: 'Translating messages...',
  
  // Emergency disclaimer
  emergency_disclaimer: 'This AI assistant provides supportive guidance but is not a replacement for professional mental health care. If you\'re experiencing a crisis, please contact emergency services or a mental health professional immediately.',
  
  // Common UI elements
  loading: 'Loading...',
  error: 'Error',
  retry: 'Retry',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  back: 'Back',
  next: 'Next',
  submit: 'Submit',
  
  // Mood tracker
  mood_check_in: 'Mood Check-In',
  how_feeling: 'How are you feeling right now?',
  select_mood: 'Select the mood that best describes your current emotional state',
  
  // Journal
  personal_journal: 'Personal Journal',
  express_thoughts: 'Express your thoughts and track your emotional journey',
  new_journal_entry: 'New Journal Entry',
  
  // Dashboard
  welcome_back: 'Welcome back',
  mental_wellness_overview: 'Here\'s your mental wellness overview for today',
  quick_actions: 'Quick Actions',
  
  // Language names
  english: 'English',
  french: 'Français',
  spanish: 'Español',
  german: 'Deutsch',
  arabic: 'العربية',
  swahili: 'Kiswahili',
  yoruba: 'Yorùbá',
  hausa: 'Hausa',
  igbo: 'Igbo',
} as const;

export type UITextKey = keyof typeof UI_TEXT_KEYS;

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, Record<string, string>>();

export class UITranslationService {
  private readonly apiKey = 'api_afm2rmz9pik2t8hojenooyda';
  private readonly baseUrl = 'https://api.lingo.dev/v1/translate';

  async translateUIText(key: UITextKey, targetLanguage: SupportedLanguage): Promise<string> {
    // Return original text if target is English
    if (targetLanguage === 'en') {
      return UI_TEXT_KEYS[key];
    }

    // Check cache first
    const cacheKey = `${key}_${targetLanguage}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return cached[key] || UI_TEXT_KEYS[key];
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          source_language: 'en',
          target_language: targetLanguage,
          text: UI_TEXT_KEYS[key]
        })
      });

      if (!response.ok) {
        console.warn(`UI translation failed for ${key}: ${response.status}`);
        return UI_TEXT_KEYS[key]; // Fallback to English
      }

      const data = await response.json();
      const translatedText = data.translated_text || UI_TEXT_KEYS[key];
      
      // Cache the result
      translationCache.set(cacheKey, { [key]: translatedText });
      
      return translatedText;
    } catch (error) {
      console.error(`UI translation error for ${key}:`, error);
      return UI_TEXT_KEYS[key]; // Fallback to English
    }
  }

  async translateMultipleUITexts(keys: UITextKey[], targetLanguage: SupportedLanguage): Promise<Record<string, string>> {
    if (targetLanguage === 'en') {
      return Object.fromEntries(keys.map(key => [key, UI_TEXT_KEYS[key]]));
    }

    const translations: Record<string, string> = {};
    
    // Process translations in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const batchPromises = batch.map(key => 
        this.translateUIText(key, targetLanguage).then(translation => ({ key, translation }))
      );
      
      try {
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(({ key, translation }) => {
          translations[key] = translation;
        });
      } catch (error) {
        console.error('Batch translation error:', error);
        // Fallback to English for failed batch
        batch.forEach(key => {
          translations[key] = UI_TEXT_KEYS[key];
        });
      }
    }

    return translations;
  }

  // Clear cache when needed
  clearCache(): void {
    translationCache.clear();
  }

  // Get cached translation if available
  getCachedTranslation(key: UITextKey, language: SupportedLanguage): string | null {
    if (language === 'en') return UI_TEXT_KEYS[key];
    
    const cacheKey = `${key}_${language}`;
    const cached = translationCache.get(cacheKey);
    return cached?.[key] || null;
  }
}

// Export singleton instance
export const uiTranslationService = new UITranslationService();

// Helper hook for React components
export function useUITranslation(language: SupportedLanguage) {
  const translate = (key: UITextKey): string => {
    const cached = uiTranslationService.getCachedTranslation(key, language);
    if (cached) return cached;
    
    // Return English as immediate fallback, trigger async translation
    if (language !== 'en') {
      uiTranslationService.translateUIText(key, language).catch(console.error);
    }
    
    return UI_TEXT_KEYS[key];
  };

  return { translate };
}
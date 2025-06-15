export interface TranslationRequest {
  source_language: string;
  target_language: string;
  text: string;
}

export interface TranslationResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
}

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  fr: 'Français',
  es: 'Español', 
  de: 'Deutsch',
  ar: 'العربية',
  sw: 'Kiswahili',
  yo: 'Yorùbá',
  ha: 'Hausa',
  ig: 'Igbo'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

class TranslationService {
  private readonly apiKey = 'api_afm2rmz9pik2t8hojenooyda';
  private readonly baseUrl = 'https://api.lingo.dev/v1/translate';

  async translate(
    text: string, 
    targetLanguage: SupportedLanguage, 
    sourceLanguage: SupportedLanguage = 'en'
  ): Promise<string> {
    // Skip translation if target is same as source
    if (targetLanguage === sourceLanguage) {
      return text;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          source_language: sourceLanguage,
          target_language: targetLanguage,
          text: text
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
      }

      const data: TranslationResponse = await response.json();
      return data.translated_text || text;
    } catch (error) {
      console.error('Translation failed:', error);
      // Return original text if translation fails
      return text;
    }
  }

  async translateToEnglish(text: string, sourceLanguage: SupportedLanguage): Promise<string> {
    return this.translate(text, 'en', sourceLanguage);
  }

  async translateFromEnglish(text: string, targetLanguage: SupportedLanguage): Promise<string> {
    return this.translate(text, targetLanguage, 'en');
  }
}

export const translationService = new TranslationService();
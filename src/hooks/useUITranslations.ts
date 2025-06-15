import { useState, useEffect } from 'react';
import { SupportedLanguage, UITextKey, uiTranslationService, UI_TEXT_KEYS } from '../lib/uiTranslations';

interface UseUITranslationsReturn {
  translations: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  translate: (key: UITextKey) => string;
}

export function useUITranslations(language: SupportedLanguage, keys?: UITextKey[]): UseUITranslationsReturn {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to all keys if none specified
  const translationKeys = keys || Object.keys(UI_TEXT_KEYS) as UITextKey[];

  useEffect(() => {
    const loadTranslations = async () => {
      if (language === 'en') {
        // For English, just use the default values
        const englishTranslations = Object.fromEntries(
          translationKeys.map(key => [key, UI_TEXT_KEYS[key]])
        );
        setTranslations(englishTranslations);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const translatedTexts = await uiTranslationService.translateMultipleUITexts(
          translationKeys,
          language
        );
        setTranslations(translatedTexts);
      } catch (err) {
        console.error('Failed to load UI translations:', err);
        setError('Failed to load translations');
        
        // Fallback to English
        const fallbackTranslations = Object.fromEntries(
          translationKeys.map(key => [key, UI_TEXT_KEYS[key]])
        );
        setTranslations(fallbackTranslations);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language, translationKeys.join(',')]);

  const translate = (key: UITextKey): string => {
    return translations[key] || UI_TEXT_KEYS[key];
  };

  return {
    translations,
    isLoading,
    error,
    translate
  };
}
import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { SupportedLanguage } from '../lib/uiTranslations';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  ar: 'العربية',
  sw: 'Kiswahili',
  yo: 'Yorùbá',
  ha: 'Hausa',
  ig: 'Igbo'
};

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  className?: string;
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  className = '',
  showLabel = true
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-neutral-600">
        <Globe className="h-4 w-4" />
        {showLabel && <span>Language:</span>}
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="appearance-none bg-white border border-neutral-300 rounded-lg px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-neutral-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
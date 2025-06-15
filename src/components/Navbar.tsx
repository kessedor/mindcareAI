import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Menu, X, Home, MessageCircle, BookOpen, Heart, BarChart3, Bot, Shield } from 'lucide-react';
import Button from './Button';
import LanguageSelector from './LanguageSelector';
import { useUITranslations } from '../hooks/useUITranslations';
import { SupportedLanguage } from '../lib/uiTranslations';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const location = useLocation();

  // Load UI translations for navigation
  const { translate } = useUITranslations(selectedLanguage, [
    'home',
    'dashboard',
    'ai_assistant',
    'ai_chat',
    'journal',
    'mood_tracker',
    'admin',
    'sign_in',
    'get_started'
  ]);

  const navigation = [
    { name: translate('home'), href: '/', icon: Home },
    { name: translate('dashboard'), href: '/dashboard', icon: BarChart3 },
    { name: translate('ai_assistant'), href: '/ai-chat', icon: Bot },
    { name: translate('ai_chat'), href: '/chat', icon: MessageCircle },
    { name: translate('journal'), href: '/journal', icon: BookOpen },
    { name: translate('mood_tracker'), href: '/mood', icon: Heart },
    { name: translate('admin'), href: '/admin', icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-neutral-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl group-hover:shadow-lg transition-all duration-300">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              MindCareAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              showLabel={false}
              className="mr-2"
            />
            <Button variant="ghost" size="sm">
              {translate('sign_in')}
            </Button>
            <Button variant="primary" size="sm">
              {translate('get_started')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200/50">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200/50 space-y-2">
              <div className="px-4 mb-3">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-center">
                {translate('sign_in')}
              </Button>
              <Button variant="primary" size="sm" className="w-full justify-center">
                {translate('get_started')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
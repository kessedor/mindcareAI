import React from 'react';
import { Smile, Meh, Frown, Heart, Zap } from 'lucide-react';

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MoodSelectorProps {
  selectedMood: string;
  onSelect: (moodId: string) => void;
  className?: string;
}

const moodOptions: MoodOption[] = [
  {
    id: 'excellent',
    emoji: '😄',
    label: 'Excellent',
    color: 'from-green-400 to-green-500',
    icon: Zap,
  },
  {
    id: 'good',
    emoji: '😊',
    label: 'Good',
    color: 'from-blue-400 to-blue-500',
    icon: Smile,
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    color: 'from-yellow-400 to-yellow-500',
    icon: Meh,
  },
  {
    id: 'anxious',
    emoji: '😰',
    label: 'Anxious',
    color: 'from-orange-400 to-orange-500',
    icon: Heart,
  },
  {
    id: 'sad',
    emoji: '😢',
    label: 'Sad',
    color: 'from-red-400 to-red-500',
    icon: Frown,
  },
];

const MoodSelector: React.FC<MoodSelectorProps> = ({ 
  selectedMood, 
  onSelect, 
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {moodOptions.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          
          return (
            <button
              key={mood.id}
              onClick={() => onSelect(mood.id)}
              className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
              }`}
              aria-label={`Select ${mood.label} mood`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${mood.color} ${
                  isSelected ? 'scale-110' : 'group-hover:scale-105'
                } transition-transform duration-200`}>
                  <span className="text-2xl">{mood.emoji}</span>
                </div>
                <span className={`text-sm font-medium ${
                  isSelected ? 'text-primary-700' : 'text-neutral-600'
                }`}>
                  {mood.label}
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <Icon className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
export { moodOptions };
export type { MoodOption };
import React, { useState } from 'react';
import { Heart, TrendingUp, Calendar, BarChart3, Smile, Meh, Frown } from 'lucide-react';
import Button from '../components/Button';

interface MoodEntry {
  date: string;
  mood: number;
  notes: string;
  factors: string[];
}

const MoodTracker: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  const moodData: MoodEntry[] = [
    { date: '2024-01-15', mood: 8, notes: 'Great day!', factors: ['exercise', 'good-sleep'] },
    { date: '2024-01-14', mood: 6, notes: 'Feeling okay', factors: ['work-stress'] },
    { date: '2024-01-13', mood: 7, notes: 'Better than yesterday', factors: ['social-time'] },
    { date: '2024-01-12', mood: 5, notes: 'Neutral day', factors: [] },
    { date: '2024-01-11', mood: 9, notes: 'Amazing mood!', factors: ['exercise', 'good-sleep', 'social-time'] },
  ];

  const factors = [
    { id: 'exercise', label: 'Exercise', color: 'bg-green-500' },
    { id: 'good-sleep', label: 'Good Sleep', color: 'bg-blue-500' },
    { id: 'social-time', label: 'Social Time', color: 'bg-purple-500' },
    { id: 'work-stress', label: 'Work Stress', color: 'bg-red-500' },
    { id: 'healthy-eating', label: 'Healthy Eating', color: 'bg-yellow-500' },
    { id: 'meditation', label: 'Meditation', color: 'bg-indigo-500' },
  ];

  const getMoodIcon = (mood: number) => {
    if (mood >= 7) return <Smile className="h-5 w-5 text-green-500" />;
    if (mood >= 4) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'bg-green-500';
    if (mood >= 6) return 'bg-blue-500';
    if (mood >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev =>
      prev.includes(factorId)
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  const averageMood = moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Mood Tracker
          </h1>
          <p className="text-neutral-600">Track your daily emotions and identify patterns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Mood Entry */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">How are you feeling today?</h2>
              
              {/* Mood Scale */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-neutral-600">Very Bad</span>
                  <span className="text-sm text-neutral-600">Excellent</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentMood}
                    onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between mt-2 text-xs text-neutral-400">
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <span key={num}>{num}</span>
                    ))}
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="inline-flex items-center space-x-2">
                    {getMoodIcon(currentMood)}
                    <span className="text-2xl font-bold text-neutral-900">{currentMood}/10</span>
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-3">What's affecting your mood?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {factors.map((factor) => (
                    <button
                      key={factor.id}
                      onClick={() => toggleFactor(factor.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedFactors.includes(factor.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${factor.color}`}></div>
                        <span className="text-sm font-medium">{factor.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Additional notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything specific you'd like to remember about today?"
                  rows={3}
                  className="w-full p-3 border border-neutral-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <Button className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Save Today's Mood
              </Button>
            </div>

            {/* Mood History */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Recent Entries</h3>
              <div className="space-y-4">
                {moodData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm text-neutral-600">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getMoodIcon(entry.mood)}
                        <span className="font-medium">{entry.mood}/10</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.factors.map((factorId, factorIndex) => {
                        const factor = factors.find(f => f.id === factorId);
                        return factor ? (
                          <div
                            key={factorIndex}
                            className={`w-3 h-3 rounded-full ${factor.color}`}
                            title={factor.label}
                          ></div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Average Mood</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-neutral-900">
                        {averageMood.toFixed(1)}/10
                      </span>
                      {getMoodIcon(averageMood)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Entries This Week</span>
                    <span className="font-semibold text-neutral-900">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Best Day</span>
                    <span className="font-semibold text-green-600">9/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Streak</span>
                    <span className="font-semibold text-neutral-900">7 days</span>
                  </div>
                </div>
              </div>

              {/* Mood Chart Preview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Trend</h3>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="space-y-2">
                  {moodData.slice(-7).map((entry, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-xs text-neutral-500 w-16">
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getMoodColor(entry.mood)}`}
                          style={{ width: `${(entry.mood / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium w-8">{entry.mood}</span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Charts
                </Button>
              </div>

              {/* Tips */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Daily Tip</h3>
                <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Try to track your mood at the same time each day to build consistency and get more accurate insights into your emotional patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
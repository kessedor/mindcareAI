import React, { useState } from 'react';
import { Calendar, BookOpen, Save, Search, Filter, Plus } from 'lucide-react';
import Button from '../components/Button';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  date: Date;
  tags: string[];
}

const Journal: React.FC = () => {
  const [entries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'A Better Day',
      content: 'Today was significantly better than yesterday. I managed to go for a walk in the morning, which really helped clear my mind. The fresh air and movement made me feel more energized throughout the day.',
      mood: 'Good',
      date: new Date('2024-01-15'),
      tags: ['exercise', 'mood-boost', 'outdoors'],
    },
    {
      id: '2',
      title: 'Reflecting on Growth',
      content: 'Looking back at the past month, I can see how much progress I\'ve made. The anxiety attacks are less frequent, and I\'m starting to feel more confident in social situations.',
      mood: 'Optimistic',
      date: new Date('2024-01-10'),
      tags: ['growth', 'anxiety', 'progress'],
    },
  ]);

  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
  });

  const [showNewEntry, setShowNewEntry] = useState(false);

  const handleSaveEntry = () => {
    // Implementation for saving entry
    console.log('Saving entry:', newEntry);
    setShowNewEntry(false);
    setNewEntry({ title: '', content: '', mood: '' });
  };

  const moodColors = {
    Excellent: 'bg-green-500',
    Good: 'bg-blue-500',
    Optimistic: 'bg-purple-500',
    Neutral: 'bg-gray-500',
    Anxious: 'bg-yellow-500',
    Sad: 'bg-red-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                Personal Journal
              </h1>
              <p className="text-neutral-600">Express your thoughts and track your emotional journey</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button
                onClick={() => setShowNewEntry(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Entry Form */}
          {showNewEntry && (
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">New Journal Entry</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      placeholder="Give your entry a title..."
                      className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      How are you feeling?
                    </label>
                    <select
                      value={newEntry.mood}
                      onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                      className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select your mood</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Optimistic">Optimistic</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Anxious">Anxious</option>
                      <option value="Sad">Sad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Your thoughts
                    </label>
                    <textarea
                      value={newEntry.content}
                      onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                      placeholder="What's on your mind today? Write about your feelings, experiences, or anything you'd like to remember..."
                      rows={8}
                      className="w-full p-3 border border-neutral-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowNewEntry(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEntry}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Entry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Journal Entries */}
          <div className={showNewEntry ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <div className="space-y-6">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                        {entry.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-neutral-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{entry.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${moodColors[entry.mood as keyof typeof moodColors]}`}></div>
                          <span>{entry.mood}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-700 leading-relaxed mb-4">
                    {entry.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Writing Prompts */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Writing Prompts
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm text-neutral-700">
                      What are three things you're grateful for today?
                    </p>
                  </div>
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    <p className="text-sm text-neutral-700">
                      Describe a moment when you felt proud of yourself.
                    </p>
                  </div>
                  <div className="p-3 bg-accent-50 rounded-lg">
                    <p className="text-sm text-neutral-700">
                      What would you tell your past self about handling stress?
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Your Journey
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Total Entries</span>
                    <span className="font-semibold text-neutral-900">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">This Month</span>
                    <span className="font-semibold text-neutral-900">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Streak</span>
                    <span className="font-semibold text-neutral-900">5 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
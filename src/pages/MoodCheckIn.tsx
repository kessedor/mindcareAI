import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Heart, MessageCircle } from 'lucide-react';
import MoodSelector, { moodOptions } from '../components/MoodSelector';
import Button from '../components/Button';
import { moodAPI } from '../utils/api';

interface MoodCheckInData {
  mood: string;
  notes: string;
  factors: string[];
}

const MoodCheckIn: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MoodCheckInData>({
    mood: '',
    notes: '',
    factors: [],
  });

  const factors = [
    { id: 'work', label: 'Work/School', color: 'bg-blue-500' },
    { id: 'relationships', label: 'Relationships', color: 'bg-purple-500' },
    { id: 'health', label: 'Health', color: 'bg-green-500' },
    { id: 'sleep', label: 'Sleep', color: 'bg-indigo-500' },
    { id: 'exercise', label: 'Exercise', color: 'bg-orange-500' },
    { id: 'weather', label: 'Weather', color: 'bg-yellow-500' },
    { id: 'social', label: 'Social Life', color: 'bg-pink-500' },
    { id: 'finances', label: 'Finances', color: 'bg-red-500' },
  ];

  const selectedMoodOption = moodOptions.find(option => option.id === data.mood);
  const moodValue = data.mood ? moodOptions.findIndex(option => option.id === data.mood) + 1 : 0;

  const handleFactorToggle = (factorId: string) => {
    setData(prev => ({
      ...prev,
      factors: prev.factors.includes(factorId)
        ? prev.factors.filter(id => id !== factorId)
        : [...prev.factors, factorId]
    }));
  };

  const handleSubmit = async () => {
    if (!data.mood) return;

    setLoading(true);
    try {
      await moodAPI.createMoodEntry({
        mood: moodValue,
        notes: data.notes,
        factors: data.factors,
      });

      // Navigate to mood tracker with success message
      navigate('/mood', { 
        state: { 
          message: 'Mood logged successfully! Keep up the great work.' 
        }
      });
    } catch (error) {
      console.error('Failed to log mood:', error);
      // You could add error handling here
    } finally {
      setLoading(false);
    }
  };

  const canProceedFromStep1 = data.mood !== '';
  const canProceedFromStep2 = true; // Notes are optional
  const canSubmit = data.mood !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/mood')}
            className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Mood Tracker</span>
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-4">
              <Heart className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-display font-bold text-neutral-900">
                Mood Check-In
              </h1>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-2 mb-2">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-3 h-3 rounded-full transition-all ${
                    step >= stepNumber
                      ? 'bg-primary-500'
                      : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-neutral-600">Step {step} of 3</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          {/* Step 1: Mood Selection */}
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                  How are you feeling right now?
                </h2>
                <p className="text-neutral-600">
                  Select the mood that best describes your current emotional state
                </p>
              </div>

              <MoodSelector
                selectedMood={data.mood}
                onSelect={(mood) => setData(prev => ({ ...prev, mood }))}
                className="mb-8"
              />

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedFromStep1}
                  className="min-w-[120px]"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Factors and Notes */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                  What's influencing your mood?
                </h2>
                <p className="text-neutral-600">
                  Select any factors that might be affecting how you feel (optional)
                </p>
              </div>

              {/* Factors */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Contributing Factors</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {factors.map((factor) => (
                    <button
                      key={factor.id}
                      onClick={() => handleFactorToggle(factor.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        data.factors.includes(factor.id)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${factor.color}`}></div>
                        <span>{factor.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-8">
                <label className="block text-lg font-medium text-neutral-900 mb-4">
                  Additional Notes
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Anything specific you'd like to remember about today? (optional)"
                  rows={4}
                  className="w-full p-4 border border-neutral-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedFromStep2}
                  className="min-w-[120px]"
                >
                  Review
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review and Submit */}
          {step === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                  Review Your Check-In
                </h2>
                <p className="text-neutral-600">
                  Make sure everything looks correct before submitting
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {/* Selected Mood */}
                <div className="bg-neutral-50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Your Mood</h3>
                  {selectedMoodOption && (
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedMoodOption.color}`}>
                        <span className="text-2xl">{selectedMoodOption.emoji}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{selectedMoodOption.label}</p>
                        <p className="text-sm text-neutral-600">Mood level: {moodValue}/5</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Factors */}
                {data.factors.length > 0 && (
                  <div className="bg-neutral-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-neutral-900 mb-3">Contributing Factors</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.factors.map((factorId) => {
                        const factor = factors.find(f => f.id === factorId);
                        return factor ? (
                          <span
                            key={factorId}
                            className="inline-flex items-center space-x-2 px-3 py-1 bg-white rounded-full text-sm"
                          >
                            <div className={`w-2 h-2 rounded-full ${factor.color}`}></div>
                            <span>{factor.label}</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {data.notes && (
                  <div className="bg-neutral-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-neutral-900 mb-3">Notes</h3>
                    <p className="text-neutral-700">{data.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  className="min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Submit Check-In
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Your mood data helps us provide better insights and track your emotional wellness journey over time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoodCheckIn;
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, MessageCircle, Clock, TrendingUp, Brain, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { chatAPI, ChatAnalytics as ChatAnalyticsType } from '../api/chatAPI';

const ChatAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<ChatAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await chatAPI.getAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'anxious': return '😰';
      case 'angry': return '😠';
      case 'excited': return '🤗';
      case 'frustrated': return '😤';
      case 'hopeful': return '🌟';
      default: return '😐';
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'bg-green-500';
      case 'sad': return 'bg-blue-500';
      case 'anxious': return 'bg-yellow-500';
      case 'angry': return 'bg-red-500';
      case 'excited': return 'bg-purple-500';
      case 'frustrated': return 'bg-orange-500';
      case 'hopeful': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'No analytics data available'}</p>
            <Link to="/ai-chat">
              <Button>Back to Chat</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const emotionEntries = Object.entries(analytics.emotionDistribution);
  const totalEmotions = emotionEntries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/ai-chat"
            className="inline-flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to AI Chat</span>
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-4">
              <BarChart3 className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-display font-bold text-neutral-900">
                Chat Analytics
              </h1>
            </div>
            <p className="text-neutral-600">
              Insights into your mental health journey and conversation patterns
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Conversations</p>
                <p className="text-2xl font-bold text-neutral-900">{analytics.totalConversations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Messages</p>
                <p className="text-2xl font-bold text-neutral-900">{analytics.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Words Shared</p>
                <p className="text-2xl font-bold text-neutral-900">{analytics.totalWords.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Avg. Messages/Chat</p>
                <p className="text-2xl font-bold text-neutral-900">{analytics.averageMessagesPerConversation}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emotion Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Emotion Distribution
            </h3>
            <div className="space-y-4">
              {emotionEntries.map(([emotion, count]) => {
                const percentage = totalEmotions > 0 ? (count / totalEmotions) * 100 : 0;
                return (
                  <div key={emotion} className="flex items-center space-x-3">
                    <span className="text-2xl">{getEmotionIcon(emotion)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-neutral-900 capitalize">
                          {emotion}
                        </span>
                        <span className="text-sm text-neutral-600">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getEmotionColor(emotion)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Patterns */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Activity Patterns
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                <span className="text-neutral-700">Most Active Hour</span>
                <span className="font-semibold text-neutral-900">
                  {analytics.activeTimeAnalysis.mostActiveHour}:00
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                <span className="text-neutral-700">This Week</span>
                <span className="font-semibold text-neutral-900">
                  {analytics.activeTimeAnalysis.conversationsThisWeek} conversations
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                <span className="text-neutral-700">This Month</span>
                <span className="font-semibold text-neutral-900">
                  {analytics.activeTimeAnalysis.conversationsThisMonth} conversations
                </span>
              </div>
            </div>
          </div>

          {/* Mood Trends */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Recent Mood Trends
            </h3>
            <div className="space-y-3">
              {analytics.moodTrends.slice(-10).map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getEmotionIcon(trend.emotion)}</span>
                    <span className="text-sm text-neutral-600">{trend.date}</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 capitalize">
                    {trend.emotion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-medium text-neutral-900 mb-2">Communication Pattern</h4>
              <p className="text-sm text-neutral-700">
                You've shared {analytics.totalWords.toLocaleString()} words across {analytics.totalConversations} conversations. 
                This shows great engagement with your mental health journey.
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-medium text-neutral-900 mb-2">Emotional Awareness</h4>
              <p className="text-sm text-neutral-700">
                Your emotional range shows healthy self-awareness. Continue expressing your feelings 
                to maintain this positive trend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAnalytics;
import React, { useState } from 'react';
import { Shield, Users, MessageCircle, AlertTriangle, Filter, Search, Eye } from 'lucide-react';
import Button from '../components/Button';

interface ConversationSummary {
  id: string;
  userId: string;
  messageCount: number;
  lastActivity: string;
  riskLevel: 'low' | 'medium' | 'high';
  emotionTags: string[];
  hasCrisisKeywords: boolean;
  duration: string;
}

const AdminDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'high-risk' | 'crisis'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app, this would come from API
  const conversations: ConversationSummary[] = [
    {
      id: 'conv_001',
      userId: 'user_123',
      messageCount: 15,
      lastActivity: '2024-01-15T10:30:00Z',
      riskLevel: 'high',
      emotionTags: ['anxious', 'sad', 'hopeful'],
      hasCrisisKeywords: true,
      duration: '45 min',
    },
    {
      id: 'conv_002',
      userId: 'user_456',
      messageCount: 8,
      lastActivity: '2024-01-15T09:15:00Z',
      riskLevel: 'medium',
      emotionTags: ['frustrated', 'angry'],
      hasCrisisKeywords: false,
      duration: '22 min',
    },
    {
      id: 'conv_003',
      userId: 'user_789',
      messageCount: 12,
      lastActivity: '2024-01-15T08:45:00Z',
      riskLevel: 'low',
      emotionTags: ['happy', 'excited'],
      hasCrisisKeywords: false,
      duration: '35 min',
    },
    {
      id: 'conv_004',
      userId: 'user_321',
      messageCount: 20,
      lastActivity: '2024-01-14T16:20:00Z',
      riskLevel: 'high',
      emotionTags: ['sad', 'anxious', 'hopeless'],
      hasCrisisKeywords: true,
      duration: '67 min',
    },
  ];

  const stats = {
    totalUsers: 1247,
    activeConversations: 89,
    highRiskSessions: 12,
    crisisInterventions: 3,
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'bg-green-500';
      case 'sad': return 'bg-blue-500';
      case 'anxious': return 'bg-yellow-500';
      case 'angry': return 'bg-red-500';
      case 'frustrated': return 'bg-orange-500';
      case 'hopeful': return 'bg-purple-500';
      case 'hopeless': return 'bg-gray-500';
      case 'excited': return 'bg-pink-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = filter === 'all' || 
      (filter === 'high-risk' && conv.riskLevel === 'high') ||
      (filter === 'crisis' && conv.hasCrisisKeywords);
    
    const matchesSearch = searchTerm === '' || 
      conv.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-4">
              <Shield className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-display font-bold text-neutral-900">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-neutral-600">
              Monitor user conversations and identify users who may need additional support
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Users</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Active Conversations</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.activeConversations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">High Risk Sessions</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.highRiskSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Crisis Interventions</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.crisisInterventions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-neutral-400" />
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  All Conversations
                </button>
                <button
                  onClick={() => setFilter('high-risk')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'high-risk'
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  High Risk
                </button>
                <button
                  onClick={() => setFilter('crisis')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'crisis'
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Crisis Keywords
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by user ID or conversation ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Conversations Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">
              Conversation Monitoring ({filteredConversations.length} results)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Conversation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Emotions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredConversations.map((conversation) => (
                  <tr key={conversation.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {conversation.id}
                        </div>
                        <div className="text-sm text-neutral-500">
                          User: {conversation.userId}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {conversation.messageCount} messages • {conversation.duration}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRiskColor(conversation.riskLevel)}`}>
                          {conversation.riskLevel}
                        </span>
                        {conversation.hasCrisisKeywords && (
                          <AlertTriangle className="h-4 w-4 text-red-500" title="Crisis keywords detected" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {conversation.emotionTags.map((emotion, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full ${getEmotionColor(emotion)}`}
                            title={emotion}
                          ></div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(conversation.lastActivity).toLocaleDateString()} at{' '}
                      {new Date(conversation.lastActivity).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Section */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Crisis Intervention Protocol
              </h3>
              <p className="text-red-800 text-sm mb-4">
                When crisis keywords are detected or high-risk patterns are identified, 
                immediate intervention protocols should be activated. This includes contacting 
                emergency services if necessary and providing immediate support resources.
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                  View Protocol
                </Button>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                  Emergency Contacts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
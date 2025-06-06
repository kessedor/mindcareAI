import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, MessageCircle, BookOpen, Heart, TrendingUp, Calendar, Award, Bell } from 'lucide-react';
import Button from '../components/Button';

const Dashboard: React.FC = () => {
  const quickActions = [
    {
      title: 'AI Chat Session',
      description: 'Start a conversation with your AI therapist',
      icon: MessageCircle,
      href: '/chat',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Daily Journal',
      description: 'Write about your thoughts and feelings',
      icon: BookOpen,
      href: '/journal',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Track Mood',
      description: 'Log your current emotional state',
      icon: Heart,
      href: '/mood',
      color: 'from-red-500 to-red-600',
    },
  ];

  const stats = [
    { label: 'Mood Score', value: '7.8', change: '+0.5', trend: 'up' },
    { label: 'Journal Entries', value: '23', change: '+3', trend: 'up' },
    { label: 'Chat Sessions', value: '12', change: '+1', trend: 'up' },
    { label: 'Streak Days', value: '7', change: '+1', trend: 'up' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                Welcome back, Sarah!
              </h1>
              <p className="text-neutral-600">Here's your mental wellness overview for today</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                </div>
                <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">{action.title}</h3>
                  <p className="text-neutral-600">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Trends */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Mood Trends</h3>
              <BarChart3 className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">This Week</span>
                <span className="text-green-600 font-medium">Improving</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-sm text-neutral-600">
                Your mood has been consistently above average this week. Keep up the great work!
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Recent Achievements</h3>
              <Award className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Award className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">7-Day Streak</p>
                  <p className="text-sm text-neutral-600">Consistent daily check-ins</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">First AI Session</p>
                  <p className="text-sm text-neutral-600">Completed your first chat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
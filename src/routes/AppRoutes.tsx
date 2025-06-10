import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Chat from '../pages/Chat';
import AIChat from '../pages/AIChat';
import Journal from '../pages/Journal';
import MoodTracker from '../pages/MoodTracker';
import MoodCheckIn from '../pages/MoodCheckIn';
import ScheduleTherapy from '../pages/ScheduleTherapy';
import ChatAnalytics from '../pages/ChatAnalytics';
import AdminDashboard from '../pages/AdminDashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/ai-chat" element={<AIChat />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/mood" element={<MoodTracker />} />
      <Route path="/mood/check-in" element={<MoodCheckIn />} />
      <Route path="/schedule-therapy" element={<ScheduleTherapy />} />
      <Route path="/chat-analytics" element={<ChatAnalytics />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Chat from '../pages/Chat';
import Journal from '../pages/Journal';
import MoodTracker from '../pages/MoodTracker';
import MoodCheckIn from '../pages/MoodCheckIn';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/mood" element={<MoodTracker />} />
      <Route path="/mood/check-in" element={<MoodCheckIn />} />
    </Routes>
  );
};

export default AppRoutes;
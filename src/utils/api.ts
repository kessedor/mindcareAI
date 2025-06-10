import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // For testing purposes, use a mock token
    const token = localStorage.getItem('authToken') || 'mock-token-for-testing';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // For testing, don't redirect on 401
      console.warn('Authentication failed, but continuing for testing');
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

export const chatAPI = {
  sendMessage: (message: string, sessionId?: string) =>
    api.post('/chat/message', { message, sessionId }),
  
  getSessions: () =>
    api.get('/chat/sessions'),
  
  getSession: (sessionId: string) =>
    api.get(`/chat/sessions/${sessionId}`),
  
  deleteSession: (sessionId: string) =>
    api.delete(`/chat/sessions/${sessionId}`),
};

export const journalAPI = {
  getEntries: (page = 1, limit = 10) =>
    api.get(`/journal/entries?page=${page}&limit=${limit}`),
  
  getEntry: (entryId: string) =>
    api.get(`/journal/entries/${entryId}`),
  
  createEntry: (entry: { title: string; content: string; mood: string; tags?: string[] }) =>
    api.post('/journal/entries', entry),
  
  updateEntry: (entryId: string, entry: Partial<{ title: string; content: string; mood: string; tags: string[] }>) =>
    api.put(`/journal/entries/${entryId}`, entry),
  
  deleteEntry: (entryId: string) =>
    api.delete(`/journal/entries/${entryId}`),
};

export const moodAPI = {
  getMoodEntries: (startDate?: string, endDate?: string) =>
    api.get('/mood/entries', { params: { startDate, endDate } }),
  
  createMoodEntry: (entry: { mood: number; notes?: string; factors?: string[] }) =>
    api.post('/mood/entries', entry),
  
  updateMoodEntry: (entryId: string, entry: Partial<{ mood: number; notes: string; factors: string[] }>) =>
    api.put(`/mood/entries/${entryId}`, entry),
  
  deleteMoodEntry: (entryId: string) =>
    api.delete(`/mood/entries/${entryId}`),
  
  getStats: () =>
    api.get('/mood/stats'),
};

export default api;
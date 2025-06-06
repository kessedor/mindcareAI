import { authAPI } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // Initialize from localStorage
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.state = {
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
      };
    }
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Get current auth state
  getState(): AuthState {
    return { ...this.state };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.token;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.state.user;
  }

  // Get auth token
  getToken(): string | null {
    return this.state.token;
  }

  // Login
  async login(email: string, password: string): Promise<void> {
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;

      this.state = {
        user,
        token,
        isAuthenticated: true,
      };

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      this.notify();
    } catch (error) {
      throw error;
    }
  }

  // Register
  async register(email: string, password: string, name: string): Promise<void> {
    try {
      const response = await authAPI.register(email, password, name);
      const { user, token } = response.data;

      this.state = {
        user,
        token,
        isAuthenticated: true,
      };

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      this.notify();
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      this.state = {
        user: null,
        token: null,
        isAuthenticated: false,
      };

      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      this.notify();
    }
  }

  // Refresh token
  async refreshToken(): Promise<void> {
    try {
      const response = await authAPI.refreshToken();
      const { token } = response.data;

      this.state.token = token;
      localStorage.setItem('authToken', token);
      
      this.notify();
    } catch (error) {
      // If refresh fails, logout user
      await this.logout();
      throw error;
    }
  }

  // Update user profile
  async updateProfile(): Promise<void> {
    try {
      const response = await authAPI.getProfile();
      const { user } = response.data;

      this.state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      
      this.notify();
    } catch (error) {
      throw error;
    }
  }

  // Initialize auth (check token validity)
  async initialize(): Promise<void> {
    if (!this.state.token) {
      return;
    }

    try {
      await this.updateProfile();
    } catch (error) {
      // If token is invalid, logout
      await this.logout();
    }
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Export instance and types
export default authManager;
export type { User, AuthState };
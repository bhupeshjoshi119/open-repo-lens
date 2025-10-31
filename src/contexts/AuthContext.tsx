import React, { createContext, useContext, useEffect, useState } from 'react';
import { githubAuth, GitHubUser } from '@/services/githubAuth';
import { githubApi } from '@/services/githubApi';

interface AuthContextType {
  user: GitHubUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Try to initialize with stored token
      if (githubAuth.initializeWithStoredToken()) {
        const userData = await githubAuth.getAuthenticatedUser();
        setUser(userData);
        
        // Set token in API service
        const token = githubAuth.getStoredToken();
        if (token) {
          githubApi.setToken(token);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear invalid token
      githubAuth.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    const authUrl = githubAuth.getAuthUrl();
    window.location.href = authUrl;
  };

  const logout = () => {
    githubAuth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (githubAuth.isAuthenticated()) {
      try {
        const userData = await githubAuth.getAuthenticatedUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user:', error);
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
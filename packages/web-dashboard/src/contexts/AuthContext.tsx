import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Amplify, Auth } from 'aws-amplify';

// Configure Amplify with Cognito settings from environment variables
Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_REGION || 'us-east-1',
    userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
    userPoolWebClientId: import.meta.env.VITE_CLIENT_ID || '',
  },
});

interface AuthContextType {
  isAuthenticated: boolean;
  authToken: string | null;
  userEmail: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount and after OAuth callback
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Try to get current authenticated user
      const user = await Auth.currentAuthenticatedUser();
      
      // Get current session with tokens
      const session = await Auth.currentSession();
      
      if (session && session.isValid()) {
        const token = session.getIdToken().getJwtToken();
        
        // Store token in localStorage for persistence
        localStorage.setItem('authToken', token);
        
        setAuthToken(token);
        setUserEmail(user.attributes?.email || null);
        setIsAuthenticated(true);
      } else {
        // No valid session
        clearAuthState();
      }
    } catch (error) {
      // User is not authenticated
      console.log('Not authenticated:', error);
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthState = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUserEmail(null);
    setIsAuthenticated(false);
  };

  const login = async (username: string, password: string) => {
    try {
      // Sign in with username and password
      const user = await Auth.signIn(username, password);
      
      // Get current session with tokens
      const session = await Auth.currentSession();
      
      if (session && session.isValid()) {
        const token = session.getIdToken().getJwtToken();
        
        // Store token in localStorage for persistence
        localStorage.setItem('authToken', token);
        
        setAuthToken(token);
        setUserEmail(user.attributes?.email || username);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear local state
      clearAuthState();
      
      // Sign out from Cognito (redirects to Hosted UI)
      await Auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    authToken,
    userEmail,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

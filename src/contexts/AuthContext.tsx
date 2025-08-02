// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // In development, we'll simulate authentication
  // In production, this would integrate with Auth0
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    if (isDevelopment) {
      // Simulate dev authentication - matches your DevAuthHandler
      setUser({
        id: "test-user-123",
        email: "dev@example.com",
        name: "Test Developer",
      });
      setIsLoading(false);
    } else {
      // In production, you'd check for Auth0 tokens here
      // For now, just set loading to false
      setIsLoading(false);
    }
  }, [isDevelopment]);

  const login = async () => {
    if (isDevelopment) {
      // In dev, just set the user
      setUser({
        id: "test-user-123",
        email: "dev@example.com",
        name: "Test Developer",
      });
    } else {
      // In production, redirect to Auth0
      // window.location.href = '/auth/login';
      console.log("Production Auth0 login would happen here");
    }
  };

  const logout = () => {
    setUser(null);
    if (!isDevelopment) {
      // In production, clear Auth0 session
      // window.location.href = '/auth/logout';
      console.log("Production Auth0 logout would happen here");
    }
  };

  const getAuthToken = () => {
    if (isDevelopment) {
      // In dev mode, no token needed since backend uses DevAuthHandler
      return "dev-token";
    }
    // In production, get the Auth0 JWT token from localStorage or wherever it's stored
    return localStorage.getItem("auth_token");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

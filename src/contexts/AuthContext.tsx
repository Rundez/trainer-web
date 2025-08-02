// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
        setUser({
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0],
        });
      } else if (isDevelopment) {
        // Fall back to dev mode
        setUser({
          id: "test-user-123",
          email: "dev@example.com",
          name: "Test Developer",
        });
      }

      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);

      if (session) {
        setSession(session);
        setUser({
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0],
        });
      } else {
        setSession(null);
        if (isDevelopment) {
          // Keep dev user in development
          setUser({
            id: "test-user-123",
            email: "dev@example.com",
            name: "Test Developer",
          });
        } else {
          setUser(null);
        }
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDevelopment]);

  const login = async () => {
    if (isDevelopment) {
      // In dev, just set the user
      setUser({
        id: "test-user-123",
        email: "dev@example.com",
        name: "Test Developer",
      });
      return;
    }

    try {
      // Redirect to Supabase Auth UI or use signInWithPassword
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google", // You can change this to your preferred provider
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (isDevelopment) {
      setUser(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }

      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const getAuthToken = () => {
    if (isDevelopment) {
      return "dev-token";
    }

    return session?.access_token || null;
  };

  const value: AuthContextType = {
    user,
    session,
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

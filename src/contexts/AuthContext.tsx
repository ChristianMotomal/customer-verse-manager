
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const MOCK_USERS: { [key: string]: User & { password: string } } = {
  "admin@example.com": {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  },
  "user@example.com": {
    id: "2",
    email: "user@example.com",
    password: "user123",
    name: "Regular User",
    role: "user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session in localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const normalizedEmail = email.toLowerCase();
    const mockUser = MOCK_USERS[normalizedEmail];
    
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      toast.success("Logged in successfully");
    } else {
      toast.error("Invalid email or password");
      throw new Error("Invalid email or password");
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const normalizedEmail = email.toLowerCase();
    
    // Check if user already exists
    if (MOCK_USERS[normalizedEmail]) {
      toast.error("User already exists");
      setIsLoading(false);
      throw new Error("User already exists");
    }
    
    // In a real app, we would send this to an API
    // For mock purposes, we'll just create a new user locally
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: normalizedEmail,
      name,
      role: "user",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedEmail}`,
    };
    
    // Add to mock users (this would persist only during the current session)
    MOCK_USERS[normalizedEmail] = { ...newUser, password };
    
    // Auto-login the new user
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    toast.success("Account created successfully");
    
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Define types
interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create auth context
export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

// API base URL - update with your NestJS backend URL
const API_URL = "http://localhost:3000/api";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Check if user is logged in when app starts
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Load token from storage
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          // Set axios auth header for all requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Fetch user data
          const response = await axios.get(`${API_URL}/users/me`);
          setUser(response.data);
          setUserToken(token);
        }
      } catch (error) {
        console.log("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Auth methods
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { access_token, user } = response.data;

      // Save token and set auth header
      await AsyncStorage.setItem("userToken", access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setUserToken(access_token);
      setUser(user);

      return { success: true };
    } catch (error: any) {
      console.log("Login error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, userData);
      return { success: true };
    } catch (error: any) {
      console.log("Register error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Remove token from storage
      await AsyncStorage.removeItem("userToken");

      // Remove auth header
      delete axios.defaults.headers.common["Authorization"];

      setUserToken(null);
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

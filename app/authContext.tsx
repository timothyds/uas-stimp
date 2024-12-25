import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define AuthContext types
interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props type for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// AuthProvider component that manages authentication state
export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("userToken");
      setIsLoggedIn(!!token); // Set logged-in status based on the token
    };

    checkLogin();
  }, [isLoggedIn]);

  // Function to handle login
  const login = async () => {
    await AsyncStorage.setItem("userToken", "dummy-token"); // Store token
    setIsLoggedIn(true);
  };

  // Function to handle logout
  const logout = async () => {
    await AsyncStorage.removeItem("userToken"); // Remove token
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

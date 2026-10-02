"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const saveAuthSession = useCallback((authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem("raj_auth_token", authToken);
    localStorage.setItem("raj_auth_user", JSON.stringify(authUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("raj_auth_token");
    localStorage.removeItem("raj_auth_user");
    router.push("/");
  }, [router]);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await authService.getProfile();
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem("raj_auth_user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn("Could not reach backend API server:", err.message);
    }
  }, []);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("raj_auth_token");
    const storedUser = localStorage.getItem("raj_auth_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Optionally verify token freshness
        refreshProfile();
      } catch (err) {
        console.error("Failed to parse stored auth user:", err);
        localStorage.removeItem("raj_auth_token");
        localStorage.removeItem("raj_auth_user");
      }
    }
    setIsLoading(false);
  }, [refreshProfile]);

  const login = async ({ email, password }) => {
    const data = await authService.login({ email, password });
    if (data.token && data.user) {
      saveAuthSession(data.token, data.user);
    }
    return data;
  };

  const verifySignupOtp = async ({ email, otp }) => {
    const data = await authService.verifySignupOtp({ email, otp });
    if (data.token && data.user) {
      saveAuthSession(data.token, data.user);
    }
    return data;
  };

  const updateUserProfile = async (profileData) => {
    const data = await authService.updateProfile(profileData);
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("raj_auth_user", JSON.stringify(data.user));
    }
    return data;
  };

  const uploadProfileImage = async (file) => {
    const data = await authService.uploadProfileImage(file);
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("raj_auth_user", JSON.stringify(data.user));
    }
    return data;
  };

  const deleteProfileImage = async () => {
    const data = await authService.deleteProfileImage();
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("raj_auth_user", JSON.stringify(data.user));
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        verifySignupOtp,
        updateUserProfile,
        uploadProfileImage,
        deleteProfileImage,
        refreshProfile,
        saveAuthSession,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

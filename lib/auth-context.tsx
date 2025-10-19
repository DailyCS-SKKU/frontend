import React, { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { storage } from "./storage";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const token = await storage.getItem("accessToken");
      setIsAuthenticated(!!token);

      if (!token) {
        router.replace("/login");
      }
    } catch (error) {
      console.error("토큰 확인 실패:", error);
      setIsAuthenticated(false);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    setIsAuthenticated(true);
    router.replace("/(tabs)");
  };

  const logout = async () => {
    try {
      console.log("로그아웃 시작");
      await storage.removeItem("accessToken");
      setIsAuthenticated(false);
      console.log("토큰 제거 완료, 로그인 페이지로 이동");
      router.replace("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 에러가 발생해도 로그아웃 상태로 만들기
      setIsAuthenticated(false);
      router.replace("/login");
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

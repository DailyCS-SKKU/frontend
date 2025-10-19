import { apiClient } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Google 로그인 요청 타입
export interface GoogleLoginRequest {
  code: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  id: number;
  provider: string;
  email: string;
  name: string;
  nickname: string;
  imageUrl: string;
  status: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  headers?: any;
}

// 사용자 정보 타입
export interface UserInfo {
  id: number;
  provider: string;
  email: string;
  name: string;
  nickname: string;
  imageUrl: string;
  status: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Google OAuth 로그인
 * @param code Google OAuth 인증 코드
 * @returns 로그인 응답 데이터
 */
export const loginWithGoogle = async (code: string): Promise<LoginResponse> => {
  const requestData: GoogleLoginRequest = { code };
  const response = await apiClient.post<LoginResponse>(
    "/auth/login/google",
    requestData
  );

  // access token을 localStorage에 저장
  const token =
    response.headers?.["access-token"] || response.headers?.["authorization"];
  if (token) {
    await AsyncStorage.setItem("accessToken", token);
    console.log("✅ Access token 저장 완료");
  }

  return response;
};

/**
 * 현재 사용자 정보 조회
 * @returns 사용자 정보
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  return apiClient.get<UserInfo>("/user-info/me");
};

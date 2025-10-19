import { apiClient } from "./api";
import { storage } from "./storage";

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

  // 토큰 처리는 api.ts에서 자동으로 처리됩니다
  return response;
};

/**
 * 현재 사용자 정보 조회
 * @returns 사용자 정보
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  return apiClient.get<UserInfo>("/user-info/me");
};

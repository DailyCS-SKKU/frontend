import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Constants from "expo-constants";

// 환경변수에서 API URL 가져오기
const API_BASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:3000/api";

// axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (필요시 토큰 추가 등)
api.interceptors.request.use(
  (config) => {
    // 여기에 인증 토큰 추가 로직을 넣을 수 있습니다
    // const token = getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // 공통 에러 처리
    if (error.response?.status === 401) {
      // 인증 에러 처리
      console.log("인증이 필요합니다.");
    }
    return Promise.reject(error);
  }
);

// API 호출 wrapper 함수들
export const apiClient = {
  // GET 요청
  get: <T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.get(endpoint, config).then((response) => response.data);
  },

  // POST 요청
  post: <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T & { headers?: any }> => {
    return api.post(endpoint, data, config).then((response) => ({
      ...response.data,
      headers: response.headers,
    }));
  },

  // PUT 요청
  put: <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.put(endpoint, data, config).then((response) => response.data);
  },

  // DELETE 요청
  delete: <T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.delete(endpoint, config).then((response) => response.data);
  },

  // PATCH 요청
  patch: <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return api.patch(endpoint, data, config).then((response) => response.data);
  },
};

export default apiClient;

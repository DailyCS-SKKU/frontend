import { useRouter } from "expo-router";
import { useLoading } from "@/lib/loading-context";
import { useCallback } from "react";

export const useNavigationWithLoading = () => {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const navigateWithLoading = useCallback(
    async (
      path: string,
      options?: {
        params?: Record<string, any>;
        loadingMessage?: string;
        refreshData?: () => Promise<void>;
      }
    ) => {
      try {
        // 로딩 표시
        showLoading(options?.loadingMessage || "페이지를 불러오는 중...");

        // 데이터 새로고침이 필요한 경우 실행
        if (options?.refreshData) {
          await options.refreshData();
        }

        // 페이지 이동
        if (options?.params) {
          router.push({ pathname: path, params: options.params });
        } else {
          router.push(path);
        }

        // 로딩 숨기기 (페이지 이동 후 약간의 지연)
        setTimeout(() => {
          hideLoading();
        }, 500);
      } catch (error) {
        console.error("Navigation error:", error);
        hideLoading();
      }
    },
    [router, showLoading, hideLoading]
  );

  const replaceWithLoading = useCallback(
    async (
      path: string,
      options?: {
        params?: Record<string, any>;
        loadingMessage?: string;
        refreshData?: () => Promise<void>;
      }
    ) => {
      try {
        showLoading(options?.loadingMessage || "페이지를 불러오는 중...");

        if (options?.refreshData) {
          await options.refreshData();
        }

        if (options?.params) {
          router.replace({ pathname: path, params: options.params });
        } else {
          router.replace(path);
        }

        setTimeout(() => {
          hideLoading();
        }, 500);
      } catch (error) {
        console.error("Navigation error:", error);
        hideLoading();
      }
    },
    [router, showLoading, hideLoading]
  );

  const backWithLoading = useCallback(
    async (options?: {
      loadingMessage?: string;
      refreshData?: () => Promise<void>;
    }) => {
      try {
        showLoading(options?.loadingMessage || "이전 페이지로 이동 중...");

        if (options?.refreshData) {
          await options.refreshData();
        }

        router.back();

        setTimeout(() => {
          hideLoading();
        }, 500);
      } catch (error) {
        console.error("Navigation error:", error);
        hideLoading();
      }
    },
    [router, showLoading, hideLoading]
  );

  return {
    navigateWithLoading,
    replaceWithLoading,
    backWithLoading,
  };
};

import { apiClient } from "./api";

// 직군 타입 정의
export interface Job {
  id: number;
  name: string;
}

// 관심 직군 추가/삭제 요청 타입
export interface JobIdsRequest {
  jobIds: number[];
}

/**
 * 1. 관심 직군 추가
 * @param jobIds 추가할 직군 ID 배열
 * @returns 성공 응답
 */
export const addInterestedJobs = async (jobIds: number[]) => {
  const requestData: JobIdsRequest = { jobIds };
  return apiClient.post("/user-info/add-job", requestData);
};

/**
 * 2. 관심 직군 조회
 * @returns 현재 사용자의 관심 직군 목록
 */
export const getInterestedJobs = async (): Promise<Job[]> => {
  try {
    const response = await apiClient.get<Job[]>("/user-info/get-job");
    console.log("관심 직군 API 응답:", response);
    console.log("관심 직군 응답 타입:", typeof response);

    // 응답이 문자열인 경우 JSON 파싱 시도
    if (typeof response === "string") {
      try {
        const parsedResponse = JSON.parse(response);
        console.log("파싱된 관심 직군 응답:", parsedResponse);
        if (Array.isArray(parsedResponse)) {
          return parsedResponse;
        }
      } catch (parseError) {
        console.error("관심 직군 JSON 파싱 실패:", parseError);
      }
    }

    // apiClient.get()은 이미 response.data를 반환하므로 직접 사용
    if (Array.isArray(response)) {
      return response;
    } else {
      console.warn("관심 직군 API 응답이 배열이 아닙니다:", response);
      return [];
    }
  } catch (error) {
    console.error("관심 직군 조회 실패:", error);
    throw error;
  }
};

/**
 * 3. 관심 직군 삭제
 * @param jobIds 삭제할 직군 ID 배열
 * @returns 성공 응답
 */
export const deleteInterestedJobs = async (jobIds: number[]) => {
  const requestData: JobIdsRequest = { jobIds };
  return apiClient.delete("/user-info/delete-job", { data: requestData });
};

/**
 * 4. 모든 직군 조회
 * @returns 전체 직군 목록
 */
export const getAllJobs = async (): Promise<Job[]> => {
  try {
    const response = await apiClient.get<Job[]>("/job/all");
    console.log("모든 직군 API 응답:", response);
    console.log("응답 타입:", typeof response);
    console.log("배열 여부:", Array.isArray(response));
    console.log("응답 구조:", Object.keys(response || {}));

    // 응답이 문자열인 경우 JSON 파싱 시도
    if (typeof response === "string") {
      try {
        const parsedResponse = JSON.parse(response);
        console.log("파싱된 응답:", parsedResponse);
        if (Array.isArray(parsedResponse)) {
          return parsedResponse;
        }
      } catch (parseError) {
        console.error("JSON 파싱 실패:", parseError);
      }
    }

    // apiClient.get()은 이미 response.data를 반환하므로 직접 사용
    if (Array.isArray(response)) {
      return response;
    } else {
      // 배열이 아닌 경우에도 데이터가 있으면 반환
      if (response && typeof response === "object") {
        // 만약 response가 { data: [...] } 형태라면
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // 만약 response가 { jobs: [...] } 형태라면
        if (Array.isArray(response.jobs)) {
          return response.jobs;
        }
      }
      console.warn("모든 직군 API 응답이 배열이 아닙니다:", response);
      return [];
    }
  } catch (error) {
    console.error("모든 직군 조회 실패:", error);
    throw error;
  }
};

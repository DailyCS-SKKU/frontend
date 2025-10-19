import { apiClient } from "./api";

// 스킬 타입 정의
export interface Skill {
  id: number;
  name: string;
}

// 관심 스킬 추가 요청 타입
export interface AddSkillsRequest {
  skillIds: number[];
}

/**
 * 1. 관심 스킬 추가
 * @param skillIds 추가할 스킬 ID 배열
 * @returns 성공 응답
 */
export const addInterestedSkills = async (skillIds: number[]) => {
  const requestData: AddSkillsRequest = { skillIds };
  return apiClient.post("/user-info/add-skill", requestData);
};

/**
 * 2. 관심 스킬 조회
 * @returns 현재 사용자의 관심 스킬 목록
 */
export const getInterestedSkills = async (): Promise<Skill[]> => {
  try {
    const response = await apiClient.get<Skill[]>("/user-info/get-skill");
    console.log("관심 스킬 API 응답:", response);
    console.log("관심 스킬 응답 타입:", typeof response);

    // 응답이 문자열인 경우 JSON 파싱 시도
    if (typeof response === "string") {
      try {
        const parsedResponse = JSON.parse(response);
        console.log("파싱된 관심 스킬 응답:", parsedResponse);
        if (Array.isArray(parsedResponse)) {
          return parsedResponse;
        }
      } catch (parseError) {
        console.error("관심 스킬 JSON 파싱 실패:", parseError);
      }
    }

    // apiClient.get()은 이미 response.data를 반환하므로 직접 사용
    if (Array.isArray(response)) {
      return response;
    } else {
      console.warn("관심 스킬 API 응답이 배열이 아닙니다:", response);
      return [];
    }
  } catch (error) {
    console.error("관심 스킬 조회 실패:", error);
    throw error;
  }
};

/**
 * 3. 관심 스킬 삭제
 * @param skillIds 삭제할 스킬 ID 배열
 * @returns 성공 응답
 */
export const deleteInterestedSkills = async (skillIds: number[]) => {
  const requestData: AddSkillsRequest = { skillIds };
  return apiClient.delete("/user-info/delete-skill", { data: requestData });
};

/**
 * 4. 모든 스킬 조회
 * @returns 전체 스킬 목록
 */
export const getAllSkills = async (): Promise<Skill[]> => {
  try {
    const response = await apiClient.get<Skill[]>("/skill/all");
    console.log("모든 스킬 API 응답:", response);
    console.log("응답 타입:", typeof response);

    // 응답이 문자열인 경우 JSON 파싱 시도
    if (typeof response === "string") {
      try {
        const parsedResponse = JSON.parse(response);
        console.log("파싱된 스킬 응답:", parsedResponse);
        if (Array.isArray(parsedResponse)) {
          return parsedResponse;
        }
      } catch (parseError) {
        console.error("스킬 JSON 파싱 실패:", parseError);
      }
    }

    // 배열인 경우 직접 반환
    if (Array.isArray(response)) {
      return response;
    }

    console.warn("모든 스킬 API 응답이 배열이 아닙니다:", response);
    return [];
  } catch (error) {
    console.error("모든 스킬 조회 실패:", error);
    throw error;
  }
};

import { apiClient } from "./api";

// 1일1질문 API 타입 정의
export interface SolvedQuestion {
  questionId: number;
  question: string;
  answer: string;
  day: number;
  skillId: number;
  skillName: string;
  bookmark: boolean;
  status: "CORRECT" | "IN_PROGRESS" | "WRONG";
  createdAt: string;
  updatedAt: string;
}

export interface NextQuestion {
  questionId: number;
  question: string;
  answer: string;
  day: number;
  skillId: number;
  skillName: string;
  bookmark: null;
  status: null;
  createdAt: null;
  updatedAt: null;
}

export interface ChatMessage {
  messageId: number;
  turnNumber: number;
  role: "USER" | "ASSISTANT";
  content: string;
  status: "ASSISTANT" | "CORRECT" | "WRONG";
  createdAt: string;
}

export interface ChatQuestion {
  questionId: number;
  question: string;
  answer: string;
  day: number;
  skillId: number;
  skillName: string;
  bookmark: boolean;
  status: "IN_PROGRESS" | "CORRECT" | "WRONG";
  createdAt: string;
  updatedAt: string;
}

export interface ChatInfo {
  question: ChatQuestion;
  messages: ChatMessage[];
}

// 1일1질문 API 함수들
export const questionApi = {
  // 풀었던 문제들 조회
  getSolvedQuestions: async (skillId: number): Promise<SolvedQuestion[]> => {
    try {
      const response = await apiClient.get<SolvedQuestion[]>(
        `/question/correct?skillId=${skillId}`
      );
      console.log("getSolvedQuestions API 응답:", response);
      console.log("응답 타입:", typeof response);
      console.log("배열 여부:", Array.isArray(response));

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

      // 배열인 경우 직접 반환
      if (Array.isArray(response)) {
        return response;
      }

      console.warn("API 응답이 배열이 아닙니다:", response);
      return [];
    } catch (error) {
      console.error("getSolvedQuestions API 호출 실패:", error);
      throw error;
    }
  },

  // 다음 문제 조회
  getNextQuestion: async (skillId: number): Promise<NextQuestion> => {
    try {
      const response = await apiClient.get<NextQuestion>(
        `/question/next?skillId=${skillId}`
      );
      console.log("getNextQuestion API 응답:", response);
      console.log("응답 타입:", typeof response);

      // 응답이 문자열인 경우 JSON 파싱 시도
      if (typeof response === "string") {
        try {
          const parsedResponse = JSON.parse(response);
          console.log("파싱된 NextQuestion 응답:", parsedResponse);
          return parsedResponse;
        } catch (parseError) {
          console.error("NextQuestion JSON 파싱 실패:", parseError);
          throw new Error("NextQuestion 응답 파싱 실패");
        }
      }

      // 객체인 경우 직접 반환
      if (typeof response === "object" && response !== null) {
        return response;
      }

      console.warn("NextQuestion API 응답이 예상과 다릅니다:", response);
      throw new Error("NextQuestion 응답 형식 오류");
    } catch (error) {
      console.error("getNextQuestion API 호출 실패:", error);
      throw error;
    }
  },

  // 채팅방 조회
  getChatInfo: (questionId: number): Promise<ChatInfo> => {
    return apiClient.get<ChatInfo>(
      `/question/get-info?questionId=${questionId}`
    );
  },
};

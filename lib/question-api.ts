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

// 답변 보내기 API 타입 정의
export interface SendAnswerRequest {
  questionId: number;
  userAnswer: string;
}

export interface SendAnswerResponse {
  feedback: string;
  good: string;
  improve: string;
  score: number;
  summary: string;
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
  getChatInfo: async (questionId: number): Promise<ChatInfo> => {
    try {
      const response = await apiClient.get<ChatInfo>(
        `/question/get-info?questionId=${questionId}`
      );
      console.log("getChatInfo API 응답:", response);
      console.log("응답 타입:", typeof response);

      // 응답이 문자열인 경우 JSON 파싱 시도
      if (typeof response === "string") {
        try {
          const parsedResponse = JSON.parse(response);
          console.log("파싱된 ChatInfo 응답:", parsedResponse);
          return parsedResponse;
        } catch (parseError) {
          console.error("ChatInfo JSON 파싱 실패:", parseError);
          throw new Error("ChatInfo 응답 파싱 실패");
        }
      }

      // 객체인 경우 직접 반환
      if (typeof response === "object" && response !== null) {
        return response;
      }

      console.warn("ChatInfo API 응답이 예상과 다릅니다:", response);
      throw new Error("ChatInfo 응답 형식 오류");
    } catch (error) {
      console.error("getChatInfo API 호출 실패:", error);
      throw error;
    }
  },

  // 답변 보내기
  sendAnswer: async (
    request: SendAnswerRequest
  ): Promise<SendAnswerResponse> => {
    try {
      const response = await apiClient.post<SendAnswerResponse>(
        `/ai/ask/with-history`,
        request
      );
      console.log("sendAnswer API 응답:", response);
      console.log("응답 타입:", typeof response);

      // 응답이 문자열인 경우 JSON 파싱 시도
      if (typeof response === "string") {
        try {
          const parsedResponse = JSON.parse(response);
          console.log("파싱된 SendAnswer 응답:", parsedResponse);
          return parsedResponse;
        } catch (parseError) {
          console.error("SendAnswer JSON 파싱 실패:", parseError);
          throw new Error("SendAnswer 응답 파싱 실패");
        }
      }

      // 응답이 배열인 경우 (토큰 단위로 분리된 경우)
      if (Array.isArray(response)) {
        console.log("응답이 배열로 왔습니다 (토큰 분리):", response);
        // 배열을 문자열로 조합
        const combinedResponse = response.join("");
        console.log("조합된 응답:", combinedResponse);

        try {
          const parsedResponse = JSON.parse(combinedResponse);
          console.log("조합 후 파싱된 응답:", parsedResponse);
          return parsedResponse;
        } catch (parseError) {
          console.error("조합된 응답 JSON 파싱 실패:", parseError);
          // 파싱 실패 시 원본 배열을 문자열로 반환
          return {
            feedback: combinedResponse,
            good: "",
            improve: "",
            score: 0,
            summary: "",
          };
        }
      }

      // 객체인 경우 각 속성이 토큰으로 분리되어 있는지 확인
      if (typeof response === "object" && response !== null) {
        console.log("객체 응답 분석:", response);

        // 토큰으로 분리된 객체인지 확인 (숫자 키가 있는지)
        const hasNumericKeys = Object.keys(response).some((key) =>
          /^\d+$/.test(key)
        );

        if (hasNumericKeys) {
          console.log("토큰으로 분리된 객체 감지, 전체를 문자열로 조합");
          // 전체 객체를 문자열로 조합
          const combinedString = Object.values(response).join("");
          console.log("조합된 전체 문자열:", combinedString);

          try {
            const parsedResponse = JSON.parse(combinedString);
            console.log("조합 후 파싱된 응답:", parsedResponse);
            return parsedResponse;
          } catch (parseError) {
            console.error("조합된 문자열 JSON 파싱 실패:", parseError);
            // 파싱 실패 시 조합된 문자열을 feedback으로 사용
            return {
              feedback: combinedString,
              good: "",
              improve: "",
              score: 0,
              summary: "",
            };
          }
        }

        // 일반 객체인 경우 직접 반환
        return response;
      }

      console.warn("SendAnswer API 응답이 예상과 다릅니다:", response);
      throw new Error("SendAnswer 응답 형식 오류");
    } catch (error) {
      console.error("sendAnswer API 호출 실패:", error);
      throw error;
    }
  },
};

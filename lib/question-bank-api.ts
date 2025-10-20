import { apiClient } from "./api";

// 문제은행 API 타입 정의
export interface QuestionBankItem {
  questionId: number;
  question: string;
  answer: string;
  day: number;
  skillId: number;
  skillName: string;
  bookmark: boolean | null;
  status: "IN_PROGRESS" | "CORRECT" | "WRONG" | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// 문제은행 답변 보내기 API 타입 정의
export interface QuestionBankSendAnswerRequest {
  questionId: number;
  userAnswer: string;
  aiSummary: string;
}

export interface QuestionBankSendAnswerResponse {
  feedback: string;
  summary: string;
}

// 문제은행 API 함수들
export const questionBankApi = {
  // 문제 목록 조회
  getQuestionList: async (skillId: number): Promise<QuestionBankItem[]> => {
    try {
      const response = await apiClient.get<QuestionBankItem[]>(
        `/question/get-list?skillId=${skillId}`
      );

      console.log("getQuestionList API 응답:", response);
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
          throw new Error("문제 목록 응답 파싱 실패");
        }
      }

      // 배열인 경우 직접 반환
      if (Array.isArray(response)) {
        return response;
      }

      console.warn("API 응답이 배열이 아닙니다:", response);
      return [];
    } catch (error) {
      console.error("getQuestionList API 호출 실패:", error);
      throw error;
    }
  },

  // JSON 변환 유틸리티 함수
  convertToJson: (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("JSON 변환 실패:", error);
      throw new Error("데이터를 JSON으로 변환할 수 없습니다");
    }
  },

  // JSON 파싱 유틸리티 함수
  parseFromJson: <T>(jsonString: string): T => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("JSON 파싱 실패:", error);
      throw new Error("JSON을 파싱할 수 없습니다");
    }
  },

  // 문제 목록을 JSON 문자열로 변환
  getQuestionListAsJson: async (skillId: number): Promise<string> => {
    try {
      const questionList = await questionBankApi.getQuestionList(skillId);
      return questionBankApi.convertToJson(questionList);
    } catch (error) {
      console.error("문제 목록 JSON 변환 실패:", error);
      throw error;
    }
  },

  // 특정 문제 상세 정보 조회 (추가 기능)
  getQuestionDetail: async (
    questionId: number
  ): Promise<QuestionBankItem | null> => {
    try {
      // 모든 스킬에 대해 문제 목록을 조회하여 해당 questionId 찾기
      // 실제로는 별도의 API 엔드포인트가 있을 수 있음
      const allSkills = [1, 2, 3, 4, 5]; // 예시 스킬 ID들

      for (const skillId of allSkills) {
        try {
          const questions = await questionBankApi.getQuestionList(skillId);
          const foundQuestion = questions.find(
            (q) => q.questionId === questionId
          );
          if (foundQuestion) {
            return foundQuestion;
          }
        } catch (error) {
          // 해당 스킬에서 문제를 찾지 못한 경우 다음 스킬로 계속
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error("getQuestionDetail API 호출 실패:", error);
      throw error;
    }
  },

  // 문제 상태 업데이트 (추가 기능 - 실제 API가 있다면)
  updateQuestionStatus: async (
    questionId: number,
    status: "IN_PROGRESS" | "CORRECT" | "WRONG"
  ): Promise<boolean> => {
    try {
      // 실제 API 엔드포인트가 있다면 여기에 구현
      // 현재는 로컬 스토리지나 다른 방식으로 상태 관리
      console.log(`문제 ${questionId}의 상태를 ${status}로 업데이트`);
      return true;
    } catch (error) {
      console.error("문제 상태 업데이트 실패:", error);
      throw error;
    }
  },

  // 북마크 토글 (추가 기능 - 실제 API가 있다면)
  toggleBookmark: async (questionId: number): Promise<boolean> => {
    try {
      // 실제 API 엔드포인트가 있다면 여기에 구현
      console.log(`문제 ${questionId}의 북마크 상태 토글`);
      return true;
    } catch (error) {
      console.error("북마크 토글 실패:", error);
      throw error;
    }
  },

  // 문제은행 답변 보내기
  sendAnswer: async (
    request: QuestionBankSendAnswerRequest
  ): Promise<QuestionBankSendAnswerResponse> => {
    try {
      const response = await apiClient.post<QuestionBankSendAnswerResponse>(
        `/ai/ask/no-history`,
        request
      );
      console.log("문제은행 답변 전송 API 응답:", response);
      console.log("응답 타입:", typeof response);
      console.log("응답 내용 상세:", JSON.stringify(response, null, 2));

      // 응답을 그대로 반환 (파싱 로직 제거)
      return response;
    } catch (error) {
      console.error("문제은행 답변 전송 API 호출 실패:", error);
      throw error;
    }
  },
};

export default questionBankApi;

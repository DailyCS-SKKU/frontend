import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  questionApi,
  SolvedQuestion,
  NextQuestion,
} from "../../lib/question-api";
import { getInterestedSkills, Skill } from "../../lib/skill-api";

export default function DailyQuestionScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [questions, setQuestions] = useState<SolvedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 관심 스킬 목록 가져오기
  const fetchInterestedSkills = async () => {
    try {
      const data = await getInterestedSkills();
      setSkills(data);
      // 첫 번째 스킬을 기본 선택으로 설정
      if (data.length > 0) {
        setSelectedSkill(data[0]);
        fetchQuestions(data[0].id);
      }
    } catch (err) {
      console.error("관심 스킬 가져오기 실패:", err);
      setError("관심 스킬을 가져오는데 실패했습니다.");
    }
  };

  // 오늘 날짜인지 확인하는 함수
  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // 문제 목록 가져오기
  const fetchQuestions = async (skillId: number) => {
    setLoading(true);
    setError(null);

    try {
      const solvedQuestions = await questionApi.getSolvedQuestions(skillId);
      console.log("풀었던 문제 목록:", solvedQuestions);

      let allQuestions: SolvedQuestion[] = [];

      // 데이터가 배열인지 확인
      if (Array.isArray(solvedQuestions)) {
        allQuestions = [...solvedQuestions];

        // 오늘 날짜에 푼 문제가 있는지 확인
        const hasTodayQuestion = solvedQuestions.some((question) =>
          isToday(question.createdAt)
        );

        // 오늘 날짜에 푼 문제가 없으면 오늘의 문제 가져오기
        if (!hasTodayQuestion) {
          try {
            const nextQuestion = await questionApi.getNextQuestion(skillId);
            console.log("오늘의 문제:", nextQuestion);

            // NextQuestion을 SolvedQuestion 형태로 변환
            const todayQuestion: SolvedQuestion = {
              questionId: nextQuestion.questionId || 0,
              question: nextQuestion.question || "",
              answer: nextQuestion.answer || "",
              day: nextQuestion.day || 1,
              skillId: nextQuestion.skillId || skillId,
              skillName: nextQuestion.skillName || "",
              bookmark: false, // null을 false로 변환
              status: "IN_PROGRESS", // null을 IN_PROGRESS로 변환
              createdAt: new Date().toISOString(), // 오늘 날짜로 설정
              updatedAt: new Date().toISOString(), // 오늘 날짜로 설정
            };

            console.log("변환된 오늘의 문제:", todayQuestion);

            // 오늘의 문제를 맨 앞에 추가
            allQuestions.unshift(todayQuestion);
            console.log("오늘의 문제가 추가된 전체 목록:", allQuestions);
          } catch (nextQuestionError) {
            console.error("오늘의 문제 가져오기 실패:", nextQuestionError);
            // 오늘의 문제 가져오기 실패해도 풀었던 문제 목록은 표시
          }
        }
      } else {
        console.warn("API 응답이 배열이 아닙니다. 빈 배열로 설정합니다.");
        allQuestions = [];
      }

      setQuestions(allQuestions);
    } catch (err) {
      console.error("문제 목록 가져오기 실패:", err);
      setError("문제 목록을 가져오는데 실패했습니다.");
      setQuestions([]); // 에러 시에도 빈 배열로 설정
      Alert.alert("오류", "문제 목록을 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 스킬 선택 핸들러
  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
    fetchQuestions(skill.id);
  };

  // 컴포넌트 마운트 시 관심 스킬 목록 가져오기
  useEffect(() => {
    fetchInterestedSkills();
  }, []);

  // 관심 스킬이 없으면 간단한 메시지만 표시
  if (skills.length === 0 && !loading && !error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>1일 1질문</Text>
        </View>
        <View style={styles.noSkillsContainer}>
          <Text style={styles.noSkillsText}>관심 스킬이 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>1일 1질문</Text>
      </View>

      {/* Skill Tabs */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {skills.map((skill) => (
            <TouchableOpacity
              key={skill.id}
              style={[
                styles.categoryTab,
                selectedSkill?.id === skill.id && styles.selectedCategoryTab,
              ]}
              onPress={() => handleSkillSelect(skill)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedSkill?.id === skill.id && styles.selectedCategoryText,
                ]}
              >
                {skill.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Questions List */}
      <ScrollView
        style={styles.questionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9C27B0" />
            <Text style={styles.loadingText}>문제 목록을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF5722" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                if (selectedSkill) {
                  fetchQuestions(selectedSkill.id);
                } else {
                  fetchInterestedSkills();
                }
              }}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : !Array.isArray(questions) || questions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>
              {selectedSkill?.name || "선택된 스킬"}에 풀었던 문제가 없습니다.
            </Text>
          </View>
        ) : (
          questions.map((item) => (
            <TouchableOpacity
              key={item.questionId || `question-${Math.random()}`}
              style={styles.questionItem}
              onPress={() => {
                router.push({
                  pathname: "/chat",
                  params: {
                    questionId: item.questionId?.toString() || "",
                    question: item.question || "",
                    category: item.skillName || "",
                  },
                });
              }}
            >
              <View style={styles.questionContent}>
                <View style={styles.questionHeader}>
                  <Text style={styles.dayText}>{item.day}일차</Text>
                  <View style={styles.questionCategoryTag}>
                    <Text style={styles.questionCategoryText}>
                      {item.skillName}
                    </Text>
                  </View>
                  {isToday(item.createdAt) && item.status === "IN_PROGRESS" && (
                    <View style={styles.todayTag}>
                      <Text style={styles.todayTagText}>오늘의 문제</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.questionText}>{item.question}</Text>
              </View>
              <View style={styles.statusIcon}>
                {item.status === "CORRECT" ? (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                ) : item.status === "IN_PROGRESS" ? (
                  <Ionicons name="time-outline" size={24} color="#FF9800" />
                ) : (
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
  },
  categorySection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryContainer: {
    marginBottom: 0,
  },
  categoryContent: {
    paddingRight: 16,
  },
  categoryTab: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 12,
    marginRight: 6,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategoryTab: {
    backgroundColor: "#9C27B0",
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    lineHeight: 12,
  },
  selectedCategoryText: {
    color: "#FFF",
  },
  questionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionContent: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  questionCategoryTag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  questionCategoryText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  todayTag: {
    backgroundColor: "#9C27B0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayTagText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "600",
  },
  questionText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
  },
  statusIcon: {
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: "#FF5722",
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#9C27B0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 24,
  },
  noSkillsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noSkillsText: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 24,
  },
});

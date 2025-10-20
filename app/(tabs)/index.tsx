import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { questionApi, SolvedQuestion } from "../../lib/question-api";
import { getInterestedSkills, getAllSkills, Skill } from "../../lib/skill-api";
import { useNavigationWithLoading } from "../../hooks/use-navigation-with-loading";
import { questionBankApi, QuestionBankItem } from "../../lib/question-bank-api";

export default function HomeScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [todayStats, setTodayStats] = useState({
    answered: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [randomQuestions, setRandomQuestions] = useState<QuestionBankItem[]>(
    []
  );
  const [randomQuestionsLoading, setRandomQuestionsLoading] = useState(false);
  const [frequentSkills, setFrequentSkills] = useState<Skill[]>([]);
  const [frequentSkillsLoading, setFrequentSkillsLoading] = useState(false);
  const { navigateWithLoading } = useNavigationWithLoading();

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

  // 오늘의 질문 통계 가져오기
  const fetchTodayStats = async () => {
    setLoading(true);
    try {
      const interestedSkills = await getInterestedSkills();
      setSkills(interestedSkills);

      let totalQuestions = 0;
      let answeredQuestions = 0;

      // 각 스킬별로 오늘의 문제 확인
      for (const skill of interestedSkills) {
        try {
          const solvedQuestions = await questionApi.getSolvedQuestions(
            skill.id
          );

          if (Array.isArray(solvedQuestions)) {
            // 오늘 날짜에 푼 문제가 있는지 확인
            const hasTodayQuestion = solvedQuestions.some((question) =>
              isToday(question.createdAt)
            );

            if (hasTodayQuestion) {
              totalQuestions++;
              // 오늘 푼 문제 중 답변 완료된 것 확인
              const todayAnswered = solvedQuestions.some(
                (question) =>
                  isToday(question.createdAt) && question.status === "CORRECT"
              );
              if (todayAnswered) {
                answeredQuestions++;
              }
            } else {
              // 오늘 문제가 없으면 다음 문제가 오늘의 문제가 될 것
              totalQuestions++;
            }
          }
        } catch (error) {
          console.error(`스킬 ${skill.name} 문제 조회 실패:`, error);
        }
      }

      setTodayStats({
        answered: answeredQuestions,
        total: totalQuestions,
      });
    } catch (error) {
      console.error("오늘의 질문 통계 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 랜덤 문제 가져오기
  const fetchRandomQuestions = async () => {
    setRandomQuestionsLoading(true);
    try {
      // 4~6개 사이의 랜덤한 개수로 문제 가져오기
      const count = Math.floor(Math.random() * 3) + 4; // 4, 5, 6 중 하나
      const questions = await questionBankApi.getRandomQuestions(count);
      setRandomQuestions(questions);
    } catch (error) {
      console.error("랜덤 문제 조회 실패:", error);
      setRandomQuestions([]);
    } finally {
      setRandomQuestionsLoading(false);
    }
  };

  // 단골 질문 유형 (랜덤 스킬) 가져오기
  const fetchFrequentSkills = async () => {
    setFrequentSkillsLoading(true);
    try {
      const allSkills = await getAllSkills();
      // 랜덤하게 5개 선택
      const shuffled = allSkills.sort(() => 0.5 - Math.random());
      setFrequentSkills(shuffled.slice(0, 5));
    } catch (error) {
      console.error("스킬 목록 조회 실패:", error);
      setFrequentSkills([]);
    } finally {
      setFrequentSkillsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 통계, 랜덤 문제, 단골 질문 유형 가져오기
  useEffect(() => {
    fetchTodayStats();
    fetchRandomQuestions();
    fetchFrequentSkills();
  }, []);

  // 스킬별 아이콘과 색상 매핑 (문제은행과 동일)
  const getSkillIconAndColor = (skillName: string) => {
    const skillMap: { [key: string]: { icon: string; color: string } } = {
      Spring: { icon: "leaf", color: "#4CAF50" },
      Java: { icon: "cafe", color: "#F44336" },
      JavaScript: { icon: "logo-javascript", color: "#FFD700" },
      React: { icon: "logo-react", color: "#61DAFB" },
      데이터베이스: { icon: "server", color: "#2196F3" },
      네트워크: { icon: "globe", color: "#FF9800" },
      인공지능: { icon: "brain", color: "#9C27B0" },
      OS: { icon: "desktop", color: "#607D8B" },
      알고리즘: { icon: "analytics", color: "#795548" },
      Python: { icon: "logo-python", color: "#3776AB" },
      "Node.js": { icon: "logo-nodejs", color: "#68A063" },
      "Vue.js": { icon: "logo-vue", color: "#4FC08D" },
      Angular: { icon: "logo-angular", color: "#DD0031" },
      TypeScript: { icon: "logo-typescript", color: "#3178C6" },
      Docker: { icon: "logo-docker", color: "#2496ED" },
      Kubernetes: { icon: "logo-kubernetes", color: "#326CE5" },
      AWS: { icon: "logo-amazon", color: "#FF9900" },
      Git: { icon: "git-branch", color: "#F05032" },
    };

    return skillMap[skillName] || { icon: "code", color: "#666666" };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DailyCS</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Question Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigateWithLoading("/daily-question", {
              loadingMessage: "오늘의 질문을 불러오는 중...",
              refreshData: fetchTodayStats,
            })
          }
        >
          <View style={styles.todayQuestionContent}>
            <Text style={styles.todayQuestionText}>오늘의 질문 보러가기</Text>
            <View style={styles.streakContainer}>
              {loading ? (
                <ActivityIndicator size="small" color="#9C27B0" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={todayStats.answered > 0 ? "#4CAF50" : "#9E9E9E"}
                  />
                  <Text
                    style={[
                      styles.streakText,
                      {
                        color: todayStats.answered > 0 ? "#4CAF50" : "#9E9E9E",
                      },
                    ]}
                  >
                    {todayStats.total > 0
                      ? `${todayStats.answered}/${todayStats.total} 완료`
                      : "오늘의 질문이 없습니다"}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Frequent Question Types */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>단골 질문 유형</Text>
          {frequentSkillsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#9C27B0" />
              <Text style={styles.loadingText}>스킬을 불러오는 중...</Text>
            </View>
          ) : frequentSkills.length > 0 ? (
            frequentSkills.map((skill, index) => {
              const { icon, color } = getSkillIconAndColor(skill.name);
              return (
                <TouchableOpacity
                  key={skill.id}
                  style={styles.listItem}
                  onPress={() => {
                    navigateWithLoading("/problem-list", {
                      params: {
                        skillId: skill.id.toString(),
                        skillName: skill.name,
                      },
                      loadingMessage: "문제 목록을 불러오는 중...",
                      refreshData: fetchTodayStats,
                    });
                  }}
                >
                  <Ionicons name={icon as any} size={20} color={color} />
                  <Text style={styles.listItemText}>{skill.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>스킬을 불러올 수 없습니다</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchFrequentSkills}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Random Questions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>오답률 높은 문제 풀어보기</Text>
          {randomQuestionsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#9C27B0" />
              <Text style={styles.loadingText}>문제를 불러오는 중...</Text>
            </View>
          ) : randomQuestions.length > 0 ? (
            randomQuestions.map((question, index) => (
              <TouchableOpacity
                key={question.questionId}
                style={styles.listItem}
                onPress={() => {
                  navigateWithLoading("/question-bank-chat", {
                    params: {
                      questionId: question.questionId.toString(),
                      question: question.question,
                      skillName: question.skillName,
                    },
                    loadingMessage: "채팅방을 준비하는 중...",
                    refreshData: fetchTodayStats,
                  });
                }}
              >
                <Ionicons
                  name={getSkillIconAndColor(question.skillName).icon as any}
                  size={20}
                  color={getSkillIconAndColor(question.skillName).color}
                />
                <Text style={styles.listItemText}>
                  {question.question.length > 30
                    ? `${question.question.substring(0, 30)}...`
                    : question.question}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>문제를 불러올 수 없습니다</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchRandomQuestions}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayQuestionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayQuestionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#9C27B0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

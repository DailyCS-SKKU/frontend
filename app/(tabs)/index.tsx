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
import { getInterestedSkills, Skill } from "../../lib/skill-api";
import { useNavigationWithLoading } from "../../hooks/use-navigation-with-loading";

export default function HomeScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [todayStats, setTodayStats] = useState({
    answered: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
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

  // 컴포넌트 마운트 시 통계 가져오기
  useEffect(() => {
    fetchTodayStats();
  }, []);

  const frequentQuestions = [
    { icon: "leaf", color: "#4CAF50", title: "Spring 트랜잭션" },
    { icon: "nuclear", color: "#2196F3", title: "React 상태 관리" },
    { icon: "leaf", color: "#4CAF50", title: "JPA 영속성" },
    { icon: "settings", color: "#9E9E9E", title: "정렬 알고리즘" },
    { icon: "server", color: "#9E9E9E", title: "데이터베이스 인덱스" },
  ];

  const incorrectProblems = [
    {
      icon: "leaf",
      color: "#4CAF50",
      title: "네트워크의 7계층에는 어떤 것이 있...",
      fullQuestion:
        "네트워크의 7계층에는 어떤 것이 있으며, 각 계층의 역할은 무엇인가요?",
      category: "네트워크",
    },
    {
      icon: "nuclear",
      color: "#2196F3",
      title: "데드락의 개념과 데드락이 일어날...",
      fullQuestion:
        "데드락의 개념과 데드락이 일어날 수 있는 조건들을 설명해주세요.",
      category: "운영체제",
    },
    {
      icon: "leaf",
      color: "#4CAF50",
      title: "클러스터링 인덱스가 무엇이고, 장...",
      fullQuestion: "클러스터링 인덱스가 무엇이고, 장단점은 무엇인가요?",
      category: "데이터베이스",
    },
    {
      icon: "settings",
      color: "#9E9E9E",
      title: "해쉬 테이블에서 해쉬 충돌이 일어...",
      fullQuestion:
        "해쉬 테이블에서 해쉬 충돌이 일어날 때 해결 방법은 무엇인가요?",
      category: "자료구조",
    },
  ];

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
          {frequentQuestions.map((item, index) => (
            <TouchableOpacity key={index} style={styles.listItem}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={styles.listItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Incorrect Problems */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>틀렸던 문제 다시 풀어보기</Text>
          {incorrectProblems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.listItem}
              onPress={() => {
                navigateWithLoading("/chat", {
                  params: {
                    question: item.fullQuestion,
                    category: item.category,
                  },
                  loadingMessage: "채팅방을 준비하는 중...",
                  refreshData: fetchTodayStats,
                });
              }}
            >
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={styles.listItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
            </TouchableOpacity>
          ))}
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
});

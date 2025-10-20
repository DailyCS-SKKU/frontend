import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { questionBankApi, QuestionBankItem } from "../lib/question-bank-api";
import { useNavigationWithLoading } from "../hooks/use-navigation-with-loading";

export default function ProblemListScreen() {
  const { skillId, skillName } = useLocalSearchParams();
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { navigateWithLoading, backWithLoading } = useNavigationWithLoading();

  useEffect(() => {
    if (skillId) {
      loadQuestions();
    }
  }, [skillId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const skillIdNum = parseInt(skillId as string, 10);
      const questionsData = await questionBankApi.getQuestionList(skillIdNum);
      setQuestions(questionsData);
    } catch (err) {
      console.error("문제 목록 로드 실패:", err);
      setError("문제 목록을 불러오는데 실패했습니다.");
      Alert.alert("오류", "문제 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleProblemPress = (question: QuestionBankItem) => {
    navigateWithLoading("/question-bank-chat", {
      params: {
        questionId: question.questionId.toString(),
        question: question.question,
        skillName: typeof skillName === "string" ? skillName : "Spring",
      },
      loadingMessage: "채팅방을 준비하는 중...",
      refreshData: loadQuestions,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              backWithLoading({
                loadingMessage: "이전 페이지로 이동 중...",
                refreshData: loadQuestions,
              })
            }
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {typeof skillName === "string" ? skillName : "Spring"} 문제은행
            </Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>문제 목록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              backWithLoading({
                loadingMessage: "이전 페이지로 이동 중...",
                refreshData: loadQuestions,
              })
            }
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {typeof skillName === "string" ? skillName : "Spring"} 문제은행
            </Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadQuestions}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            backWithLoading({
              loadingMessage: "이전 페이지로 이동 중...",
              refreshData: loadQuestions,
            })
          }
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {typeof skillName === "string" ? skillName : "Spring"} 문제은행
          </Text>
        </View>
      </View>

      {/* Problem List */}
      <ScrollView
        style={styles.problemsContainer}
        showsVerticalScrollIndicator={false}
      >
        {questions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>문제가 없습니다.</Text>
          </View>
        ) : (
          questions.map((question) => (
            <TouchableOpacity
              key={question.questionId}
              style={styles.problemItem}
              onPress={() => handleProblemPress(question)}
            >
              <View style={styles.problemContent}>
                <Text style={styles.problemNumber}>{question.day}.</Text>
                <Text style={styles.problemText}>{question.question}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  problemsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  problemItem: {
    backgroundColor: "#FFF",
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
  problemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  problemNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
    minWidth: 20,
  },
  problemText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
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
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
  },
});

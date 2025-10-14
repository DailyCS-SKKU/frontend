import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function HomeScreen() {
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
        <TouchableOpacity style={styles.card}>
          <View style={styles.todayQuestionContent}>
            <Text style={styles.todayQuestionText}>오늘의 질문 보러가기</Text>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={16} color="#FF6B35" />
              <Text style={styles.streakText}>연속 5일차</Text>
              <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
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
                router.push({
                  pathname: "/chat",
                  params: {
                    question: item.fullQuestion,
                    category: item.category,
                  },
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

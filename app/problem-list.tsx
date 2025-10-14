import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

interface Problem {
  id: number;
  question: string;
  completed: boolean;
}

export default function ProblemListScreen() {
  const { category } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<"solved" | "unsolved">(
    "solved"
  );

  // 더미 데이터 - 실제로는 API에서 가져올 데이터
  const problems: Problem[] = [
    {
      id: 1,
      question: "Spring Framework와 Spring Boot의 차이점은 무엇인가요?",
      completed: true,
    },
    {
      id: 2,
      question:
        "IoC(Inversion of Control)와 DI(Dependency Injection)의 개념과 장점을 설명해주세요.",
      completed: false,
    },
    {
      id: 3,
      question: "AOP(관점 지향 프로그래밍)의 주요 사용 사례는 무엇인가요?",
      completed: true,
    },
    {
      id: 4,
      question:
        "@Component, @Service, @Repository, @Controller의 차이점을 설명해주세요.",
      completed: true,
    },
    {
      id: 5,
      question: "Lazy Loading과 Eager Loading의 차이를 설명해주세요.",
      completed: true,
    },
  ];

  const filteredProblems = problems.filter((problem) =>
    selectedTab === "solved" ? problem.completed : !problem.completed
  );

  const handleProblemPress = (problem: Problem) => {
    router.push({
      pathname: "/chat",
      params: {
        question: problem.question,
        category: typeof category === "string" ? category : "Spring",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {typeof category === "string" ? category : "Spring"} 문제은행
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "solved" && styles.selectedTab]}
          onPress={() => setSelectedTab("solved")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "solved" && styles.selectedTabText,
            ]}
          >
            푼 문제
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "unsolved" && styles.selectedTab]}
          onPress={() => setSelectedTab("unsolved")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "unsolved" && styles.selectedTabText,
            ]}
          >
            안 푼 문제
          </Text>
        </TouchableOpacity>
      </View>

      {/* Problem List */}
      <ScrollView
        style={styles.problemsContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredProblems.map((problem) => (
          <TouchableOpacity
            key={problem.id}
            style={styles.problemItem}
            onPress={() => handleProblemPress(problem)}
          >
            <View style={styles.problemContent}>
              <Text style={styles.problemNumber}>{problem.id}.</Text>
              <Text style={styles.problemText}>{problem.question}</Text>
            </View>
            <View style={styles.statusIcon}>
              {problem.completed ? (
                <Ionicons name="checkmark" size={20} color="#000" />
              ) : (
                <Ionicons name="close" size={20} color="#000" />
              )}
            </View>
          </TouchableOpacity>
        ))}
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedTab: {
    backgroundColor: "#9C27B0",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  selectedTabText: {
    color: "#FFF",
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
  statusIcon: {
    marginLeft: 12,
  },
});

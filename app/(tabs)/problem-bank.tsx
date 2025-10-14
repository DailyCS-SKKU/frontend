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

export default function ProblemBankScreen() {
  const problemCategories = [
    {
      title: "Spring",
      icon: "leaf",
      color: "#4CAF50",
      description: "Spring Framework 관련 문제",
    },
    {
      title: "데이터베이스",
      icon: "server",
      color: "#2196F3",
      description: "데이터베이스 설계 및 쿼리",
    },
    {
      title: "네트워크",
      icon: "globe",
      color: "#FF9800",
      description: "네트워크 프로토콜 및 보안",
    },
    {
      title: "React",
      icon: "logo-react",
      color: "#61DAFB",
      description: "React 컴포넌트 및 상태 관리",
    },
    {
      title: "인공지능",
      icon: "brain",
      color: "#9C27B0",
      description: "머신러닝 및 딥러닝",
    },
    {
      title: "OS",
      icon: "desktop",
      color: "#607D8B",
      description: "운영체제 및 시스템 프로그래밍",
    },
    {
      title: "JAVA",
      icon: "cafe",
      color: "#F44336",
      description: "Java 프로그래밍 언어",
    },
    {
      title: "알고리즘",
      icon: "analytics",
      color: "#795548",
      description: "자료구조 및 알고리즘",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>문제은행</Text>
      </View>

      {/* Problem Categories Grid */}
      <ScrollView
        style={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {problemCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryCard}
              onPress={() => {
                router.push({
                  pathname: "/problem-list",
                  params: { category: category.title },
                });
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: category.color },
                ]}
              >
                <Ionicons name={category.icon as any} size={32} color="#FFF" />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
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
  gridContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
});

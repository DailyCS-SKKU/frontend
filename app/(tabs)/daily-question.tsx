import React, { useState } from "react";
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

export default function DailyQuestionScreen() {
  const [selectedCategory, setSelectedCategory] = useState("알고리즘");

  const categories = [
    "Spring",
    "JAVA",
    "네트워크",
    "알고리즘",
    "데이터베이스",
    "React",
  ];

  const questions = [
    {
      day: 1,
      question: "데드락의 개념과 데드락이 일어날 조건에 대해서 설명하시요",
      completed: true,
      category: "OS",
    },
    {
      day: 2,
      question:
        "데이터베이스에서 클러스터링 인덱스가 무엇인지 설명하고, 어떤 장단점이 있는지 설...",
      completed: true,
      category: "데이터베이스",
    },
    {
      day: 3,
      question: "네트워크의 7계층에는 어떤 것이 있나요?",
      completed: true,
      category: "네트워크",
    },
    {
      day: 4,
      question: "TCP, UDP의 특징과 각각의 장단점이 무엇인지 설명하세요",
      completed: true,
      category: "네트워크",
    },
    {
      day: 5,
      question: "데드락의 개념과 데드락이 일어날 조건에 대해서 설명하시요",
      completed: false,
      category: "OS",
    },
    {
      day: 6,
      question: "데드락의 개념과 데드락이 일어날 조건에 대해서 설명하시요",
      completed: true,
      category: "OS",
    },
    {
      day: 7,
      question: "데드락의 개념과 데드락이 일어날 조건에 대해서 설명하시요",
      completed: false,
      category: "OS",
    },
    {
      day: 8,
      question: "데드락의 개념과 데드락이 일어날 조건에 대해서 설명하시요",
      completed: false,
      category: "OS",
    },
    {
      day: 9,
      question: "데드락의 개념과 데드락이 일어날 조건에 대해서 설명하시요",
      completed: true,
      category: "OS",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>1일 1질문</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.selectedCategoryTab,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
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
        {questions.map((item) => (
          <TouchableOpacity
            key={item.day}
            style={styles.questionItem}
            onPress={() => {
              router.push({
                pathname: "/chat",
                params: {
                  question: item.question,
                  category: item.category,
                },
              });
            }}
          >
            <View style={styles.questionContent}>
              <View style={styles.questionHeader}>
                <Text style={styles.dayText}>{item.day}일차</Text>
                <View style={styles.questionCategoryTag}>
                  <Text style={styles.questionCategoryText}>
                    {item.category}
                  </Text>
                </View>
              </View>
              <Text style={styles.questionText}>{item.question}</Text>
            </View>
            <View style={styles.statusIcon}>
              {item.completed ? (
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
  questionText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
  },
  statusIcon: {
    marginLeft: 12,
  },
});

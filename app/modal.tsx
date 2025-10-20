import React from "react";
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

export default function ModelAnswerModal() {
  const { question, answer, category } = useLocalSearchParams();

  // API에서 받은 실제 답안을 사용
  const getModelAnswer = (questionText: string, answerText: string) => {
    if (answerText && answerText.trim()) {
      // 실제 답안이 있는 경우
      return {
        title: questionText || "모범답안",
        answer: answerText,
        hasRealAnswer: true,
      };
    }

    // 기본 모범답안 (답안이 없는 경우)
    return {
      title: questionText || "모범답안",
      answer: "아직 모범답안이 준비되지 않았습니다.",
      hasRealAnswer: false,
    };
  };

  const modelAnswer = getModelAnswer(
    typeof question === "string" ? question : "",
    typeof answer === "string" ? answer : ""
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{modelAnswer.title}</Text>

        <View style={styles.answerContainer}>
          <View style={styles.answerHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.answerHeaderText}>모범답안</Text>
          </View>
          <Text style={styles.answerText}>{modelAnswer.answer}</Text>
        </View>

        {!modelAnswer.hasRealAnswer && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              더 자세한 답안이 준비되면 업데이트될 예정입니다.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 24,
    lineHeight: 24,
  },
  answerContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  answerHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
  },
  answerText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  tipContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    lineHeight: 16,
  },
});

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
  const { question, category } = useLocalSearchParams();

  // 모범답안 데이터 (실제로는 API에서 가져올 데이터)
  const getModelAnswer = (category: string, question: string) => {
    if (category === "Spring" && question.includes("의존성 주입")) {
      return {
        title: "Spring에서 의존성 주입(DI)가 무엇이고, 어떤 장점이 있을까요?",
        sections: [
          {
            title: "Spring 의존성 주입(DI)",
            points: [
              "객체가 필요한 의존성을 직접 생성하지 않고 외부에서 주입받는 방식",
              "Spring IoC 컨테이너가 객체의 생성과 관계를 관리",
            ],
          },
          {
            title: "장점",
            points: [
              "결합도 감소: 구현체 교체가 쉬워 유연한 구조",
              "테스트 용이: Mock 객체 주입으로 단위 테스트 편리",
              "유지보수성 향상: 변경 영향 최소화",
              "관심사 분리: 객체 생성 관리 → 컨테이너, 비즈니스 로직 → 개발자",
            ],
          },
        ],
        tip: "실무 팁, 예시(인터페이스 + 구현체 교체), 간단 코드가 있으면 가산점.",
      };
    }

    // 기본 모범답안
    return {
      title: typeof question === "string" ? question : "모범답안",
      sections: [
        {
          title: "핵심 개념",
          points: [
            "기본 개념과 정의를 명확히 설명",
            "관련 기술과의 차이점을 구체적으로 제시",
          ],
        },
        {
          title: "실무 적용",
          points: [
            "실제 프로젝트에서의 활용 사례",
            "주의사항과 베스트 프랙티스",
          ],
        },
      ],
      tip: "구체적인 예시와 코드를 포함하면 더 좋은 답변이 됩니다.",
    };
  };

  const modelAnswer = getModelAnswer(
    typeof category === "string" ? category : "Spring",
    typeof question === "string" ? question : ""
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

        {modelAnswer.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.points.map((point, pointIndex) => (
              <View key={pointIndex} style={styles.pointContainer}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>{modelAnswer.tip}</Text>
        </View>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
  },
  pointContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
    marginTop: 2,
  },
  pointText: {
    flex: 1,
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

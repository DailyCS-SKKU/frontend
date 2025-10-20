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
import { getAllSkills, Skill } from "../../lib/skill-api";
import { useNavigationWithLoading } from "../../hooks/use-navigation-with-loading";

// 스킬별 아이콘과 색상 매핑
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

export default function ProblemBankScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { navigateWithLoading } = useNavigationWithLoading();

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const skillsData = await getAllSkills();
      setSkills(skillsData);
    } catch (err) {
      console.error("스킬 목록 로드 실패:", err);
      setError("스킬 목록을 불러오는데 실패했습니다.");
      Alert.alert("오류", "스킬 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillPress = (skill: Skill) => {
    navigateWithLoading("/problem-list", {
      params: {
        skillId: skill.id.toString(),
        skillName: skill.name,
      },
      loadingMessage: "문제 목록을 불러오는 중...",
      refreshData: loadSkills,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>문제은행</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>스킬 목록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>문제은행</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSkills}>
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
        <Text style={styles.headerTitle}>문제은행</Text>
      </View>

      {/* Skills Grid */}
      <ScrollView
        style={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {skills.map((skill) => {
            const { icon, color } = getSkillIconAndColor(skill.name);
            return (
              <TouchableOpacity
                key={skill.id}
                style={styles.categoryCard}
                onPress={() => handleSkillPress(skill)}
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: color }]}
                >
                  <Ionicons name={icon as any} size={32} color="#FFF" />
                </View>
                <Text style={styles.categoryTitle}>{skill.name}</Text>
              </TouchableOpacity>
            );
          })}
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
});

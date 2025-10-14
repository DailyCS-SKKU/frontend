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

export default function ProfileScreen() {
  const interestedJobs = ["백엔드", "인프라", "서버"];
  const interestedSkills = ["Spring", "알고리즘"];

  const settingsItems = [
    { title: "계정 정보 변경", icon: "person-outline" },
    { title: "테마 관리", icon: "color-palette-outline" },
    { title: "로그아웃", icon: "log-out-outline" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>내 정보</Text>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>진건님</Text>
            <Text style={styles.welcomeMessage}>오늘도 열공하세요</Text>
          </View>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color="#9C27B0" />
          </View>
        </View>

        {/* Interested Job Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관심 직군</Text>
          <View style={styles.tagsContainer}>
            {interestedJobs.map((job, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{job}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Interested Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관심 스킬</Text>
          <View style={styles.tagsContainer}>
            {interestedSkills.map((skill, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{item.title}</Text>
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
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  welcomeMessage: {
    fontSize: 14,
    color: "#666",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#9C27B0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E5F5",
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: "#000",
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingsItemText: {
    fontSize: 16,
    color: "#000",
  },
});

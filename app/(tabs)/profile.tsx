import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";

export default function ProfileScreen() {
  console.log("ProfileScreen 컴포넌트 렌더링");
  const { logout } = useAuth();
  console.log("useAuth에서 받은 logout 함수:", typeof logout);
  const interestedJobs = ["백엔드", "인프라", "서버"];
  const interestedSkills = ["Spring", "알고리즘"];

  const handleLogout = () => {
    console.log("handleLogout 함수 호출됨");

    // 임시로 바로 로그아웃 실행
    console.log("바로 로그아웃 실행");
    logout();

    // Alert는 나중에 다시 활성화
    /*
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
        onPress: () => console.log("로그아웃 취소됨"),
      },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          console.log("프로필 페이지에서 로그아웃 버튼 클릭");
          await logout();
        },
      },
    ]);
    */
  };

  const settingsItems = [
    { title: "계정 정보 변경", icon: "person-outline", onPress: () => {} },
    { title: "테마 관리", icon: "color-palette-outline", onPress: () => {} },
    { title: "로그아웃", icon: "log-out-outline", onPress: handleLogout },
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
            <TouchableOpacity
              key={index}
              style={styles.settingsItem}
              onPress={() => {
                console.log(`설정 아이템 클릭: ${item.title}`);
                item.onPress();
              }}
            >
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

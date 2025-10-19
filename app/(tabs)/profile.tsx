import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import {
  getInterestedSkills,
  getAllSkills,
  addInterestedSkills,
  deleteInterestedSkills,
  Skill,
} from "@/lib/skill-api";
import {
  getInterestedJobs,
  getAllJobs,
  addInterestedJobs,
  deleteInterestedJobs,
  Job,
} from "@/lib/job-api";
import { getUserInfo, UserInfo } from "@/lib/auth";

export default function ProfileScreen() {
  const { logout } = useAuth();

  // 관심 직군 상태 관리
  const [interestedJobs, setInterestedJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // 관심 스킬 상태 관리
  const [interestedSkills, setInterestedSkills] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // 사용자 정보 상태 관리
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  // 모달 상태 관리
  const [isJobModalVisible, setIsJobModalVisible] = useState(false);
  const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoadingAllData, setIsLoadingAllData] = useState(false);

  // 사용자 정보 데이터 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoadingUserInfo(true);
        const user = await getUserInfo();
        console.log("사용자 정보 로드 성공:", user);
        setUserInfo(user);
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        setUserInfo(null);
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    loadUserInfo();
  }, []);

  // 관심 직군 데이터 로드
  useEffect(() => {
    const loadInterestedJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const jobs = await getInterestedJobs();
        console.log("관심 직군 로드 성공:", jobs);
        console.log("직군 타입:", typeof jobs);
        console.log("직군이 배열인가:", Array.isArray(jobs));

        // 안전하게 배열인지 확인 후 설정
        if (Array.isArray(jobs)) {
          setInterestedJobs(jobs);
        } else {
          console.warn("관심 직군 API 응답이 배열이 아닙니다:", jobs);
          setInterestedJobs([]);
        }
      } catch (error) {
        console.error("관심 직군 로드 실패:", error);
        setInterestedJobs([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    loadInterestedJobs();
  }, []);

  // 관심 스킬 데이터 로드
  useEffect(() => {
    const loadInterestedSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const skills = await getInterestedSkills();
        console.log("관심 스킬 로드 성공:", skills);
        console.log("스킬 타입:", typeof skills);
        console.log("스킬이 배열인가:", Array.isArray(skills));

        // 안전하게 배열인지 확인 후 설정
        if (Array.isArray(skills)) {
          setInterestedSkills(skills);
        } else {
          console.warn("관심 스킬 API 응답이 배열이 아닙니다:", skills);
          setInterestedSkills([]);
        }
      } catch (error) {
        console.error("관심 스킬 로드 실패:", error);
        setInterestedSkills([]);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadInterestedSkills();
  }, []);

  // 직군 모달 열기
  const openJobModal = async () => {
    setIsJobModalVisible(true);
    if (allJobs.length === 0) {
      await loadAllJobs();
    }
  };

  // 스킬 모달 열기
  const openSkillModal = async () => {
    setIsSkillModalVisible(true);
    if (allSkills.length === 0) {
      await loadAllSkills();
    }
  };

  // 모든 직군 로드
  const loadAllJobs = async () => {
    try {
      setIsLoadingAllData(true);
      const jobs = await getAllJobs();
      console.log("로드된 직군 데이터:", jobs);

      // 안전하게 배열인지 확인하고 필터링
      console.log("직군 데이터 타입:", typeof jobs);
      console.log("직군 데이터 Array.isArray:", Array.isArray(jobs));
      console.log("직군 데이터 constructor:", jobs?.constructor?.name);

      if (
        Array.isArray(jobs) ||
        (jobs && typeof jobs === "object" && jobs.length !== undefined)
      ) {
        const validJobs = Array.from(jobs).filter(
          (job) => job && job.id && job.name
        );
        console.log("유효한 직군 데이터:", validJobs);
        setAllJobs(validJobs);
      } else {
        console.warn("직군 데이터가 배열이 아닙니다:", jobs);
        setAllJobs([]);
      }
    } catch (error) {
      console.error("모든 직군 로드 실패:", error);
      Alert.alert("오류", "직군 목록을 불러올 수 없습니다.");
      setAllJobs([]);
    } finally {
      setIsLoadingAllData(false);
    }
  };

  // 모든 스킬 로드
  const loadAllSkills = async () => {
    try {
      setIsLoadingAllData(true);
      const skills = await getAllSkills();
      console.log("로드된 스킬 데이터:", skills);

      // 안전하게 배열인지 확인하고 필터링
      console.log("스킬 데이터 타입:", typeof skills);
      console.log("스킬 데이터 Array.isArray:", Array.isArray(skills));
      console.log("스킬 데이터 constructor:", skills?.constructor?.name);

      if (
        Array.isArray(skills) ||
        (skills && typeof skills === "object" && skills.length !== undefined)
      ) {
        const validSkills = Array.from(skills).filter(
          (skill) => skill && skill.id && skill.name
        );
        console.log("유효한 스킬 데이터:", validSkills);
        setAllSkills(validSkills);
      } else {
        console.warn("스킬 데이터가 배열이 아닙니다:", skills);
        setAllSkills([]);
      }
    } catch (error) {
      console.error("모든 스킬 로드 실패:", error);
      Alert.alert("오류", "스킬 목록을 불러올 수 없습니다.");
      setAllSkills([]);
    } finally {
      setIsLoadingAllData(false);
    }
  };

  // 관심 직군 추가
  const addJobToInterested = async (jobId: number) => {
    try {
      await addInterestedJobs([jobId]);
      // 관심 직군 목록 다시 로드
      const updatedJobs = await getInterestedJobs();
      setInterestedJobs(updatedJobs);
      Alert.alert("성공", "관심 직군이 추가되었습니다.");
    } catch (error) {
      console.error("관심 직군 추가 실패:", error);
      Alert.alert("오류", "관심 직군 추가에 실패했습니다.");
    }
  };

  // 관심 직군 삭제
  const removeJobFromInterested = async (jobId: number) => {
    try {
      await deleteInterestedJobs([jobId]);
      // 관심 직군 목록 다시 로드
      const updatedJobs = await getInterestedJobs();
      setInterestedJobs(updatedJobs);
      Alert.alert("성공", "관심 직군이 삭제되었습니다.");
    } catch (error) {
      console.error("관심 직군 삭제 실패:", error);
      Alert.alert("오류", "관심 직군 삭제에 실패했습니다.");
    }
  };

  // 관심 스킬 추가
  const addSkillToInterested = async (skillId: number) => {
    try {
      await addInterestedSkills([skillId]);
      // 관심 스킬 목록 다시 로드
      const updatedSkills = await getInterestedSkills();
      setInterestedSkills(updatedSkills);
      Alert.alert("성공", "관심 스킬이 추가되었습니다.");
    } catch (error) {
      console.error("관심 스킬 추가 실패:", error);
      Alert.alert("오류", "관심 스킬 추가에 실패했습니다.");
    }
  };

  // 관심 스킬 삭제
  const removeSkillFromInterested = async (skillId: number) => {
    try {
      await deleteInterestedSkills([skillId]);
      // 관심 스킬 목록 다시 로드
      const updatedSkills = await getInterestedSkills();
      setInterestedSkills(updatedSkills);
      Alert.alert("성공", "관심 스킬이 삭제되었습니다.");
    } catch (error) {
      console.error("관심 스킬 삭제 실패:", error);
      Alert.alert("오류", "관심 스킬 삭제에 실패했습니다.");
    }
  };

  // 직군이 이미 관심 직군인지 확인
  const isJobInterested = (jobId: number) => {
    return interestedJobs.some((job) => job.id === jobId);
  };

  // 스킬이 이미 관심 스킬인지 확인
  const isSkillInterested = (skillId: number) => {
    return interestedSkills.some((skill) => skill.id === skillId);
  };

  const handleLogout = () => {
    // 임시로 바로 로그아웃 실행
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
            <Text style={styles.userName}>
              {isLoadingUserInfo
                ? "로딩 중..."
                : userInfo?.name || userInfo?.nickname || "사용자"}
            </Text>
            <Text style={styles.welcomeMessage}>오늘도 열공하세요</Text>
          </View>
          <View style={styles.profileAvatar}>
            {userInfo?.imageUrl ? (
              <Image
                source={{ uri: userInfo.imageUrl }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={32} color="#9C27B0" />
            )}
          </View>
        </View>

        {/* Interested Job Fields */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>관심 직군</Text>
            <TouchableOpacity style={styles.addButton} onPress={openJobModal}>
              <Ionicons name="add" size={20} color="#9C27B0" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {isLoadingJobs ? (
              <Text style={styles.emptyMessage}>로딩 중...</Text>
            ) : Array.isArray(interestedJobs) && interestedJobs.length > 0 ? (
              interestedJobs.map((job, index) => (
                <View key={job.id || index} style={styles.tag}>
                  <Text style={styles.tagText}>{job.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyMessage}>관심 직군이 없습니다</Text>
            )}
          </View>
        </View>

        {/* Interested Skills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>관심 스킬</Text>
            <TouchableOpacity style={styles.addButton} onPress={openSkillModal}>
              <Ionicons name="add" size={20} color="#9C27B0" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {isLoadingSkills ? (
              <Text style={styles.emptyMessage}>로딩 중...</Text>
            ) : Array.isArray(interestedSkills) &&
              interestedSkills.length > 0 ? (
              interestedSkills.map((skill, index) => (
                <View key={skill.id || index} style={styles.tag}>
                  <Text style={styles.tagText}>{skill.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyMessage}>관심 스킬이 없습니다</Text>
            )}
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

      {/* 직군 선택 모달 */}
      <Modal
        visible={isJobModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>직군 선택</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsJobModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {isLoadingAllData ? (
            <View style={styles.loadingContainer}>
              <Text>로딩 중...</Text>
            </View>
          ) : (
            <FlatList
              data={allJobs || []}
              keyExtractor={(item, index) => {
                if (!item || item.id === undefined || item.id === null) {
                  return `job-${index}`;
                }
                return `job-${item.id}`;
              }}
              renderItem={({ item }) => {
                if (!item || !item.id) return null;

                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isJobInterested(item.id) && styles.selectedItem,
                    ]}
                    onPress={() => {
                      if (isJobInterested(item.id)) {
                        removeJobFromInterested(item.id);
                      } else {
                        addJobToInterested(item.id);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isJobInterested(item.id) && styles.selectedItemText,
                      ]}
                    >
                      {item.name || "Unknown"}
                    </Text>
                    {isJobInterested(item.id) && (
                      <Ionicons name="checkmark" size={20} color="#9C27B0" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* 스킬 선택 모달 */}
      <Modal
        visible={isSkillModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>스킬 선택</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsSkillModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {isLoadingAllData ? (
            <View style={styles.loadingContainer}>
              <Text>로딩 중...</Text>
            </View>
          ) : (
            <FlatList
              data={allSkills || []}
              keyExtractor={(item, index) => {
                if (!item || item.id === undefined || item.id === null) {
                  return `skill-${index}`;
                }
                return `skill-${item.id}`;
              }}
              renderItem={({ item }) => {
                if (!item || !item.id) return null;

                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isSkillInterested(item.id) && styles.selectedItem,
                    ]}
                    onPress={() => {
                      if (isSkillInterested(item.id)) {
                        removeSkillFromInterested(item.id);
                      } else {
                        addSkillToInterested(item.id);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSkillInterested(item.id) && styles.selectedItemText,
                      ]}
                    >
                      {item.name || "Unknown"}
                    </Text>
                    {isSkillInterested(item.id) && (
                      <Ionicons name="checkmark" size={20} color="#9C27B0" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
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
    overflow: "hidden",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  emptyMessage: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3E5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedItem: {
    backgroundColor: "#F3E5F5",
  },
  modalItemText: {
    fontSize: 16,
    color: "#000",
  },
  selectedItemText: {
    color: "#9C27B0",
    fontWeight: "600",
  },
});

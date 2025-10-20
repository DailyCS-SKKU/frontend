import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  questionApi,
  ChatInfo,
  ChatMessage,
  ChatQuestion,
  SendAnswerRequest,
  SendAnswerResponse,
} from "../lib/question-api";
import { useNavigationWithLoading } from "../hooks/use-navigation-with-loading";

// 마크다운 렌더링 컴포넌트
const MarkdownText = ({ content, style }: { content: string; style: any }) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactElement[] = [];
    let key = 0;

    lines.forEach((line, lineIndex) => {
      if (line.trim() === "") {
        elements.push(
          <Text key={key++} style={style}>
            {"\n"}
          </Text>
        );
        return;
      }

      // 헤더 처리 (## 헤더)
      if (line.startsWith("## ")) {
        elements.push(
          <Text
            key={key++}
            style={[
              style,
              {
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 8,
                marginBottom: 4,
              },
            ]}
          >
            {line.substring(3)}
          </Text>
        );
        return;
      }

      // 리스트 아이템 처리 (1. 또는 -)
      if (line.match(/^\d+\.\s/) || line.startsWith("- ")) {
        elements.push(
          <Text
            key={key++}
            style={[style, { marginLeft: 16, marginBottom: 2 }]}
          >
            {line}
          </Text>
        );
        return;
      }

      // 일반 텍스트 처리
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const lineElements = parts.map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text
              key={`${lineIndex}-${partIndex}`}
              style={[style, { fontWeight: "bold" }]}
            >
              {part.slice(2, -2)}
            </Text>
          );
        }
        return (
          <Text key={`${lineIndex}-${partIndex}`} style={style}>
            {part}
          </Text>
        );
      });

      elements.push(
        <Text key={key++} style={[style, { marginBottom: 2 }]}>
          {lineElements}
        </Text>
      );
    });

    return elements;
  };

  return <View>{parseMarkdown(content)}</View>;
};

export default function ChatScreen() {
  const { questionId, question, category } = useLocalSearchParams();
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const dotAnimation = useRef(new Animated.Value(0)).current;
  const { backWithLoading } = useNavigationWithLoading();

  // 채팅방 정보 로드
  useEffect(() => {
    if (questionId) {
      loadChatInfo();
    }
  }, [questionId]);

  const loadChatInfo = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const questionIdNum = parseInt(questionId as string, 10);
      const chatData: ChatInfo = await questionApi.getChatInfo(questionIdNum);

      console.log("받은 채팅방 데이터:", JSON.stringify(chatData, null, 2));
      console.log("chatData.question:", chatData?.question);
      console.log("chatData.messages:", chatData?.messages);
      setChatInfo(chatData);

      // 채팅방 로드 후 스크롤을 맨 아래로 이동
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 200);
    } catch (err) {
      console.error("채팅방 정보 로드 실패:", err);
      if (showLoading) {
        setError("채팅방 정보를 불러오는데 실패했습니다.");
        Alert.alert("오류", "채팅방 정보를 불러오는데 실패했습니다.");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() && !sendingMessage && chatInfo?.question?.questionId) {
      await handleDailyQuestionMessage();
    }
  };

  // 1일1질문 메시지 전송
  const handleDailyQuestionMessage = async () => {
    if (!chatInfo?.question?.questionId) return;

    try {
      setSendingMessage(true);

      // 사용자 메시지를 즉시 UI에 추가
      const userMessage: ChatMessage = {
        messageId: Date.now(),
        turnNumber: 0,
        role: "USER",
        content: inputText.trim(),
        status: "CORRECT", // 임시 상태
        createdAt: new Date().toISOString(),
      };

      // 현재 메시지 목록에 사용자 메시지 추가
      setChatInfo((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, userMessage],
            }
          : null
      );

      const currentInput = inputText.trim();
      setInputText(""); // 입력창 비우기

      // 사용자 메시지 추가 후 스크롤 이동
      scrollToBottom();

      // AI 로딩 메시지 추가
      const loadingMessage: ChatMessage = {
        messageId: Date.now() + 0.5,
        turnNumber: 1,
        role: "ASSISTANT",
        content: "AI가 답변을 생성하고 있습니다...",
        status: "ASSISTANT",
        createdAt: new Date().toISOString(),
      };

      setChatInfo((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, loadingMessage],
            }
          : null
      );

      // 로딩 메시지 추가 후 스크롤 이동
      scrollToBottom();

      // 로딩 애니메이션 시작
      startLoadingAnimation();

      // API 호출
      const request: SendAnswerRequest = {
        questionId: chatInfo.question.questionId,
        userAnswer: currentInput,
      };

      console.log("답변 전송 요청:", request);
      const response: SendAnswerResponse = await questionApi.sendAnswer(
        request
      );
      console.log("답변 전송 응답:", response);

      // 로딩 애니메이션 중지
      stopLoadingAnimation();

      // 답변 전송 후 채팅방 정보를 다시 가져와서 최신 메시지들 렌더링 (로딩 표시 없이)
      await loadChatInfo(false);
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      Alert.alert("오류", "메시지 전송에 실패했습니다. 다시 시도해주세요.");

      // 로딩 애니메이션 중지
      stopLoadingAnimation();

      // 실패 시 입력창에 다시 입력
      setInputText(inputText.trim());
    } finally {
      setSendingMessage(false);
    }
  };

  // 시간 포맷팅 함수
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 로딩 애니메이션 시작
  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // 로딩 애니메이션 중지
  const stopLoadingAnimation = () => {
    dotAnimation.stopAnimation();
    dotAnimation.setValue(0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>1일 1질문</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>채팅방을 준비하는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !chatInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              backWithLoading({
                loadingMessage: "이전 페이지로 이동 중...",
                refreshData: loadChatInfo,
              })
            }
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>1일 1질문</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>
            {error || "채팅방 정보를 불러올 수 없습니다."}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadChatInfo()}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              backWithLoading({
                loadingMessage: "이전 페이지로 이동 중...",
                refreshData: loadChatInfo,
              })
            }
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {chatInfo?.question?.skillName || "문제"} 상세
            </Text>
          </View>
          <TouchableOpacity
            style={styles.answerButton}
            onPress={() => {
              router.push({
                pathname: "/modal",
                params: {
                  question: chatInfo?.question?.question || "",
                  answer: chatInfo?.question?.answer || "",
                  category: chatInfo?.question?.skillName || "",
                },
              });
            }}
          >
            <Text style={styles.answerButtonText}>모범답안</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {/* 채팅 메시지들만 렌더링 */}
          {chatInfo?.messages?.map((message) => {
            // 로딩 메시지인지 확인
            const isLoadingMessage =
              message.content === "AI가 답변을 생성하고 있습니다...";

            return (
              <View key={message.messageId}>
                <View
                  style={[
                    styles.messageContainer,
                    message.role === "USER"
                      ? styles.userMessageContainer
                      : styles.aiMessageContainer,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.role === "USER"
                        ? styles.userMessageBubble
                        : styles.aiMessageBubble,
                    ]}
                  >
                    {isLoadingMessage ? (
                      <View style={styles.loadingMessageContainer}>
                        <Text
                          style={[styles.messageText, styles.aiMessageText]}
                        >
                          AI가 답변을 생성하고 있습니다
                        </Text>
                        <View style={styles.loadingDots}>
                          <Animated.View
                            style={[
                              styles.loadingDot,
                              {
                                opacity: dotAnimation.interpolate({
                                  inputRange: [0, 0.5, 1],
                                  outputRange: [0.3, 1, 0.3],
                                }),
                              },
                            ]}
                          />
                          <Animated.View
                            style={[
                              styles.loadingDot,
                              {
                                opacity: dotAnimation.interpolate({
                                  inputRange: [0, 0.5, 1],
                                  outputRange: [1, 0.3, 1],
                                }),
                              },
                            ]}
                          />
                          <Animated.View
                            style={[
                              styles.loadingDot,
                              {
                                opacity: dotAnimation.interpolate({
                                  inputRange: [0, 0.5, 1],
                                  outputRange: [0.3, 1, 0.3],
                                }),
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ) : message.role === "ASSISTANT" ? (
                      <MarkdownText
                        content={message.content}
                        style={[styles.messageText, styles.aiMessageText]}
                      />
                    ) : (
                      <Text
                        style={[styles.messageText, styles.userMessageText]}
                      >
                        {message.content}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.timestamp}>
                    {formatTime(message.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="답변을 입력해주세요"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!sendingMessage}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[
              styles.sendButton,
              (sendingMessage || !inputText.trim()) &&
                styles.sendButtonDisabled,
            ]}
            disabled={sendingMessage || !inputText.trim()}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardAvoidingView: {
    flex: 1,
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
  answerButton: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  answerButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  aiMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: "#9C27B0",
  },
  aiMessageBubble: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFF",
  },
  aiMessageText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#9C27B0",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#CCC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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
  loadingMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    marginLeft: 8,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#666",
    marginHorizontal: 2,
  },
});

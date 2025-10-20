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
import {
  questionBankApi,
  QuestionBankSendAnswerRequest,
  QuestionBankSendAnswerResponse,
} from "../lib/question-bank-api";
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
  const { questionId, question, category, skillName } = useLocalSearchParams();
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const dotAnimation = useRef(new Animated.Value(0)).current;
  const { backWithLoading } = useNavigationWithLoading();

  // 문제은행과 1일1질문 구분 (skillName이 있으면 문제은행)
  const isQuestionBank = !!skillName;

  // 문제은행용 로컬 상태
  const [questionBankMessages, setQuestionBankMessages] = useState<
    Array<{
      id: string;
      role: "USER" | "ASSISTANT";
      content: string;
      timestamp: string;
    }>
  >([]);
  const [aiSummary, setAiSummary] = useState<string>("");

  // 채팅방 정보 로드
  useEffect(() => {
    if (questionId) {
      if (isQuestionBank) {
        // 문제은행: 초기 질문을 메시지로 설정
        initializeQuestionBank();
      } else {
        // 1일1질문: 기존 로직 사용
        loadChatInfo();
      }
    }
  }, [questionId, isQuestionBank]);

  // 문제은행 초기화 함수
  const initializeQuestionBank = () => {
    setLoading(true);
    setError(null);

    // 초기 질문을 상대방 메시지로 설정
    const initialQuestion = {
      id: "initial-question",
      role: "ASSISTANT" as const,
      content: question as string,
      timestamp: new Date().toISOString(),
    };

    setQuestionBankMessages([initialQuestion]);
    setLoading(false);
  };

  const loadChatInfo = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const questionIdNum = parseInt(questionId as string, 10);
      console.log("채팅방 정보 로드 시작, questionId:", questionIdNum);
      const chatData = await questionApi.getChatInfo(questionIdNum);
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
    if (inputText.trim() && !sendingMessage) {
      if (isQuestionBank) {
        // 문제은행 로직
        await handleQuestionBankMessage();
      } else if (chatInfo?.question?.questionId) {
        // 1일1질문 로직 (기존)
        await handleDailyQuestionMessage();
      }
    }
  };

  // 문제은행 메시지 전송
  const handleQuestionBankMessage = async () => {
    try {
      setSendingMessage(true);

      const currentInput = inputText.trim();
      setInputText(""); // 입력창 비우기

      // 사용자 메시지를 즉시 UI에 추가
      const userMessage = {
        id: `user-${Date.now()}`,
        role: "USER" as const,
        content: currentInput,
        timestamp: new Date().toISOString(),
      };

      setQuestionBankMessages((prev) => [...prev, userMessage]);
      scrollToBottom();

      // AI 로딩 메시지 추가
      const loadingMessage = {
        id: `loading-${Date.now()}`,
        role: "ASSISTANT" as const,
        content: "AI가 답변을 생성하고 있습니다...",
        timestamp: new Date().toISOString(),
      };

      setQuestionBankMessages((prev) => [...prev, loadingMessage]);
      scrollToBottom();

      // API 호출
      const request: QuestionBankSendAnswerRequest = {
        questionId: parseInt(questionId as string),
        userAnswer: currentInput,
        aiSummary: aiSummary, // 이전 답변의 summary 사용
      };

      console.log("문제은행 답변 전송 요청:", request);
      const response: QuestionBankSendAnswerResponse =
        await questionBankApi.sendAnswer(request);
      console.log("문제은행 답변 전송 응답:", response);

      // 응답에서 feedback 필드 추출
      let feedbackContent = "";
      let summaryContent = "";

      console.log("chat.tsx에서 받은 응답:", response);
      console.log("응답 타입:", typeof response);

      if (typeof response === "string") {
        // 문자열인 경우 JSON 파싱 시도
        try {
          const parsedResponse = JSON.parse(response);
          feedbackContent = parsedResponse.feedback || "";
          summaryContent = parsedResponse.summary || "";
        } catch (parseError) {
          console.error("chat.tsx에서 JSON 파싱 실패:", parseError);
          feedbackContent = response;
        }
      } else if (typeof response === "object" && response !== null) {
        // 토큰으로 분리된 객체인지 확인 (숫자 키가 있는지)
        const hasNumericKeys = Object.keys(response).some((key) =>
          /^\d+$/.test(key)
        );

        if (hasNumericKeys) {
          // 토큰들을 조합해서 문자열 만들기
          const combinedString = Object.values(response).join("");
          console.log("토큰 조합된 문자열:", combinedString);

          try {
            // JSON 부분만 추출 (첫 번째 '{'부터 마지막 '}'까지)
            const jsonStart = combinedString.indexOf("{");
            const jsonEnd = combinedString.lastIndexOf("}") + 1;

            if (jsonStart !== -1 && jsonEnd > jsonStart) {
              const jsonString = combinedString.substring(jsonStart, jsonEnd);
              console.log("추출된 JSON 문자열:", jsonString);

              const parsedResponse = JSON.parse(jsonString);
              feedbackContent = parsedResponse.feedback || "";
              summaryContent = parsedResponse.summary || "";
            } else {
              console.error("JSON 부분을 찾을 수 없음");
              feedbackContent = combinedString;
            }
          } catch (parseError) {
            console.error("토큰 조합 후 JSON 파싱 실패:", parseError);
            feedbackContent = combinedString;
          }
        } else {
          // 일반 객체인 경우 직접 사용
          feedbackContent = response.feedback || "";
          summaryContent = response.summary || "";
        }
      }

      // 로딩 메시지 제거하고 실제 응답으로 교체
      setQuestionBankMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessage.id);
        const aiResponse = {
          id: `ai-${Date.now()}`,
          role: "ASSISTANT" as const,
          content: feedbackContent,
          timestamp: new Date().toISOString(),
        };
        return [...filtered, aiResponse];
      });

      // summary 저장 (다음 답변에 사용)
      setAiSummary(summaryContent);

      scrollToBottom();
    } catch (err) {
      console.error("문제은행 메시지 전송 실패:", err);
      Alert.alert("오류", "메시지 전송에 실패했습니다.");

      // 로딩 메시지 제거
      setQuestionBankMessages((prev) =>
        prev.filter(
          (msg) => !msg.content.includes("AI가 답변을 생성하고 있습니다")
        )
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // 1일1질문 메시지 전송 (기존 로직)
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
        userAnswer: inputText.trim(),
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
            <Text style={styles.headerTitle}>채팅방</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>채팅방 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || (!chatInfo && !isQuestionBank)) {
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
            <Text style={styles.headerTitle}>채팅방</Text>
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
              {isQuestionBank
                ? skillName || "문제은행"
                : chatInfo?.question?.skillName || "문제"}{" "}
              상세
            </Text>
          </View>
          {!isQuestionBank && (
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
          )}
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {isQuestionBank ? (
            // 문제은행 메시지 렌더링
            questionBankMessages.map((message) => {
              const isLoadingMessage =
                message.content === "AI가 답변을 생성하고 있습니다...";

              return (
                <View
                  key={message.id}
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
                          {message.content}
                        </Text>
                        <View style={styles.loadingDots}>
                          <Animated.View
                            style={[
                              styles.loadingDot,
                              { opacity: dotAnimation },
                            ]}
                          />
                          <Animated.View
                            style={[
                              styles.loadingDot,
                              { opacity: dotAnimation },
                            ]}
                          />
                          <Animated.View
                            style={[
                              styles.loadingDot,
                              { opacity: dotAnimation },
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
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              );
            })
          ) : (
            // 1일1질문 메시지 렌더링 (기존 로직)
            <>
              {/* 질문 메시지 (상대방 메시지로 표시) */}
              {chatInfo?.question?.question && (
                <View
                  style={[styles.messageContainer, styles.aiMessageContainer]}
                >
                  <View style={[styles.messageBubble, styles.aiMessageBubble]}>
                    <Text style={[styles.messageText, styles.aiMessageText]}>
                      {chatInfo.question.question}
                    </Text>
                  </View>
                </View>
              )}

              {/* 실제 채팅 메시지들 */}
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
            </>
          )}
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

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { loginWithGoogle } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

WebBrowser.maybeCompleteAuthSession();

// Google OAuth 2.0 endpoints
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export default function LoginScreen() {
  const { login } = useAuth();

  // Expo Go용 redirectUri (auth.expo.dev 프록시)
  const redirectUri = React.useMemo(
    () => AuthSession.makeRedirectUri({ useProxy: true }),
    []
  );

  // ⬇️ Authorization Code Flow (code만 받음)
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID!, // 웹 클라이언트 ID
      responseType: AuthSession.ResponseType.Code, // 인가코드 받기
      usePKCE: false, // 서버에서 client_secret으로 교환 시 false 권장
      redirectUri: redirectUri ?? "http://localhost:8082",
      scopes: ["openid", "email", "profile"],
      // refresh token 원하면:
      // extraParams: { access_type: "offline", prompt: "consent" },
    },
    discovery
  );

  //   React.useEffect(() => {
  //     (async () => {
  //       if (!request) return;
  //       const url = await request.makeAuthUrlAsync(discovery); // 실제 auth URL(쿼리에 redirect_uri 포함)
  //       console.log("auth url >>>", url);
  //     })();
  //   }, [request]);

  React.useEffect(() => {
    if (!response) return;
    console.log("👉 OAuth response:", response);

    if (response.type === "success") {
      const code = (
        response as AuthSession.AuthSessionResult & {
          params: { code?: string };
        }
      ).params?.code;
      console.log("✅ authorization code:", code);
      console.log("↩️ redirectUri used:", redirectUri);

      // API 호출
      if (code) {
        handleApiLogin(code);
      }
    }
  }, [response, redirectUri]);

  const handleApiLogin = async (code: string) => {
    try {
      const response = await loginWithGoogle(code);

      // 로그인 성공 시 홈으로 리다이렉트
      login();
    } catch (error) {
      console.error("❌ API 호출 실패:", error);
    }
  };

  const handleGoogleLogin = async () => {
    await promptAsync(); // useProxy는 redirectUri에서 이미 처리됨
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* DailyCS 타이틀 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>DailyCS</Text>
          <Text style={styles.subtitle}>
            개발자의 면접 준비를 쉽고 똑똑하게
          </Text>
        </View>

        {/* 로그인 버튼 영역 */}
        <View style={styles.loginSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
            disabled={!request}
          >
            <View style={styles.googleButtonContent}>
              {/* 구글 아이콘 */}
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Google로 계속하기</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 하단 텍스트 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로
            간주됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  loginSection: {
    marginBottom: 60,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285f4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  googleIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  googleButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("로딩 중...");
  const [fadeAnim] = useState(new Animated.Value(0));

  const showLoading = (message: string = "로딩 중...") => {
    setLoadingMessage(message);
    setIsLoading(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideLoading = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsLoading(false);
    });
  };

  return (
    <LoadingContext.Provider
      value={{ isLoading, loadingMessage, showLoading, hideLoading }}
    >
      {children}
      {isLoading && (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9C27B0" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        </Animated.View>
      )}
    </LoadingContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

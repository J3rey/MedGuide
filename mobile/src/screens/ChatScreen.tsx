import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import theme from "../styles/theme";
import { medicationApi } from "../services/api";

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function ChatScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: t("chat.greeting"),
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async (): Promise<void> => {
    if (inputMessage.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now(),
        text: inputMessage,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages([...messages, userMessage]);
      const messageText = inputMessage;
      setInputMessage("");

      try {
        const response = await medicationApi.sendChatMessage(messageText);
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          text: response.message,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          text: t("chat.defaultResponse"),
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    }
  };

  const containerPadding = screenWidth > 768 ? 48 : 24;
  const maxContentWidth = screenWidth > 768 ? 800 : screenWidth;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: containerPadding,
            paddingTop: Math.max(insets.top, 16) + 80,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>💬</Text>
          <View>
            <Text style={styles.headerTitle}>{t("chat.title")}</Text>
            <Text style={styles.headerSubtitle}>{t("chat.subtitle")}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          {
            paddingHorizontal: containerPadding,
            maxWidth: maxContentWidth,
            alignSelf: "center",
            width: "100%",
          },
        ]}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === "user"
                ? styles.userMessageWrapper
                : styles.botMessageWrapper,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === "user"
                  ? styles.userMessage
                  : styles.botMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === "user"
                    ? styles.userMessageText
                    : styles.botMessageText,
                ]}
              >
                {message.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          {
            paddingHorizontal: containerPadding,
            maxWidth: maxContentWidth,
            alignSelf: "center",
            width: "100%",
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder={t("chat.placeholder")}
          placeholderTextColor={theme.darkColors.mutedForeground}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={styles.sendButton}
          disabled={!inputMessage.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.darkColors.background,
  },
  header: {
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.darkColors.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  headerIcon: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.darkColors.mutedForeground,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.base,
  },
  messageWrapper: {
    width: "100%",
  },
  userMessageWrapper: {
    alignItems: "flex-end",
  },
  botMessageWrapper: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  userMessage: {
    backgroundColor: "#3b82f6",
  },
  botMessage: {
    backgroundColor: theme.darkColors.card,
  },
  messageText: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#ffffff",
  },
  botMessageText: {
    color: theme.darkColors.foreground,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.darkColors.border,
    backgroundColor: theme.darkColors.background,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.darkColors.card,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.darkColors.foreground,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
});

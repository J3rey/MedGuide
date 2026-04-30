import { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import theme from '../styles/theme';
import { medicationApi } from '../services/api';

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatScreenProps {
  initialDrugName?: string;
}

export default function ChatScreen({ initialDrugName }: ChatScreenProps = {}) {
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: t('chat.greeting'),
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (initialDrugName && !hasInitialized) {
      setHasInitialized(true);
      const query = `${t('chat.tellMeAbout')} ${initialDrugName}`;
      sendMessage(query);
    }
  }, [initialDrugName, hasInitialized, t]);

  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || inputMessage;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customMessage) {
      setInputMessage('');
    }

    try {
      const response = await medicationApi.sendChatMessage(messageText);

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: unknown) {
      let errorText = t('chat.defaultResponse');

      if (error instanceof AxiosError) {
        console.error('Chat error:', error.response?.data || error.message);

        if (
          error.response?.status === 429 ||
          error.response?.data?.error === 'quota_exceeded'
        ) {
          errorText =
            error.response?.data?.response ||
            "I'm currently experiencing high demand. Please try again later.";
        } else if (error.message) {
          errorText = `Error: ${error.message}. Please check your connection.`;
        }
      } else if (error instanceof Error) {
        console.error('Chat error:', error.message);
        errorText = `Error: ${error.message}. Please check your connection.`;
      } else {
        console.error('Unknown error:', error);
      }

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const containerPadding = screenWidth > 768 ? 48 : 24;
  const maxContentWidth = screenWidth > 768 ? 800 : screenWidth;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: containerPadding,
            paddingTop: Math.max(insets.top, theme.spacing.base),
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{t('chat.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('chat.subtitle')}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          styles.responsiveContent,
          {
            paddingHorizontal: containerPadding,
            maxWidth: maxContentWidth,
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
              message.sender === 'user'
                ? styles.userMessageWrapper
                : styles.botMessageWrapper,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user'
                  ? styles.userMessage
                  : styles.botMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user'
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
          styles.responsiveContent,
          {
            paddingHorizontal: containerPadding,
            maxWidth: maxContentWidth,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder={t('chat.placeholder')}
          placeholderTextColor={theme.colors.mutedForeground}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          onPress={() => sendMessage()}
          style={[
            styles.sendButton,
            !inputMessage.trim() && styles.sendButtonDisabled,
          ]}
          disabled={!inputMessage.trim()}
        >
          <Text style={styles.sendText}>{t('chat.send')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.base,
  },
  responsiveContent: {
    alignSelf: 'center',
    width: '100%',
  },
  messageWrapper: {
    width: '100%',
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  botMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: theme.radius.chatBubble,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
  },
  userMessage: {
    backgroundColor: theme.colors.primary,
  },
  botMessage: {
    backgroundColor: theme.colors.botBubble,
    borderWidth: 1,
    borderColor: theme.colors.botBubbleBorder,
  },
  messageText: {
    fontSize: theme.typography.fontSize.base,
    lineHeight:
      theme.typography.lineHeight.normal * theme.typography.fontSize.base,
  },
  userMessageText: {
    color: theme.colors.primaryForeground,
  },
  botMessageText: {
    color: theme.colors.foreground,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.interactive,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.muted,
    opacity: 0.5,
    ...theme.shadows.none,
  },
  sendText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

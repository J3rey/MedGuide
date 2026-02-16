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
            paddingTop: Math.max(insets.top, 16),
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
          placeholderTextColor={theme.darkColors.mutedForeground}
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
          <Text style={styles.sendText}>Send</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
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
    maxWidth: '80%',
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  userMessage: {
    backgroundColor: '#3b82f6',
  },
  botMessage: {
    backgroundColor: theme.darkColors.card,
  },
  messageText: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: theme.darkColors.foreground,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#6b7280',
    opacity: 0.5,
  },
  sendText: {
    color: '#ffffff',
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
});

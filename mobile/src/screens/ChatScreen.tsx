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
  const [activeDrugName, setActiveDrugName] = useState<string | null>(
    initialDrugName || null
  );
  const lastInitialDrugNameRef = useRef<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async (
    customMessage?: string,
    medicationContextOverride?: string | null
  ) => {
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
      const medicationContext = medicationContextOverride ?? activeDrugName;
      const response = await medicationApi.sendChatMessage(
        messageText,
        undefined,
        medicationContext ? [medicationContext] : undefined
      );

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

  useEffect(() => {
    if (initialDrugName && initialDrugName !== lastInitialDrugNameRef.current) {
      lastInitialDrugNameRef.current = initialDrugName;
      setActiveDrugName(initialDrugName);
      const query = `${t('chat.tellMeAbout')} ${initialDrugName}`;
      sendMessage(query, initialDrugName);
    }
  }, [initialDrugName, t]);

  const containerPadding = screenWidth > 768 ? 48 : 24;
  const maxContentWidth = screenWidth > 768 ? 800 : screenWidth;

  // Send arrow icon
  const SendIcon = () => (
    <View style={styles.sendIcon}>
      <View style={styles.sendArrowLine} />
      <View style={styles.sendArrowHead} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: containerPadding,
            paddingTop:
              Math.max(insets.top, theme.spacing.base) + theme.spacing.sm,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerDot} />
          <View>
            <Text style={styles.headerTitle}>{t('chat.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('chat.subtitle')}</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
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
        showsVerticalScrollIndicator={false}
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
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
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
        <View style={styles.inputRow}>
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
            <SendIcon />
          </TouchableOpacity>
        </View>
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
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: theme.radius['2xl'],
    borderBottomRightRadius: theme.radius['2xl'],
    ...theme.shadows.card,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
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
    paddingVertical: theme.spacing.lg,
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
    maxWidth: '78%',
    borderRadius: theme.radius.chatBubble,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
  },
  userMessage: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.spacing.xs,
    ...theme.shadows.interactive,
  },
  botMessage: {
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: theme.spacing.xs,
    ...theme.shadows.card,
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
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  inputContainer: {
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius['2xl'],
    borderTopRightRadius: theme.radius['2xl'],
    ...theme.shadows.elevated,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.interactive,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.muted,
    ...theme.shadows.none,
  },
  sendIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendArrowLine: {
    width: 12,
    height: 2,
    backgroundColor: theme.colors.primaryForeground,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  sendArrowHead: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 0,
    height: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.primaryForeground,
    transform: [{ rotate: '-45deg' }],
  },
});

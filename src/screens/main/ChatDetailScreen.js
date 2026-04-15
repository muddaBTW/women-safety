import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Linking,
  Animated,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { Send, ShieldAlert, MapPin, ExternalLink, Zap, Heart, Navigation, Phone, AlertTriangle } from 'lucide-react-native';

const QUICK_ALERTS = [
  { text: "I'm Safe", icon: Heart },
  { text: "Heading Home", icon: Navigation },
  { text: "Call me ASAP", icon: Phone },
  { text: "Need Help", icon: AlertTriangle },
];

const ChatDetailScreen = ({ route }) => {
  const { contactId } = route.params;
  const { messagesMap, addMessage, clearUnread } = useApp();
  const [inputText, setInputText] = useState('');
  const [sendScale] = useState(new Animated.Value(1));

  const messages = messagesMap[contactId] || [];

  // Clear unread when opening chat
  useEffect(() => {
    clearUnread(contactId);
  }, [contactId, messages.length]);

  const handleSend = () => {
    if (inputText.trim()) {
      // Button animation
      Animated.sequence([
        Animated.timing(sendScale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
        Animated.timing(sendScale, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();

      addMessage(contactId, inputText.trim(), 'user');
      setInputText('');
    }
  };

  const sendQuickAlert = (text) => {
    addMessage(contactId, text, 'user');
  };

  const openMap = (location) => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.type === 'user';
    const isEmergency = item.type === 'emergency';
    const isSystem = item.type === 'system';
    const isReceived = item.type === 'received';
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // System message
    if (isSystem) {
      return (
        <View style={styles.systemMsgWrapper}>
          <View style={styles.systemBubble}>
            <Text style={styles.systemText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    // Emergency SOS message with map
    if (isEmergency) {
      return (
        <View style={styles.sosMsgWrapper}>
          <View style={styles.sosBubble}>
            {/* SOS Header */}
            <View style={styles.sosHeader}>
              <View style={styles.sosIconWrap}>
                <ShieldAlert color={COLORS.white} size={16} />
              </View>
              <Text style={styles.sosTitle}>SOS Alert</Text>
            </View>

            {/* Map Preview */}
            {item.location && (
              <TouchableOpacity
                style={styles.mapContainer}
                onPress={() => openMap(item.location)}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: item.staticMapUrl,
                  }}
                  style={styles.mapImage}
                  defaultSource={undefined}
                />
                {/* Map overlay with coordinates */}
                <View style={styles.mapOverlay}>
                  <View style={styles.mapPinRow}>
                    <MapPin color={COLORS.primary} size={14} />
                    <Text style={styles.mapCoords}>
                      {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
                    </Text>
                  </View>
                  <View style={styles.mapOpenBtn}>
                    <ExternalLink color={COLORS.white} size={12} />
                    <Text style={styles.mapOpenText}>Open Maps</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* SOS Message Text */}
            <Text style={styles.sosText}>{item.text}</Text>
            <Text style={styles.sosTime}>{time}</Text>
          </View>
        </View>
      );
    }

    // Normal message bubble (user or received)
    return (
      <View style={[
        styles.msgWrapper,
        isUser ? styles.userMsgWrapper : styles.receivedMsgWrapper,
      ]}>
        <View style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.receivedBubble,
        ]}>
          <Text style={[
            styles.msgText,
            isUser ? styles.userMsgText : styles.receivedMsgText,
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.msgTime,
            isUser ? styles.userTime : styles.receivedTime,
          ]}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area */}
        <View style={styles.inputArea}>
          {/* Quick Alerts Row */}
          <FlatList
            horizontal
            data={QUICK_ALERTS}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickList}
            renderItem={({ item }) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  style={styles.quickChip}
                  onPress={() => sendQuickAlert(item.text)}
                  activeOpacity={0.7}
                >
                  <IconComponent color={COLORS.textSecondary} size={13} />
                  <Text style={styles.quickChipText}>{item.text}</Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.text}
          />

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !inputText.trim() && styles.sendBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim()}
                activeOpacity={0.8}
              >
                <Send color={COLORS.white} size={18} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messageList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },

  // System message
  systemMsgWrapper: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  systemBubble: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: '80%',
  },
  systemText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption,
    textAlign: 'center',
  },

  // Normal messages
  msgWrapper: {
    marginVertical: 3,
    maxWidth: '78%',
  },
  userMsgWrapper: {
    alignSelf: 'flex-end',
  },
  receivedMsgWrapper: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADIUS.xs,
  },
  receivedBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: {
    fontSize: SIZES.body,
    lineHeight: 21,
  },
  userMsgText: {
    color: COLORS.white,
  },
  receivedMsgText: {
    color: COLORS.text,
  },
  msgTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255,255,255,0.6)',
  },
  receivedTime: {
    color: COLORS.textMuted,
  },

  // SOS Emergency message
  sosMsgWrapper: {
    alignSelf: 'center',
    maxWidth: '92%',
    marginVertical: SPACING.sm,
  },
  sosBubble: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  sosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  sosIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosTitle: {
    color: COLORS.error,
    fontSize: SIZES.body,
    fontWeight: '700',
  },
  mapContainer: {
    marginHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceLight,
    height: 160,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceLight,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
  },
  mapPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapCoords: {
    color: COLORS.textSecondary,
    fontSize: SIZES.tiny,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  mapOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  mapOpenText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontWeight: '600',
  },
  sosText: {
    color: COLORS.text,
    fontSize: SIZES.caption,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    lineHeight: 18,
  },
  sosTime: {
    color: COLORS.textMuted,
    fontSize: 10,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    paddingTop: 4,
    alignSelf: 'flex-end',
  },

  // Input Area
  inputArea: {
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.lg : SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  quickChipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: COLORS.text,
    fontSize: SIZES.body,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textMuted,
    ...SHADOWS.none,
  },
});

export default ChatDetailScreen;

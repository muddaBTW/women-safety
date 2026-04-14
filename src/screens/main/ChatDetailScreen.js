import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/Theme';
import { Send, ShieldInfo } from 'lucide-react-native';

const QUICK_ALERTS = [
  "I'm Safe",
  "Heading Home",
  "Traffic Delay",
  "Call me ASAP",
  "Check GPS link",
];

const ChatDetailScreen = ({ route }) => {
  const { contactId } = route.params;
  const { messagesMap, addMessage } = useApp();
  const [inputText, setInputText] = useState('');
  
  const messages = messagesMap[contactId] || [];

  const handleSend = () => {
    if (inputText.trim()) {
      addMessage(contactId, inputText.trim(), 'user');
      setInputText('');
    }
  };

  const sendQuickAlert = (alert) => {
    addMessage(contactId, alert, 'user');
  };

  const renderMessage = ({ item }) => {
    const isUser = item.type === 'user';
    const isEmergency = item.type === 'emergency';

    return (
      <View style={[
        styles.messageWrapper,
        isUser ? styles.userWrapper : styles.receivedWrapper,
        isEmergency && styles.emergencyWrapper
      ]}>
        <View style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.receivedBubble,
          isEmergency && styles.emergencyBubble
        ]}>
          {isEmergency && <ShieldInfo color={COLORS.white} size={16} style={{ marginBottom: 4 }} />}
          <Text style={[
            styles.messageText,
            isUser || isEmergency ? styles.whiteText : styles.darkText
          ]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messageList}
        />

        <View style={styles.inputContainer}>
          <FlatList
            horizontal
            data={QUICK_ALERTS}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickAlertsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickAlert}
                onPress={() => sendQuickAlert(item)}
              >
                <Text style={styles.quickAlertText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Send a safety update..."
              placeholderTextColor={COLORS.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send color={COLORS.white} size={20} />
            </TouchableOpacity>
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
    padding: SPACING.md,
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  receivedWrapper: {
    alignSelf: 'flex-start',
  },
  emergencyWrapper: {
    alignSelf: 'center',
    maxWidth: '90%',
  },
  bubble: {
    padding: SPACING.md,
    borderRadius: 20,
    minWidth: 60,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  emergencyBubble: {
    backgroundColor: COLORS.error,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  messageText: {
    fontSize: SIZES.body,
  },
  whiteText: {
    color: COLORS.white,
  },
  darkText: {
    color: COLORS.white,
  },
  timestamp: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...SHADOWS.medium,
  },
  quickAlertsList: {
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  quickAlert: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickAlertText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: SIZES.body,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatDetailScreen;

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
  StatusBar,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { Send, ShieldAlert, MapPin, ExternalLink, Zap, Heart, Navigation, Phone, AlertTriangle, Eye, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const QUICK_ALERTS = [
  { text: "I'm Safe", icon: Heart },
  { text: "Heading Home", icon: Navigation },
  { text: "Call me ASAP", icon: Phone },
  { text: "Need Help", icon: AlertTriangle },
];

const ChatDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { contactId, name } = route.params;
  const { messagesMap, addMessage, clearUnread } = useApp();
  const [inputText, setInputText] = useState('');
  const [sendScale] = useState(new Animated.Value(1));

  const messages = messagesMap[contactId] || [];

  useEffect(() => {
    clearUnread(contactId);
  }, [contactId, messages.length]);

  const handleSend = () => {
    if (inputText.trim()) {
      Animated.sequence([
        Animated.timing(sendScale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
        Animated.timing(sendScale, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
      addMessage(contactId, inputText.trim(), 'user');
      setInputText('');
    }
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
    const isImage = item.type === 'image';
    
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isSystem) {
      return (
        <View style={styles.systemMsgWrapper}>
          <Text style={styles.systemText}>{item.text.toUpperCase()}</Text>
        </View>
      );
    }

    if (isImage) {
      return (
        <View style={styles.mediaMsgWrapper}>
          <View style={styles.mediaBubble}>
            <Image source={{ uri: item.uri }} style={styles.mediaImage} resizeMode="cover" />
            <View style={styles.mediaOverlay}>
              <Eye color={COLORS.white} size={14} />
              <Text style={styles.mediaTime}>{time}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (isEmergency) {
      return (
        <View style={styles.sosMsgWrapper}>
          <View style={styles.sosBubble}>
            <View style={styles.sosHeader}>
              <ShieldAlert color={COLORS.primary} size={18} />
              <Text style={styles.sosTitle}>EMERGENCY PROTOCOL</Text>
            </View>
            {item.location && (
              <TouchableOpacity style={styles.mapPreview} onPress={() => openMap(item.location)}>
                <Image source={{ uri: item.staticMapUrl }} style={styles.mapImage} />
                <View style={styles.mapInfo}>
                  <MapPin color={COLORS.primary} size={12} />
                  <Text style={styles.mapText}>VIEW LIVE COORDINATES</Text>
                </View>
              </TouchableOpacity>
            )}
            <Text style={styles.sosBody}>{item.text}</Text>
            <Text style={styles.sosTime}>{time}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.msgWrapper, isUser ? styles.userMsgWrapper : styles.receivedMsgWrapper]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.receivedBubble]}>
          <Text style={[styles.msgText, isUser ? styles.userMsgText : styles.receivedMsgText]}>{item.text}</Text>
          <Text style={[styles.msgTime, isUser ? styles.userTime : styles.receivedTime]}>{time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Mini Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={COLORS.text} size={22} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <View style={styles.secureRow}>
            <View style={styles.secureDot} />
            <Text style={styles.secureText}>ENCRYPTED CHANNEL</Text>
          </View>
        </View>
      </View>

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
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputArea}>
          <FlatList
            horizontal
            data={QUICK_ALERTS}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.quickChip} onPress={() => addMessage(contactId, item.text, 'user')}>
                <item.icon color={COLORS.textSecondary} size={12} />
                <Text style={styles.quickChipText}>{item.text}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.text}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="TRANSIT ENCRYPTED MESSAGE..."
              placeholderTextColor={COLORS.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
              <TouchableOpacity
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim()}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { marginRight: SPACING.md },
  headerInfo: { flex: 1 },
  headerName: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  secureDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.success },
  secureText: { color: COLORS.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  
  messageList: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  systemMsgWrapper: { alignItems: 'center', marginVertical: 12 },
  systemText: { color: COLORS.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  
  msgWrapper: { marginVertical: 4, maxWidth: '80%' },
  userMsgWrapper: { alignSelf: 'flex-end' },
  receivedMsgWrapper: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: RADIUS.md },
  userBubble: { backgroundColor: COLORS.surface, borderBottomRightRadius: 2, borderWidth: 1, borderColor: COLORS.border },
  receivedBubble: { backgroundColor: COLORS.surfaceLight, borderBottomLeftRadius: 2 },
  msgText: { fontSize: 15, lineHeight: 20 },
  userMsgText: { color: COLORS.text },
  receivedMsgText: { color: COLORS.text },
  msgTime: { fontSize: 9, marginTop: 4, alignSelf: 'flex-end' },
  userTime: { color: COLORS.textMuted },
  receivedTime: { color: COLORS.textMuted },

  mediaMsgWrapper: { alignSelf: 'center', marginVertical: 10 },
  mediaBubble: { borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  mediaImage: { width: 260, height: 320 },
  mediaOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', justifyContent: 'space-between' },
  mediaTime: { color: COLORS.white, fontSize: 9 },

  sosMsgWrapper: { alignSelf: 'center', marginVertical: 12, width: '95%' },
  sosBubble: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 0, 64, 0.4)' },
  sosHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sosTitle: { color: COLORS.primary, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  mapPreview: { height: 160, borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: 12 },
  mapImage: { width: '100%', height: '100%' },
  mapInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)', padding: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapText: { color: COLORS.text, fontSize: 10, fontWeight: '800' },
  sosBody: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  sosTime: { color: COLORS.textMuted, fontSize: 9, alignSelf: 'flex-end', marginTop: 8 },

  inputArea: { backgroundColor: COLORS.background, paddingVertical: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  quickList: { paddingHorizontal: SPACING.md, paddingBottom: 12, gap: 10 },
  quickChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  quickChipText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: SPACING.md, gap: 12 },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.text, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.textMuted },
});

export default ChatDetailScreen;

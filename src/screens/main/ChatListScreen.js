import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { ChevronRight, AlertCircle, MessageSquare } from 'lucide-react-native';

const AVATAR_COLORS = [
  '#FF0040', '#8A2BE2', '#30D158', '#FFD60A',
  '#00F5FF', '#FF9F0A', '#BF5AF2', '#FF375F',
];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatListScreen = ({ navigation }) => {
  const { contacts, messagesMap, unreadMap } = useApp();

  const renderItem = ({ item }) => {
    const contactMessages = messagesMap[item.id] || [];
    const latestMessage = contactMessages[0];
    const isSOS = latestMessage?.type === 'emergency';
    const isSystem = latestMessage?.type === 'system';
    const unreadCount = unreadMap[item.id] || 0;
    const avatarColor = getAvatarColor(item.name);

    let previewText = 'Begin encryption...';
    if (latestMessage) {
      if (isSOS) previewText = '🚨 SOS Alert Active';
      else if (isSystem) previewText = latestMessage.text;
      else if (latestMessage.type === 'received') previewText = latestMessage.text;
      else previewText = `You: ${latestMessage.text}`;
    }

    return (
      <TouchableOpacity
        style={[styles.card, isSOS && styles.cardSOS]}
        onPress={() => navigation.navigate('ChatDetail', { contactId: item.id, name: item.name })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor + '15', borderColor: avatarColor + '30' }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {isSOS && <View style={styles.sosPulse} />}
        </View>

        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            {latestMessage && (
              <Text style={[styles.time, isSOS && styles.timeSOS]}>
                {formatTime(latestMessage.timestamp)}
              </Text>
            )}
          </View>
          <View style={styles.bottomRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.preview,
                isSOS && styles.previewSOS,
                unreadCount > 0 && styles.previewUnread,
              ]}
            >
              {previewText}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        <ChevronRight color={COLORS.textMuted} size={14} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Secure Comms</Text>
        <Text style={styles.subtitle}>{contacts.length} ACTIVE CHANNELS</Text>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MessageSquare color={COLORS.textMuted} size={48} strokeWidth={1} />
            <Text style={styles.emptyText}>No Active Channels</Text>
            <Text style={styles.emptySubtext}>Add contacts to initialize comms.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSOS: {
    borderColor: 'rgba(255, 0, 64, 0.3)',
    backgroundColor: 'rgba(255, 0, 64, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  sosPulse: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  info: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: SPACING.sm,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  timeSOS: {
    color: COLORS.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
    marginRight: SPACING.sm,
  },
  previewSOS: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  previewUnread: {
    color: COLORS.text,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default ChatListScreen;

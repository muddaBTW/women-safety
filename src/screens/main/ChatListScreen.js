import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { ChevronRight, AlertTriangle } from 'lucide-react-native';

const AVATAR_COLORS = [
  '#FF3B6F', '#7C5CFC', '#00D68F', '#FFB800',
  '#3B82F6', '#F97316', '#8B5CF6', '#EC4899',
  '#06B6D4', '#10B981',
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
  if (mins < 60) return `${mins}m ago`;
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

    let previewText = 'Start a conversation';
    if (latestMessage) {
      if (isSOS) previewText = '🚨 SOS Alert sent';
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
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor + '20' }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {isSOS && (
            <View style={styles.sosIndicator}>
              <AlertTriangle color={COLORS.white} size={10} />
            </View>
          )}
        </View>

        {/* Message info */}
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

        <ChevronRight color={COLORS.textMuted} size={16} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>{contacts.length} conversations</Text>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No conversations yet.</Text>
            <Text style={styles.emptySubtext}>Add contacts to start messaging.</Text>
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
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  list: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
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
    borderColor: 'rgba(255, 71, 87, 0.3)',
    backgroundColor: 'rgba(255, 71, 87, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  sosIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: SIZES.body,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: SIZES.tiny,
  },
  timeSOS: {
    color: COLORS.error,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption,
    flex: 1,
    marginRight: SPACING.sm,
  },
  previewSOS: {
    color: COLORS.error,
    fontWeight: '600',
  },
  previewUnread: {
    color: COLORS.text,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
  },
});

export default ChatListScreen;

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
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/Theme';
import { ChevronRight, ShieldAlert } from 'lucide-react-native';

const ChatListScreen = ({ navigation }) => {
  const { contacts, messagesMap } = useApp();

  const renderItem = ({ item }) => {
    const contactMessages = messagesMap[item.id] || [];
    const latestMessage = contactMessages[0];
    const isSOS = latestMessage?.type === 'emergency';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ChatDetail', { contactId: item.id, name: item.name })}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: isSOS ? COLORS.primary : COLORS.secondary }]}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          {isSOS && <ShieldAlert color={COLORS.error} size={16} style={styles.alertIcon} />}
        </View>

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            {latestMessage && (
              <Text style={styles.time}>
                {new Date(latestMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          <Text 
            numberOfLines={1} 
            style={[styles.lastMessage, isSOS && styles.sosText]}
          >
            {latestMessage ? latestMessage.text : 'No messages yet'}
          </Text>
        </View>

        <ChevronRight color={COLORS.textSecondary} size={20} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No contacts found in safety hub.</Text>
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
  list: {
    padding: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  alertIcon: {
    position: 'absolute',
    bottom: 0,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 1,
  },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  time: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  lastMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  sosText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
  },
});

export default ChatListScreen;

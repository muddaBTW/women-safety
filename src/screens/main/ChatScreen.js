import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/Theme';
import { AlertTriangle, Clock } from 'lucide-react-native';

const ChatScreen = () => {
  const { messages } = useApp();

  const renderItem = ({ item }) => {
    const isSystem = item.type === 'system';
    const date = new Date(item.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageWrapper, isSystem && styles.systemWrapper]}>
        <View style={[styles.messageContainer, isSystem && styles.systemContainer]}>
          {isSystem && (
            <View style={styles.systemHeader}>
              <AlertTriangle color={COLORS.error} size={16} />
              <Text style={styles.systemTitle}>SYSTEM ALERT</Text>
            </View>
          )}
          <Text style={[styles.messageText, isSystem && styles.systemText]}>
            {item.text}
          </Text>
          <View style={styles.timeContainer}>
            <Clock color={isSystem ? COLORS.error : COLORS.textSecondary} size={12} />
            <Text style={[styles.timeText, isSystem && styles.systemTimeText]}>
              {timeString}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Alerts</Text>
        <Text style={styles.subtitle}>Recent system events</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        inverted
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No alerts yet. Stay safe!</Text>
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
    padding: SPACING.xl,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: SPACING.xl,
  },
  messageWrapper: {
    width: '100%',
    marginVertical: SPACING.sm,
    flexDirection: 'row',
  },
  systemWrapper: {
    justifyContent: 'center',
  },
  messageContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    maxWidth: '85%',
    ...SHADOWS.light,
  },
  systemContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
    width: '100%',
    maxWidth: '100%',
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  systemTitle: {
    color: COLORS.error,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  messageText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    lineHeight: 22,
  },
  systemText: {
    fontWeight: '600',
    color: COLORS.white,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
    gap: 4,
  },
  timeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  systemTimeText: {
    color: COLORS.error,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    transform: [{ scaleY: -1 }], // Because list is inverted
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
  },
});

export default ChatScreen;

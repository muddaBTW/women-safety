import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
  Animated,
} from 'react-native';
import * as Location from 'expo-location';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { AlertCircle, ShieldCheck, MessageCircle, Users, MapPin } from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
  const { isAlerting, setIsAlerting, broadcastSOS } = useApp();

  // Triple pulse ring animations
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.4)).current;
  const opacity2 = useRef(new Animated.Value(0.3)).current;
  const opacity3 = useRef(new Animated.Value(0.2)).current;
  const statusDot = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Status dot blink
    Animated.loop(
      Animated.sequence([
        Animated.timing(statusDot, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(statusDot, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Triple concentric pulses with staggered delays
    const createPulse = (scaleAnim, opacityAnim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleAnim, { toValue: 1.4, duration: 2000, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0.4, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
    };

    createPulse(pulse1, opacity1, 0).start();
    createPulse(pulse2, opacity2, 600).start();
    createPulse(pulse3, opacity3, 1200).start();
  }, []);

  const handleSOS = async () => {
    try {
      Vibration.vibrate([0, 500, 200, 500], true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission denied. This is required for your safety.');
        Vibration.cancel();
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let lat = location.coords.latitude;
      let lng = location.coords.longitude;

      console.log('SOS Triggered. Location:', lat, lng);

      // Send to ESP32
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // ESP takes ~8.5s to respond

      try {
        await fetch(`http://192.168.31.160/sos?lat=${lat}&lng=${lng}`, { signal: controller.signal });
        console.log('ESP32 Notified Successfully');
      } catch (e) {
        console.warn('Hardware connection delayed/failed, broadcasting in-app.', e);
      }

      await broadcastSOS(lat, lng);
      alert('🚨 SOS Sent Successfully!');

    } catch (error) {
      console.error(error);
      alert('Error sending SOS signal.');
      Vibration.cancel();
      setIsAlerting(false);
    }
  };

  const stopSOS = () => {
    Vibration.cancel();
    setIsAlerting(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>SafeGuard</Text>
          <View style={styles.statusRow}>
            <Animated.View style={[
              styles.statusDot,
              {
                backgroundColor: isAlerting ? COLORS.error : COLORS.success,
                opacity: statusDot,
              }
            ]} />
            <Text style={[
              styles.statusText,
              { color: isAlerting ? COLORS.error : COLORS.success }
            ]}>
              {isAlerting ? 'Broadcasting SOS' : 'Protected'}
            </Text>
          </View>
        </View>
        <View style={styles.headerBadge}>
          {isAlerting ? (
            <AlertCircle color={COLORS.error} size={22} />
          ) : (
            <ShieldCheck color={COLORS.success} size={22} />
          )}
        </View>
      </View>

      {/* SOS Button Area */}
      <View style={styles.centerSection}>
        <View style={styles.sosContainer}>
          {/* Pulse rings */}
          <Animated.View style={[styles.pulseRing, styles.ring3, {
            transform: [{ scale: pulse3 }], opacity: opacity3,
          }]} />
          <Animated.View style={[styles.pulseRing, styles.ring2, {
            transform: [{ scale: pulse2 }], opacity: opacity2,
          }]} />
          <Animated.View style={[styles.pulseRing, styles.ring1, {
            transform: [{ scale: pulse1 }], opacity: opacity1,
          }]} />

          {/* Main button */}
          <TouchableOpacity
            style={[styles.sosButton, isAlerting && styles.sosButtonActive]}
            onLongPress={handleSOS}
            onPress={isAlerting ? stopSOS : null}
            activeOpacity={0.9}
            delayLongPress={800}
          >
            <Text style={[styles.sosText, isAlerting && styles.sosTextActive]}>
              {isAlerting ? 'STOP' : 'SOS'}
            </Text>
            {!isAlerting && (
              <Text style={styles.sosSubtext}>Hold to activate</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <MapPin color={COLORS.primary} size={18} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Safety Broadcast</Text>
            <Text style={styles.infoDesc}>
              {isAlerting
                ? 'All contacts notified with live coordinates.'
                : 'Hold SOS to alert contacts & hardware.'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('ChatTab')}
            activeOpacity={0.7}
          >
            <MessageCircle color={COLORS.secondary} size={20} />
            <Text style={styles.quickActionText}>Messages</Text>
          </TouchableOpacity>

          <View style={styles.quickDivider} />

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('ContactsTab')}
            activeOpacity={0.7}
          >
            <Users color={COLORS.secondary} size={20} />
            <Text style={styles.quickActionText}>Contacts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosContainer: {
    width: SIZES.sosButton * 1.6,
    height: SIZES.sosButton * 1.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  ring1: {
    width: SIZES.sosButton * 1.1,
    height: SIZES.sosButton * 1.1,
  },
  ring2: {
    width: SIZES.sosButton * 1.3,
    height: SIZES.sosButton * 1.3,
  },
  ring3: {
    width: SIZES.sosButton * 1.55,
    height: SIZES.sosButton * 1.55,
  },
  sosButton: {
    width: SIZES.sosButton,
    height: SIZES.sosButton,
    borderRadius: SIZES.sosButton / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...SHADOWS.glow,
  },
  sosButtonActive: {
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.error,
  },
  sosText: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
  },
  sosTextActive: {
    color: COLORS.error,
    fontSize: 28,
  },
  sosSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: SIZES.tiny,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  bottomSection: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 111, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: COLORS.text,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  infoDesc: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption,
    marginTop: 2,
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  quickDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  quickActionText: {
    color: COLORS.text,
    fontSize: SIZES.body,
    fontWeight: '500',
  },
});

export default HomeScreen;

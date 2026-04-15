import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/Theme';
import { Phone, PhoneOff, User, Mic, Video, Volume2 } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

const FAKE_CALLERS = [
  { name: 'Mom', number: '+91 98765 XXXXX' },
  { name: 'Dad', number: '+91 87654 XXXXX' },
  { name: 'Home', number: '+91 99887 XXXXX' },
];

const FakeCallScreen = ({ navigation, route }) => {
  const { startLiveTracking, stopLiveTracking } = useApp();
  const callerIndex = route?.params?.callerIndex || 0;
  const caller = FAKE_CALLERS[callerIndex % FAKE_CALLERS.length];

  const [callState, setCallState] = useState('ringing'); // ringing | active | ended
  const [callDuration, setCallDuration] = useState(0);

  const auraScale = useRef(new Animated.Value(1)).current;
  const auraOpacity = useRef(new Animated.Value(0.4)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (callState === 'ringing') {
      Vibration.vibrate([0, 1000, 500, 1000], true);

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(auraScale, { toValue: 1.5, duration: 1500, useNativeDriver: true }),
            Animated.timing(auraOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(auraScale, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(auraOpacity, { toValue: 0.4, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }

    return () => Vibration.cancel();
  }, [callState]);

  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  const handleAccept = () => {
    Vibration.cancel();
    setCallState('active');
    startLiveTracking();
  };

  const handleDecline = () => {
    Vibration.cancel();
    setCallState('ended');
    setTimeout(() => navigation.goBack(), 500);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (callState === 'active') {
    return (
      <SafeAreaView style={styles.activeContainer}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.topInfo}>
          <View style={styles.activeAvatar}>
            <User color={COLORS.text} size={40} />
          </View>
          <Text style={styles.activeName}>{caller.name}</Text>
          <Text style={styles.activeTimer}>{formatTime(callDuration)}</Text>
        </View>

        <View style={styles.controlsGrid}>
          <View style={styles.controlRow}>
            <View style={styles.activeControlBtn}>
              <Mic color={COLORS.text} size={24} />
              <Text style={styles.activeControlLabel}>mute</Text>
            </View>
            <View style={styles.activeControlBtn}>
              <View style={styles.keypadDot} />
              <Text style={styles.activeControlLabel}>keypad</Text>
            </View>
            <View style={styles.activeControlBtn}>
              <Volume2 color={COLORS.text} size={24} />
              <Text style={styles.activeControlLabel}>speaker</Text>
            </View>
          </View>
          <View style={styles.controlRow}>
            <View style={styles.activeControlBtn}>
              <View style={styles.addCallDot} />
              <Text style={styles.activeControlLabel}>add call</Text>
            </View>
            <View style={styles.activeControlBtn}>
              <Video color={COLORS.textMuted} size={24} />
              <Text style={styles.activeControlLabel}>FaceTime</Text>
            </View>
            <View style={styles.activeControlBtn}>
              <User color={COLORS.text} size={24} />
              <Text style={styles.activeControlLabel}>contacts</Text>
            </View>
          </View>
        </View>

        <View style={styles.trackingBanner}>
          <Text style={styles.trackingText}>Live Location active for safety</Text>
        </View>

        <View style={styles.endCallSection}>
          <TouchableOpacity style={styles.endBtn} onPress={handleDecline} activeOpacity={0.8}>
            <PhoneOff color={COLORS.white} size={32} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.ringingTop}>
        <Text style={styles.ringingLabel}>Mobile</Text>
        <Text style={styles.callerName}>{caller.name}</Text>
      </View>

      <View style={styles.centerSection}>
        <Animated.View style={[
          styles.ringingAura,
          { transform: [{ scale: auraScale }], opacity: auraOpacity }
        ]} />
        <View style={styles.avatarLarge}>
          <User color={COLORS.textSecondary} size={80} />
        </View>
      </View>

      <View style={styles.ringingBottom}>
        <View style={styles.actionRow}>
          <View style={styles.actionWrap}>
            <TouchableOpacity style={[styles.ringBtn, styles.declineRing]} onPress={handleDecline}>
              <PhoneOff color={COLORS.white} size={28} />
            </TouchableOpacity>
            <Text style={styles.ringBtnLabel}>Decline</Text>
          </View>
          
          <View style={styles.actionWrap}>
            <TouchableOpacity style={[styles.ringBtn, styles.acceptRing]} onPress={handleAccept}>
              <Phone color={COLORS.white} size={28} />
            </TouchableOpacity>
            <Text style={styles.ringBtnLabel}>Accept</Text>
          </View>
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
  ringingTop: {
    alignItems: 'center',
    marginTop: 80,
  },
  ringingLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  callerName: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '400',
    marginTop: 8,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringingAura: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.success,
  },
  avatarLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ringingBottom: {
    paddingBottom: 80,
    paddingHorizontal: 40,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionWrap: {
    alignItems: 'center',
    gap: 12,
  },
  ringBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineRing: { backgroundColor: COLORS.error },
  acceptRing: { backgroundColor: COLORS.success },
  ringBtnLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },

  // Active Call Styles
  activeContainer: {
    flex: 1,
    backgroundColor: '#050505',
    paddingHorizontal: SPACING.xl,
  },
  topInfo: {
    alignItems: 'center',
    marginTop: 60,
  },
  activeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeName: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '700',
  },
  activeTimer: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  controlsGrid: {
    marginTop: 60,
    gap: 40,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activeControlBtn: {
    alignItems: 'center',
    gap: 8,
  },
  activeControlLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  keypadDot: { width: 20, height: 20, borderRadius: 2, borderWidth: 1, borderColor: COLORS.text },
  addCallDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: COLORS.text, borderStyle: 'dashed' },
  trackingBanner: {
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
  },
  trackingText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  endCallSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
  },
  endBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FakeCallScreen;

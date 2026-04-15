import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Vibration,
  Animated,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { Clock, Shield, X, Play, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react-native';
import * as Location from 'expo-location';

const PRESETS = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
];

const SafetyTimerScreen = () => {
  const { broadcastSOS, triggerEspSOS, setIsAlerting } = useApp();

  const [timerState, setTimerState] = useState('idle'); // idle | running | warning | triggered
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [customMinutes, setCustomMinutes] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [warningCountdown, setWarningCountdown] = useState(30);

  const intervalRef = useRef(null);
  const warningIntervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
      Vibration.cancel();
    };
  }, []);

  const startTimer = () => {
    const mins = customMinutes ? parseInt(customMinutes) : selectedMinutes;
    if (!mins || mins <= 0) return;

    setSecondsLeft(mins * 60);
    setTimerState('running');

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          startWarning();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startWarning = () => {
    setTimerState('warning');
    setWarningCountdown(30);
    Vibration.vibrate([0, 500, 300, 500], true);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();

    warningIntervalRef.current = setInterval(() => {
      setWarningCountdown(prev => {
        if (prev <= 1) {
          clearInterval(warningIntervalRef.current);
          triggerAutoSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerAutoSOS = async () => {
    Vibration.cancel();
    setTimerState('triggered');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const location = status === 'granted' ? await Location.getCurrentPositionAsync({}) : null;
      const lat = location?.coords.latitude || 0;
      const lng = location?.coords.longitude || 0;
      await Promise.allSettled([triggerEspSOS(lat, lng), broadcastSOS(lat, lng)]);
    } catch (e) {
      console.error('Auto SOS failed');
    }
  };

  const markSafe = () => {
    Vibration.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    pulseAnim.setValue(1);
    setTimerState('idle');
    setSecondsLeft(0);
    setWarningCountdown(30);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (timerState === 'warning') {
    return (
      <SafeAreaView style={styles.warningContainer}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[styles.warningContent, { transform: [{ scale: pulseAnim }] }]}>
          <AlertTriangle color={COLORS.warning} size={80} strokeWidth={1.5} />
          <Text style={styles.warningTitle}>SAFETY CHECK</Text>
          <Text style={styles.warningSubtitle}>Confirmation required or SOS triggers in</Text>
          <Text style={styles.warningCountdown}>{warningCountdown}s</Text>
        </Animated.View>

        <TouchableOpacity style={styles.bigSafeBtn} onPress={markSafe} activeOpacity={0.9}>
          <Text style={styles.bigSafeBtnText}>I AM SAFE</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (timerState === 'triggered') {
    return (
      <SafeAreaView style={styles.triggeredContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.triggeredContent}>
          <Shield color={COLORS.primary} size={80} strokeWidth={1.5} />
          <Text style={styles.triggeredTitle}>SOS EXECUTED</Text>
          <Text style={styles.triggeredSubtitle}>Emergency contacts were notified automatically.</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={markSafe}>
          <Text style={styles.resetBtnText}>RETURN TO DASHBOARD</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Safety Timer</Text>
        <Text style={styles.subtitle}>Automatic protection when you don't respond</Text>
      </View>

      <View style={styles.content}>
        {timerState === 'running' ? (
          <View style={styles.runningView}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeRemaining}>{formatTime(secondsLeft)}</Text>
              <Text style={styles.timeLeftLabel}>PROTECTION ACTIVE</Text>
            </View>
            <TouchableOpacity style={styles.runningSafeBtn} onPress={markSafe} activeOpacity={0.8}>
              <CheckCircle color={COLORS.white} size={24} />
              <Text style={styles.runningSafeBtnText}>Confirm I'm Safe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={markSafe}>
              <Text style={styles.cancelLinkText}>Cancel Protection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.setupCard}>
              <Clock color={COLORS.secondary} size={28} />
              <View style={styles.setupInfo}>
                <Text style={styles.setupTitle}>Interval Protection</Text>
                <Text style={styles.setupDesc}>Choose a duration for your safe check-in.</Text>
              </View>
            </View>

            <View style={styles.presetGrid}>
              {PRESETS.map(p => (
                <TouchableOpacity 
                  key={p.minutes}
                  style={[styles.presetItem, selectedMinutes === p.minutes && !customMinutes && styles.presetItemActive]}
                  onPress={() => { setSelectedMinutes(p.minutes); setCustomMinutes(''); }}
                >
                  <Text style={[styles.presetLabel, selectedMinutes === p.minutes && !customMinutes && styles.presetLabelActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>OR CUSTOM MINUTES</Text>
              <TextInput
                style={styles.customInput}
                value={customMinutes}
                onChangeText={setCustomMinutes}
                placeholder="Ex. 45"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
              />
            </View>

            <View style={{ flex: 1 }} />

            <TouchableOpacity style={styles.startBtn} onPress={startTimer} activeOpacity={0.9}>
              <Text style={styles.startBtnText}>ACTIVATE PROTECTION</Text>
              <ChevronRight color={COLORS.white} size={20} />
            </TouchableOpacity>
          </>
        )}
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
    padding: SPACING.xl,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  setupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  setupInfo: { flex: 1 },
  setupTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  setupDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  presetItem: {
    flex: 1,
    minWidth: '45%',
    height: 60,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetItemActive: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.secondary,
  },
  presetLabel: { color: COLORS.textMuted, fontSize: 16, fontWeight: '700' },
  presetLabelActive: { color: COLORS.text },
  
  inputWrap: { marginBottom: SPACING.xl },
  inputLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, marginBottom: 8, letterSpacing: 1 },
  customInput: {
    backgroundColor: COLORS.surface,
    height: 54,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  startBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    height: 64,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  startBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  // Running
  runningView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progressContainer: {
    width: 250, height: 250, borderRadius: 125,
    borderWidth: 2, borderColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 60,
    ...Platform.select({ web: { boxShadow: '0 0 30px rgba(138, 43, 226, 0.2)' } })
  },
  timeRemaining: { color: COLORS.text, fontSize: 56, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timeLeftLabel: { fontSize: 10, fontWeight: '900', color: COLORS.accent, letterSpacing: 2, marginTop: 10 },
  runningSafeBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.success,
    width: '100%', height: 64, borderRadius: RADIUS.xl,
    justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  runningSafeBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  cancelLink: { marginTop: 24 },
  cancelLinkText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },

  // Warning
  warningContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 40 },
  warningContent: { alignItems: 'center' },
  warningTitle: { color: COLORS.warning, fontSize: 14, fontWeight: '900', letterSpacing: 4, marginTop: 30 },
  warningSubtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 10 },
  warningCountdown: { color: COLORS.white, fontSize: 90, fontWeight: '900', marginTop: 20 },
  bigSafeBtn: {
    backgroundColor: COLORS.success, width: '100%', height: 72, borderRadius: RADIUS.xl,
    justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 60,
  },
  bigSafeBtnText: { color: COLORS.white, fontSize: 20, fontWeight: '900', letterSpacing: 2 },

  // Triggered
  triggeredContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 40 },
  triggeredContent: { alignItems: 'center' },
  triggeredTitle: { color: COLORS.primary, fontSize: 14, fontWeight: '900', letterSpacing: 4, marginTop: 30 },
  triggeredSubtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  resetBtn: {
    backgroundColor: COLORS.surface, width: '100%', height: 60, borderRadius: RADIUS.xl,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, position: 'absolute', bottom: 60,
  },
  resetBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
});

export default SafetyTimerScreen;

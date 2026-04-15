import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
  Animated,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import {
  Shield, Wifi, WifiOff, Mic, MicOff, Vibrate, 
  PhoneIncoming, Clock, Navigation, 
  AlertTriangle, ChevronRight
} from 'lucide-react-native';
import ShakeDetector from '../../services/ShakeDetector';
import VoiceSosService from '../../services/VoiceSos';

const HomeScreen = ({ navigation }) => {
  const {
    isAlerting, setIsAlerting, broadcastSOS, triggerEspSOS, espConnected,
    isLiveTracking, stopLiveTracking,
    shakeEnabled, updateShakeEnabled,
    voiceEnabled, updateVoiceEnabled,
    addMediaMessage, contacts
  } = useApp();

  const [voiceText, setVoiceText] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Animations
  const auraScale = useRef(new Animated.Value(1)).current;
  const auraOpacity = useRef(new Animated.Value(0.3)).current;
  const statusFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Breathing aura animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(auraScale, { toValue: 1.4, duration: 2500, useNativeDriver: true }),
          Animated.timing(auraOpacity, { toValue: 0, duration: 2500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(auraScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(auraOpacity, { toValue: 0.3, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();

    if (!permission) requestPermission();
  }, []);

  // SOS Logic hooks
  useEffect(() => {
    if (shakeEnabled) {
      ShakeDetector.start(() => handleSOS('Shake triggered'));
    } else {
      ShakeDetector.stop();
    }
    return () => ShakeDetector.stop();
  }, [shakeEnabled]);

  useEffect(() => {
    if (voiceEnabled) {
      VoiceSosService.start(
        (heardText) => handleSOS(`Voice triggered: ${heardText}`),
        setVoiceText
      );
    } else {
      VoiceSosService.stop();
      setVoiceText('');
    }
    return () => VoiceSosService.stop();
  }, [voiceEnabled]);

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
        const emergencyContacts = contacts.filter(c => c.isEmergency);
        emergencyContacts.forEach(contact => addMediaMessage(contact.id, photo.uri, 'image'));
      } catch (e) {
        console.warn('Silent capture failed');
      }
    }
  };

  const handleSOS = async (reason = 'Manual activation') => {
    // Immediate UI feedback
    setIsAlerting(true);
    Vibration.vibrate([0, 500, 200, 500], true);
    
    try {
      capturePhoto();

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      await Promise.allSettled([
        triggerEspSOS(location.coords.latitude, location.coords.longitude),
        broadcastSOS(location.coords.latitude, location.coords.longitude),
      ]);
    } catch (error) {
      console.warn('SOS Sequence failed:', error);
      // We don't necessarily want to kill the Alerting state here 
      // as the user might still be in danger even if one broadcast fails
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Evidence Capture */}
      {permission?.granted && (
        <View style={styles.hiddenCamera}>
          <CameraView style={{ flex: 1 }} facing="front" ref={cameraRef} />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandText}>SafeGuard</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: isAlerting ? COLORS.primary : COLORS.success }]} />
            <Text style={styles.statusText}>
              {isAlerting ? 'EMERGENCY MODE ACTIVE' : isLiveTracking ? 'LIVE TRACKING' : 'SECURE CONNECTION'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7}>
          <Shield color={isAlerting ? COLORS.primary : COLORS.textMuted} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SOS Center Section */}
        <View style={styles.sosSection}>
          <View style={styles.sosContainer}>
            <Animated.View style={[
              styles.sosAura,
              { transform: [{ scale: auraScale }], opacity: auraOpacity }
            ]} />
            <TouchableOpacity
              style={[styles.sosButton, isAlerting && styles.sosButtonActive]}
              onLongPress={() => handleSOS()}
              onPress={() => {
                if (isAlerting) {
                  setIsAlerting(false);
                } else if (Platform.OS === 'web') {
                  // Fallback for web where long press is less intuitive
                  handleSOS();
                } else {
                  // Feedback for short press on native
                  Vibration.vibrate(50);
                }
              }}
              activeOpacity={0.9}
              delayLongPress={600} // Reduced delay for better feel
            >
              <Text style={[styles.sosLabel, isAlerting && styles.sosLabelActive]}>
                {isAlerting ? 'STOP' : 'SOS'}
              </Text>
              {!isAlerting && <Text style={styles.sosSub}>Hold for 1s</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Controls Grid */}
        <View style={styles.controlsGrid}>
          <TouchableOpacity 
            style={[styles.controlCard, shakeEnabled && styles.controlCardActive]} 
            onPress={() => updateShakeEnabled(!shakeEnabled)}
          >
            <Vibrate color={shakeEnabled ? COLORS.text : COLORS.textMuted} size={22} />
            <Text style={[styles.controlLabel, shakeEnabled && styles.controlLabelActive]}>Shake SOS</Text>
            <View style={[styles.toggleDot, { backgroundColor: shakeEnabled ? COLORS.success : COLORS.textMuted }]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlCard, voiceEnabled && styles.controlCardActive]} 
            onPress={() => updateVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? <Mic color={COLORS.text} size={22} /> : <MicOff color={COLORS.textMuted} size={22} />}
            <Text style={[styles.controlLabel, voiceEnabled && styles.controlLabelActive]}>Voice SOS</Text>
            <View style={[styles.toggleDot, { backgroundColor: voiceEnabled ? COLORS.success : COLORS.textMuted }]} />
          </TouchableOpacity>
        </View>

        {/* Voice Feedback */}
        {voiceEnabled && voiceText ? (
          <View style={styles.voiceTicker}>
            <Text style={styles.voiceTickerText}>Listening: "{voiceText}"</Text>
          </View>
        ) : null}

        {/* Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>Safety Tools</Text>
          
          <TouchableOpacity 
            style={styles.toolBar} 
            onPress={() => navigation.getParent()?.navigate('FakeCall')}
            activeOpacity={0.7}
          >
            <View style={styles.toolIconWrap}>
              <PhoneIncoming color={COLORS.success} size={20} />
            </View>
            <View style={styles.toolInfo}>
              <Text style={styles.toolName}>Fake Call</Text>
              <Text style={styles.toolDesc}>Escape uncomfortable situations</Text>
            </View>
            <ChevronRight color={COLORS.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolBar} 
            onPress={() => navigation.getParent()?.navigate('SafetyTimer')}
            activeOpacity={0.7}
          >
            <View style={styles.toolIconWrap}>
              <Clock color={COLORS.secondary} size={20} />
            </View>
            <View style={styles.toolInfo}>
              <Text style={styles.toolName}>Check-in Timer</Text>
              <Text style={styles.toolDesc}>Auto-SOS if you don't respond</Text>
            </View>
            <ChevronRight color={COLORS.textMuted} size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.hardwareStatus}>
          <View style={styles.hwItem}>
            {espConnected ? <Wifi color={COLORS.success} size={14} /> : <WifiOff color={COLORS.textMuted} size={14} />}
            <Text style={styles.hwText}>{espConnected ? 'Hardware Linked' : 'Hardware Offline'}</Text>
          </View>
          <View style={styles.hwItem}>
            <Navigation color={isLiveTracking ? COLORS.accent : COLORS.textMuted} size={14} />
            <Text style={styles.hwText}>{isLiveTracking ? 'Live Tracking On' : 'Tracking Idle'}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hiddenCamera: {
    position: 'absolute',
    width: 1, height: 1, opacity: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: SPACING.xl,
  },
  sosSection: {
    alignItems: 'center',
    marginVertical: SPACING.xxl,
  },
  sosContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosAura: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primary,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Platform.select({
      web: { boxShadow: '0 0 40px rgba(255, 0, 64, 0.4)' }
    })
  },
  sosButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sosLabel: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  sosLabelActive: {
    color: COLORS.white,
  },
  sosSub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1,
  },
  controlsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  controlCard: {
    flex: 1,
    height: 100,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  controlCardActive: {
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceLight,
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  controlLabelActive: {
    color: COLORS.text,
  },
  toggleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  voiceTicker: {
    marginHorizontal: SPACING.xl,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  voiceTickerText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  toolsSection: {
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  toolBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  toolIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  toolDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hardwareStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: SPACING.xl,
  },
  hwItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hwText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});

export default HomeScreen;

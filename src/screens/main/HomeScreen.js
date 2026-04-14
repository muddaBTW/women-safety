import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Vibration, SafeAreaView, Animated } from 'react-native';
import * as Location from 'expo-location';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/Theme';
import { AlertCircle, ShieldCheck } from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
  const { isAlerting, setIsAlerting, broadcastSOS } = useApp();
  
  // Animation logic
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulseSequence = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    );
    pulseSequence.start();
    return () => pulseSequence.stop();
  }, []);

  const handleSOS = async () => {
    try {
      // 1. Vibrate immediately
      Vibration.vibrate([0, 500, 200, 500], true);
      
      // 2. Request Location Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert("Location permission denied. This is required for your safety.");
        Vibration.cancel();
        return;
      }

      // 3. Get Current Location
      let location = await Location.getCurrentPositionAsync({});
      let lat = location.coords.latitude;
      let lng = location.coords.longitude;

      console.log("SOS Triggered. Location:", lat, lng);

      // 4. Send signal to ESP32 Hardware (Handles SMS broadcast)
      // Note: Timeout added to prevent blocking UI if hardware is offline
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        await fetch(`http://192.168.1.16/sos?lat=${lat}&lng=${lng}`, { signal: controller.signal });
        console.log("ESP32 Notified Successfully");
      } catch (e) {
        console.warn("Hardware connection delayed/failed, but broadcasting in-app anyway.");
      }

      // 5. Broadcast in-app messaging to all emergency contacts
      await broadcastSOS(lat, lng);
      
      alert("SOS Sent Successfully to Hardware & Contacts!");

    } catch (error) {
      console.error(error);
      alert("Error sending SOS signal.");
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
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          {isAlerting ? (
            <AlertCircle color={COLORS.error} size={20} />
          ) : (
            <ShieldCheck color={COLORS.success} size={20} />
          )}
          <Text style={[styles.statusText, { color: isAlerting ? COLORS.error : COLORS.success }]}>
            {isAlerting ? 'Broadcasting SOS' : 'Environment: Protected'}
          </Text>
        </View>
      </View>

      <View style={styles.centerSection}>
        <View style={styles.sosContainer}>
          <Animated.View 
            style={[
              styles.pulseRing, 
              { transform: [{ scale: pulseAnim }], opacity: opacityAnim }
            ]} 
          />
          <TouchableOpacity
            style={[styles.sosButton, isAlerting && styles.sosButtonActive]}
            onLongPress={handleSOS}
            onPress={isAlerting ? stopSOS : null}
            activeOpacity={0.9}
          >
            <Text style={styles.sosText}>{isAlerting ? 'STOP' : 'SOS'}</Text>
            {!isAlerting && <Text style={styles.sosSubtext}>Hold 1s for Emergency</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Safety Broadcast System</Text>
          <Text style={styles.infoDesc}>
            {isAlerting 
              ? "All contacts have been notified with your live coordinates."
              : "Press and hold the SOS button to alert your 10 contacts and ESP32 hardware."}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.quickButton}
          onPress={() => navigation.navigate('ChatTab')}
        >
          <Text style={styles.quickButtonText}>View Chat Threads</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    ...SHADOWS.light,
  },
  statusText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosContainer: {
    width: SIZES.sosButton,
    height: SIZES.sosButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: SIZES.sosButton,
    height: SIZES.sosButton,
    borderRadius: SIZES.sosButton / 2,
    backgroundColor: COLORS.primary,
  },
  sosButton: {
    width: SIZES.sosButton * 0.8,
    height: SIZES.sosButton * 0.8,
    borderRadius: (SIZES.sosButton * 0.8) / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    zIndex: 1,
  },
  sosButtonActive: {
    backgroundColor: COLORS.surface,
    borderWidth: 4,
    borderColor: COLORS.error,
  },
  sosText: {
    color: COLORS.white,
    fontSize: 48,
    fontWeight: '900',
  },
  sosSubtext: {
    color: COLORS.white,
    fontSize: 10,
    marginTop: 4,
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  quickButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickButtonText: {
    color: COLORS.text,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default HomeScreen;

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Vibration, SafeAreaView, Animated } from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/Theme';
import { AlertCircle, ShieldCheck } from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
  const { isAlerting, triggerSOS, setIsAlerting } = useApp();
  
  // Using standard Animated API for stability
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Continuous pulse animation
    const pulseSequence = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseSequence.start();

    return () => pulseSequence.stop();
  }, [pulseAnim, opacityAnim]);

  const handleSOS = () => {
    Vibration.vibrate([0, 500, 200, 500], true);
    triggerSOS();
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
            {isAlerting ? 'Alerting Authorities' : 'System: Safe'}
          </Text>
        </View>
      </View>

      <View style={styles.centerSection}>
        <View style={styles.sosContainer}>
          <Animated.View 
            style={[
              styles.pulseRing, 
              { 
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim 
              }
            ]} 
          />
          <TouchableOpacity
            style={[styles.sosButton, isAlerting && styles.sosButtonActive]}
            onLongPress={handleSOS}
            onPress={isAlerting ? stopSOS : null}
            activeOpacity={0.9}
          >
            <Text style={styles.sosText}>{isAlerting ? 'STOP' : 'SOS'}</Text>
            {!isAlerting && <Text style={styles.sosSubtext}>Long press to trigger</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.quickButton}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Text style={styles.quickButtonText}>Manage Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.quickButtonText}>Open Chat</Text>
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

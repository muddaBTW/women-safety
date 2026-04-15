import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  Animated,
  StatusBar,
} from 'react-native';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { Lock, Mail, ChevronRight, Shield, Globe } from 'lucide-react-native';

const LoginScreen = ({ navigation, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [buttonScale] = useState(new Animated.Value(1));

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.94, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => onLogin());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <Pressable onPress={Keyboard.dismiss} style={styles.inner}>
        
        {/* Cinematic Brand Header */}
        <View style={styles.brandSection}>
          <View style={styles.glowAura} />
          <View style={styles.iconCircle}>
            <Shield color={COLORS.primary} size={42} strokeWidth={1.5} />
          </View>
          <Text style={styles.brandTitle}>SafeGuard</Text>
          <Text style={styles.brandSubtitle}>ADVANCED SAFETY SYSTEMS</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Secure Sign In</Text>
            <Text style={styles.subtitle}>Authentication protocol required</Text>
          </View>

          {/* Minimalist Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputField}>
                <Mail color={COLORS.textMuted} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputField}>
                <Lock color={COLORS.textMuted} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 20 }}>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={animateButton}
                activeOpacity={0.9}
              >
                <Text style={styles.btnText}>INITIALIZE SESSION</Text>
                <ChevronRight color={COLORS.white} size={20} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>First time here? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerLink}>Request Access</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomMeta}>
          <Globe color="rgba(255,255,255,0.1)" size={14} />
          <Text style={styles.metaText}>ENCRYPTED CONNECTION ACTIVE</Text>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  glowAura: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
    top: -30,
    ...Platform.select({ web: { filter: 'blur(40px)' } })
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 64, 0.2)',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({ web: { boxShadow: '0 0 20px rgba(255, 0, 64, 0.2)' } })
  },
  btnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  bottomMeta: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
});

export default LoginScreen;

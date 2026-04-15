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
  StatusBar,
} from 'react-native';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { Lock, Mail, User, ChevronRight, ArrowLeft } from 'lucide-react-native';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <Pressable onPress={Keyboard.dismiss} style={styles.inner}>
        
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft color={COLORS.textSecondary} size={24} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.subtitle}>ESTABLISHING SECURITY PARAMETERS</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputField}>
              <User color={COLORS.textMuted} size={18} />
              <TextInput
                style={styles.input}
                placeholder="Ex. Jane Doe"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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
            <Text style={styles.inputLabel}>PROTECTION KEY</Text>
            <View style={styles.inputField}>
              <Lock color={COLORS.textMuted} size={18} />
              <TextInput
                style={styles.input}
                placeholder="REQUIRED"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <Text style={styles.btnText}>REGISTER DEVICE</Text>
            <ChevronRight color={COLORS.white} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already secured? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Initialize Login</Text>
          </TouchableOpacity>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    padding: 10,
    zIndex: 10,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '800',
    letterSpacing: 2,
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
    marginTop: 10,
    gap: 8,
    ...Platform.select({ web: { boxShadow: '0 0 20px rgba(255, 0, 64, 0.2)' } })
  },
  btnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
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
});

export default SignupScreen;

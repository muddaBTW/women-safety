import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { getEspIp, setEspIp, pingEsp, DEFAULT_ESP_IP_VALUE } from '../../constants/Config';
import { Settings, Wifi, WifiOff, RefreshCw, Check, X, Cpu, Send, Info, ChevronRight } from 'lucide-react-native';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
};

const SettingsScreen = () => {
  const { espConnected, espSynced, checkEspConnection, syncContactsToEsp, contacts } = useApp();
  const [ipInput, setIpInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | 'success' | 'fail'

  useEffect(() => {
    loadIp();
  }, []);

  const loadIp = async () => {
    const ip = await getEspIp();
    setIpInput(ip);
  };

  const handleSaveIp = async () => {
    if (!ipInput.trim()) {
      showAlert('Error', 'Please enter an IP address.');
      return;
    }
    const saved = await setEspIp(ipInput);
    setIpInput(saved);
    setTestResult(null);
    await checkEspConnection();
    showAlert('Saved', `ESP32 IP updated to ${saved}`);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    await setEspIp(ipInput.trim());
    const result = await pingEsp();
    setTesting(false);
    setTestResult(result ? 'success' : 'fail');
    await checkEspConnection();
  };

  const handleSyncContacts = async () => {
    if (!espConnected) {
      showAlert('Offline', 'Cannot sync — ESP32 is not reachable.');
      return;
    }
    setSyncing(true);
    const result = await syncContactsToEsp(contacts);
    setSyncing(false);
    if (result) {
      showAlert('Synced', `${contacts.length} contacts pushed to ESP32.`);
    } else {
      showAlert('Failed', 'Could not sync contacts to ESP32.');
    }
  };

  const handleResetIp = async () => {
    setIpInput(DEFAULT_ESP_IP_VALUE);
    await setEspIp(DEFAULT_ESP_IP_VALUE);
    setTestResult(null);
    await checkEspConnection();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Configuration</Text>
          <Text style={styles.subtitle}>HARDWARE & NETWORK SETTINGS</Text>
        </View>

        {/* Status Dashboard */}
        <View style={styles.statusGrid}>
          <View style={[styles.statusItem, espConnected ? styles.statusItemOnline : styles.statusItemOffline]}>
            <View style={styles.statusHeader}>
              <Cpu color={espConnected ? COLORS.success : COLORS.textMuted} size={16} />
              <Text style={styles.statusLabel}>HARDWARE</Text>
            </View>
            <Text style={styles.statusValue}>{espConnected ? 'LINKED' : 'OFFLINE'}</Text>
          </View>

          <View style={[styles.statusItem, espSynced ? styles.statusItemOnline : styles.statusItemOffline]}>
            <View style={styles.statusHeader}>
              <RefreshCw color={espSynced ? COLORS.accent : COLORS.textMuted} size={16} />
              <Text style={styles.statusLabel}>SYNC</Text>
            </View>
            <Text style={styles.statusValue}>{espSynced ? 'CURRENT' : 'PENDING'}</Text>
          </View>
        </View>

        {/* IP Config Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>NETWORK PARAMETERS</Text>
          </View>
          
          <View style={styles.ipContainer}>
            <TextInput
              style={styles.ipInput}
              value={ipInput}
              onChangeText={(text) => { setIpInput(text); setTestResult(null); }}
              placeholder="0.0.0.0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
            {testResult && (
              <View style={[styles.testIcon, testResult === 'success' ? styles.testSuccess : styles.testFail]}>
                {testResult === 'success' ? <Check color={COLORS.success} size={14} /> : <X color={COLORS.error} size={14} />}
              </View>
            )}
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={handleTestConnection} disabled={testing}>
              {testing ? <ActivityIndicator size="small" color={COLORS.text} /> : <RefreshCw color={COLORS.text} size={14} />}
              <Text style={styles.actionBtnText}>PING</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleSaveIp}>
              <Text style={styles.actionBtnTextPrimary}>SAVE CONFIG</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleResetIp} style={styles.resetLink}>
            <Text style={styles.resetLinkText}>Reset to default system IP</Text>
          </TouchableOpacity>
        </View>

        {/* Sync Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>DATA SYNCHRONIZATION</Text>
          </View>
          <Text style={styles.sectionDesc}>Push guardian directory ({contacts.length} entries) to hardware memory.</Text>
          
          <TouchableOpacity
            style={[styles.syncBtn, !espConnected && styles.syncBtnDisabled]}
            onPress={handleSyncContacts}
            disabled={syncing || !espConnected}
            activeOpacity={0.8}
          >
            {syncing ? <ActivityIndicator color={COLORS.white} /> : <Send color={COLORS.white} size={18} />}
            <Text style={styles.syncBtnText}>PUSH TO HARDWARE</Text>
          </TouchableOpacity>
        </View>

        {/* Documentation */}
        <View style={styles.docSection}>
          <View style={styles.docItem}>
            <Info color={COLORS.textMuted} size={14} />
            <Text style={styles.docText}>Ensure devices share the same 2.4GHz network.</Text>
          </View>
          <View style={styles.docItem}>
            <Info color={COLORS.textMuted} size={14} />
            <Text style={styles.docText}>Static IP 192.168.4.1 is used for AP mode.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>SAFEGUARD PROTOCOL V3.0.0</Text>
          <Text style={styles.versionSubtext}>ENCRYPTED • ANONYMOUS • SECURE</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },
  header: { padding: SPACING.xl, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: -1 },
  subtitle: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '800', letterSpacing: 2, marginTop: 4 },
  
  statusGrid: { flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: 12, marginBottom: 30 },
  statusItem: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  statusItemOnline: { borderColor: 'rgba(48, 209, 88, 0.2)' },
  statusItemOffline: { borderColor: 'rgba(255, 69, 58, 0.2)' },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statusLabel: { fontSize: 9, fontWeight: '900', color: COLORS.textMuted, letterSpacing: 1 },
  statusValue: { fontSize: 16, fontWeight: '800', color: COLORS.text },

  section: { marginHorizontal: SPACING.xl, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  sectionHeader: { marginBottom: 16 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textSecondary, letterSpacing: 1.5 },
  sectionDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 20 },
  
  ipContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  ipInput: { flex: 1, height: 50, backgroundColor: COLORS.background, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, fontSize: 16, paddingHorizontal: 16, fontVariant: ['tabular-nums'] },
  testIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  testSuccess: { backgroundColor: 'rgba(48, 209, 88, 0.1)' },
  testFail: { backgroundColor: 'rgba(255, 69, 58, 0.1)' },

  actionGrid: { flexDirection: 'row', gap: 10 },
  actionBtnOutline: { flex: 1, height: 48, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.borderLight, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
  actionBtnPrimary: { flex: 2, height: 48, borderRadius: RADIUS.sm, backgroundColor: COLORS.text, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  actionBtnTextPrimary: { color: COLORS.background, fontSize: 12, fontWeight: '800' },
  resetLink: { marginTop: 16, alignItems: 'center' },
  resetLinkText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },

  syncBtn: { height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.secondary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  syncBtnDisabled: { backgroundColor: COLORS.textMuted, opacity: 0.5 },
  syncBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  docSection: { paddingHorizontal: SPACING.xl, marginTop: 10, gap: 12 },
  docItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },

  footer: { marginTop: 60, alignItems: 'center', gap: 4 },
  versionText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  versionSubtext: { color: 'rgba(255,255,255,0.05)', fontSize: 9, fontWeight: '700' },
});

export default SettingsScreen;

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, RADIUS, SHADOWS } from '../../constants/Theme';
import { 
  Users, Plus, Trash2, Star, Phone, 
  X, UserPlus, ShieldAlert, ChevronRight 
} from 'lucide-react-native';

const ContactsScreen = () => {
  const { contacts, addContact, removeContact, toggleEmergency } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!name || !phone) {
      setError('Please fill in all fields');
      return;
    }
    const result = await addContact({ name, phone });
    if (result.success) {
      resetForm();
    } else {
      setError(result.message);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setError('');
    setModalVisible(false);
  };

  const renderContact = ({ item }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <View style={[styles.avatar, item.isEmergency && styles.avatarEmergency]}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => toggleEmergency(item.id)}
          style={[styles.actionBtn, item.isEmergency && styles.emergencyBtnActive]}
        >
          <Star 
            color={item.isEmergency ? COLORS.warning : COLORS.textMuted} 
            size={18} 
            fill={item.isEmergency ? COLORS.warning : 'transparent'} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => removeContact(item.id)}
          style={styles.actionBtn}
        >
          <Trash2 color={COLORS.error} size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Guardian Circle</Text>
          <Text style={styles.subtitle}>{contacts.length} emergency contacts secured</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtnHeader} 
          onPress={() => setModalVisible(true)}
        >
          <Plus color={COLORS.text} size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Users color={COLORS.textMuted} size={48} strokeWidth={1} />
            </View>
            <Text style={styles.emptyTitle}>Your circle is empty</Text>
            <Text style={styles.emptyDesc}>Add people who should be notified when you trigger an SOS.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyAddBtnText}>Add First Contact</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Guardian</Text>
              <TouchableOpacity onPress={resetForm} style={styles.closeBtn}>
                <X color={COLORS.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex. Mom"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor={COLORS.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.disclaimer}>
                <ShieldAlert color={COLORS.textMuted} size={14} />
                <Text style={styles.disclaimerText}>This contact will receive SOS alerts and live updates.</Text>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
                <Text style={styles.submitBtnText}>SECURE CONTACT</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    padding: SPACING.xl,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  addBtnHeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  list: {
    padding: SPACING.xl,
    paddingTop: 0,
    paddingBottom: 100,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarEmergency: {
    borderColor: COLORS.warning,
    borderWidth: 1.5,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  details: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  phone: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emergencyBtnActive: {
    backgroundColor: 'rgba(255, 214, 10, 0.05)',
    borderColor: 'rgba(255, 214, 10, 0.2)',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  emptyAddBtn: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
  },
  emptyAddBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingTop: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    gap: 20,
    paddingBottom: 40,
  },
  inputWrap: { gap: 8 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  input: {
    backgroundColor: COLORS.background,
    height: 56,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: { color: COLORS.error, fontSize: 12, fontWeight: '600' },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  disclaimerText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...Platform.select({ web: { boxShadow: '0 0 20px rgba(255, 0, 64, 0.2)' } })
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default ContactsScreen;

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/Theme';
import { UserPlus, Trash2, X, Phone } from 'lucide-react-native';

const ContactsScreen = () => {
  const { contacts, addContact, removeContact } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = () => {
    if (name && phone) {
      addContact({ name, phone });
      setName('');
      setPhone('');
      setModalVisible(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
      </View>
      <TouchableOpacity 
        onPress={() => removeContact(item.id)}
        style={styles.deleteButton}
      >
        <Trash2 color={COLORS.error} size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>{contacts.length}/5 Priority Contacts</Text>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contacts added yet.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, contacts.length >= 5 && styles.fabDisabled]}
        onPress={() => contacts.length < 5 && setModalVisible(true)}
        disabled={contacts.length >= 5}
      >
        <UserPlus color={COLORS.white} size={24} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Contact</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={COLORS.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 234 567 890"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Save Contact</Text>
            </TouchableOpacity>
          </View>
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
    padding: SPACING.xl,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactName: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  contactPhone: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption,
    marginTop: 2,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  fabDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontSize: SIZES.caption,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: SPACING.md,
    color: COLORS.white,
    fontSize: SIZES.body,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
});

export default ContactsScreen;

import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getEspBaseUrl, pingEsp } from '../constants/Config';
import LiveLocationService from '../services/LiveLocation';

const AppContext = createContext();

const SEED_CONTACTS = [
  { id: '1', name: 'Mom', phone: '+919876543210', isEmergency: true },
  { id: '2', name: 'Dad', phone: '+918765432109', isEmergency: true },
  { id: '3', name: 'Emergency Services', phone: '112', isEmergency: true },
];

const AUTO_REPLIES = [
  "Stay safe! I'm tracking your location.",
  "On my way to help. Keep your phone on.",
  "I've alerted the nearby police station.",
  "Are you okay? Please respond when you can.",
  "I can see your location. Help is coming.",
  "Stay calm, I'm coordinating with others.",
  "Received your update. Sending help now.",
  "Keep sharing your location. We're close.",
];

export const AppProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [messagesMap, setMessagesMap] = useState({});
  const [isAlerting, setIsAlerting] = useState(false);
  const [unreadMap, setUnreadMap] = useState({});
  const [espConnected, setEspConnected] = useState(false);
  const [espSynced, setEspSynced] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const syncIntervalRef = useRef(null);
  const messagesMapRef = useRef(messagesMap);
  const contactsRef = useRef(contacts);

  // Keep refs in sync
  useEffect(() => {
    messagesMapRef.current = messagesMap;
  }, [messagesMap]);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  useEffect(() => {
    loadData();
    loadFeatureSettings();
    checkEspConnection();

    syncIntervalRef.current = setInterval(checkEspConnection, 30000);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      LiveLocationService.stop();
    };
  }, []);

  useEffect(() => {
    if (contacts.length > 0 && espConnected) {
      syncContactsToEsp(contacts);
    }
  }, [espConnected]);

  const checkEspConnection = async () => {
    const connected = await pingEsp();
    setEspConnected(connected);
    if (!connected) setEspSynced(false);
  };

  const loadData = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('contacts');
      const savedMessages = await AsyncStorage.getItem('messagesMap');
      const savedUnread = await AsyncStorage.getItem('unreadMap');

      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      } else {
        setContacts(SEED_CONTACTS);
        await AsyncStorage.setItem('contacts', JSON.stringify(SEED_CONTACTS));
      }

      if (savedMessages) setMessagesMap(JSON.parse(savedMessages));
      if (savedUnread) setUnreadMap(JSON.parse(savedUnread));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const loadFeatureSettings = async () => {
    try {
      const shake = await AsyncStorage.getItem('shakeEnabled');
      const voice = await AsyncStorage.getItem('voiceEnabled');
      if (shake !== null) setShakeEnabled(JSON.parse(shake));
      if (voice !== null) setVoiceEnabled(JSON.parse(voice));
    } catch (e) {
      console.error('Failed to load feature settings', e);
    }
  };

  const saveFeatureSetting = async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const updateShakeEnabled = async (enabled) => {
    setShakeEnabled(enabled);
    await saveFeatureSetting('shakeEnabled', enabled);
  };

  const updateVoiceEnabled = async (enabled) => {
    setVoiceEnabled(enabled);
    await saveFeatureSetting('voiceEnabled', enabled);
  };

  // ===== ESP32 SYNC =====

  const syncContactsToEsp = async (contactList) => {
    try {
      const baseUrl = await getEspBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const phoneNumbers = contactList
        .filter(c => c.isEmergency)
        .map(c => c.phone.replace(/\s+/g, ''))
        .filter(p => p.length >= 10);

      const response = await fetch(`${baseUrl}/contacts/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `contacts=${encodeURIComponent(JSON.stringify(phoneNumbers))}`,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setEspSynced(true);
        return true;
      }
      return false;
    } catch (e) {
      // Silently fail if hardware not reachable
      setEspSynced(false);
      return false;
    }
  };

  const addContactToEsp = async (phone) => {
    try {
      const baseUrl = await getEspBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const cleanPhone = phone.replace(/\s+/g, '');
      const response = await fetch(`${baseUrl}/contacts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `phone=${encodeURIComponent(cleanPhone)}`,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch { return false; }
  };

  const removeContactFromEsp = async (phone) => {
    try {
      const baseUrl = await getEspBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const cleanPhone = phone.replace(/\s+/g, '');
      const response = await fetch(`${baseUrl}/contacts/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `phone=${encodeURIComponent(cleanPhone)}`,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch { return false; }
  };

  // ===== CONTACTS =====

  const addContact = async (contact) => {
    if (contacts.length >= 10) {
      return { success: false, message: 'Maximum 10 contacts allowed.' };
    }

    const cleanPhone = contact.phone.replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, message: 'Please enter a valid phone number (at least 10 digits).' };
    }

    const isDuplicate = contacts.some(c => c.phone.replace(/\s+/g, '') === cleanPhone);
    if (isDuplicate) {
      return { success: false, message: 'This phone number is already in your contacts.' };
    }

    const newContact = { ...contact, phone: cleanPhone, id: Date.now().toString(), isEmergency: true };
    const newContacts = [...contacts, newContact];
    setContacts(newContacts);
    await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));

    const welcomeMsg = {
      id: `welcome-${newContact.id}`,
      text: `Chat thread created with ${newContact.name}. You can send safety updates here.`,
      type: 'system',
      timestamp: new Date().toISOString(),
    };
    const newMessagesMap = { ...messagesMap, [newContact.id]: [welcomeMsg] };
    setMessagesMap(newMessagesMap);
    await AsyncStorage.setItem('messagesMap', JSON.stringify(newMessagesMap));

    const espResult = await addContactToEsp(cleanPhone);
    if (!espResult && espConnected) await syncContactsToEsp(newContacts);

    return { success: true, espSynced: espResult };
  };

  const removeContact = async (id) => {
    const contactToRemove = contacts.find(c => c.id === id);
    const newContacts = contacts.filter(c => c.id !== id);
    setContacts(newContacts);
    await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));

    const newMessagesMap = { ...messagesMap };
    delete newMessagesMap[id];
    setMessagesMap(newMessagesMap);
    await AsyncStorage.setItem('messagesMap', JSON.stringify(newMessagesMap));

    if (contactToRemove) {
      const espResult = await removeContactFromEsp(contactToRemove.phone);
      if (!espResult && espConnected) await syncContactsToEsp(newContacts);
    }
  };

  const toggleEmergency = async (id) => {
    const newContacts = contacts.map(c =>
      c.id === id ? { ...c, isEmergency: !c.isEmergency } : c
    );
    setContacts(newContacts);
    await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));
    await syncContactsToEsp(newContacts);
  };

  // ===== MESSAGING =====

  const addMessage = async (contactId, text, type = 'user') => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date().toISOString(),
    };

    const currentMessages = messagesMap[contactId] || [];
    const newMessagesMap = { ...messagesMap, [contactId]: [newMessage, ...currentMessages] };

    setMessagesMap(newMessagesMap);
    await AsyncStorage.setItem('messagesMap', JSON.stringify(newMessagesMap));

    if (type === 'user') {
      setTimeout(async () => {
        const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        const replyMessage = {
          id: (Date.now() + 1).toString(),
          text: reply,
          type: 'received',
          timestamp: new Date().toISOString(),
        };

        setMessagesMap(prev => {
          const updated = { ...prev, [contactId]: [replyMessage, ...(prev[contactId] || [])] };
          AsyncStorage.setItem('messagesMap', JSON.stringify(updated));
          return updated;
        });

        setUnreadMap(prev => {
          const updated = { ...prev, [contactId]: (prev[contactId] || 0) + 1 };
          AsyncStorage.setItem('unreadMap', JSON.stringify(updated));
          return updated;
        });
      }, 1500 + Math.random() * 2000);
    }
  };

  const addMediaMessage = async (contactId, uri, type = 'image') => {
    const newMessage = {
      id: `media-${Date.now()}`,
      uri,
      type, // 'image'
      timestamp: new Date().toISOString(),
      text: type === 'image' ? 'Sent a photo evidence.' : 'Sent a recording.',
    };

    setMessagesMap(prev => {
      const updated = { ...prev, [contactId]: [newMessage, ...(prev[contactId] || [])] };
      AsyncStorage.setItem('messagesMap', JSON.stringify(updated));
      return updated;
    });
  };

  const clearUnread = useCallback(async (contactId) => {
    setUnreadMap(prev => {
      const updated = { ...prev, [contactId]: 0 };
      AsyncStorage.setItem('unreadMap', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ===== LIVE LOCATION =====

  const startLiveTracking = () => {
    setIsLiveTracking(true);

    LiveLocationService.start((lat, lng) => {
      // Send location update to all emergency contacts' chat threads
      const locationMsg = {
        id: `loc-${Date.now()}`,
        text: `📍 Live location update\nhttps://www.google.com/maps?q=${lat},${lng}`,
        type: 'system',
        timestamp: new Date().toISOString(),
      };

      setMessagesMap(prev => {
        const updated = { ...prev };
        const emergencyContacts = contactsRef.current.filter(c => c.isEmergency);
        emergencyContacts.forEach(contact => {
          updated[contact.id] = [locationMsg, ...(updated[contact.id] || [])];
        });
        AsyncStorage.setItem('messagesMap', JSON.stringify(updated));
        return updated;
      });
    });
  };

  const stopLiveTracking = () => {
    LiveLocationService.stop();
    setIsLiveTracking(false);
  };

  // ===== SOS =====

  const triggerEspSOS = async (lat, lng) => {
    try {
      const baseUrl = await getEspBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${baseUrl}/sos?lat=${lat}&lng=${lng}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      // Fail silently for hardware SOS
      return false;
    }
  };

  const broadcastSOS = async (lat, lng) => {
    setIsAlerting(true);
    const sosMessage = `🚨 SOS ALERT! I need help!\nMy location: https://www.google.com/maps?q=${lat},${lng}`;

    const newMessagesMap = { ...messagesMap };
    const emergencyContacts = contacts.filter(c => c.isEmergency);

    emergencyContacts.forEach(contact => {
      const sosMsg = {
        id: `sos-${Date.now()}-${contact.id}`,
        text: sosMessage,
        type: 'emergency',
        timestamp: new Date().toISOString(),
        location: { lat, lng },
        mapUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`,
        staticMapUrl: `https://staticmap.thismoment.de/?center=${lat},${lng}&zoom=15&size=600x300&markers=${lat},${lng},red-dot`,
      };
      const currentMessages = newMessagesMap[contact.id] || [];
      newMessagesMap[contact.id] = [sosMsg, ...currentMessages];
    });

    setMessagesMap(newMessagesMap);
    await AsyncStorage.setItem('messagesMap', JSON.stringify(newMessagesMap));

    // Start live location tracking automatically
    startLiveTracking();
  };

  return (
    <AppContext.Provider
      value={{
        contacts,
        addContact,
        removeContact,
        toggleEmergency,
        messagesMap,
        addMessage,
        addMediaMessage,
        isAlerting,
        setIsAlerting,
        broadcastSOS,
        triggerEspSOS,
        unreadMap,
        clearUnread,
        espConnected,
        espSynced,
        checkEspConnection,
        syncContactsToEsp,
        isLiveTracking,
        startLiveTracking,
        stopLiveTracking,
        shakeEnabled,
        updateShakeEnabled,
        voiceEnabled,
        updateVoiceEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

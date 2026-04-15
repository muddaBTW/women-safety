import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const SEED_CONTACTS = [
  { id: '1', name: 'Mom', phone: '+91 98765 43210', isEmergency: true },
  { id: '2', name: 'Dad', phone: '+91 87654 32109', isEmergency: true },
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

  useEffect(() => {
    loadData();
  }, []);

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

      if (savedMessages) {
        setMessagesMap(JSON.parse(savedMessages));
      }

      if (savedUnread) {
        setUnreadMap(JSON.parse(savedUnread));
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const addContact = async (contact) => {
    if (contacts.length >= 10) {
      alert('Maximum 10 contacts allowed.');
      return;
    }
    const newContact = { ...contact, id: Date.now().toString(), isEmergency: true };
    const newContacts = [...contacts, newContact];
    setContacts(newContacts);
    await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));

    // Create a welcome message in the chat for this new contact
    const welcomeMsg = {
      id: `welcome-${newContact.id}`,
      text: `Chat thread created with ${newContact.name}. You can send safety updates here.`,
      type: 'system',
      timestamp: new Date().toISOString(),
    };
    const newMessagesMap = {
      ...messagesMap,
      [newContact.id]: [welcomeMsg],
    };
    setMessagesMap(newMessagesMap);
    await AsyncStorage.setItem('messagesMap', JSON.stringify(newMessagesMap));
  };

  const removeContact = async (id) => {
    const newContacts = contacts.filter((c) => c.id !== id);
    setContacts(newContacts);
    await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));

    // Also clean up messages
    const newMessagesMap = { ...messagesMap };
    delete newMessagesMap[id];
    setMessagesMap(newMessagesMap);
    await AsyncStorage.setItem('messagesMap', JSON.stringify(newMessagesMap));
  };

  const addMessage = async (contactId, text, type = 'user') => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date().toISOString(),
    };

    const currentMessages = messagesMap[contactId] || [];
    const newMessagesMap = {
      ...messagesMap,
      [contactId]: [newMessage, ...currentMessages],
    };

    setMessagesMap(newMessagesMap);
    await AsyncStorage.setItem('messagesMap', JSON.stringify(newMessagesMap));

    // Simulate auto-reply from contact after a delay (only for user messages)
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
          const updated = {
            ...prev,
            [contactId]: [replyMessage, ...(prev[contactId] || [])],
          };
          AsyncStorage.setItem('messagesMap', JSON.stringify(updated));
          return updated;
        });

        // Mark as unread
        setUnreadMap(prev => {
          const updated = { ...prev, [contactId]: (prev[contactId] || 0) + 1 };
          AsyncStorage.setItem('unreadMap', JSON.stringify(updated));
          return updated;
        });
      }, 1500 + Math.random() * 2000);
    }
  };

  const clearUnread = useCallback(async (contactId) => {
    setUnreadMap(prev => {
      const updated = { ...prev, [contactId]: 0 };
      AsyncStorage.setItem('unreadMap', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const broadcastSOS = async (lat, lng) => {
    setIsAlerting(true);
    const sosMessage = `🚨 SOS ALERT! I need help!\nMy location: https://www.google.com/maps?q=${lat},${lng}`;
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=color:red%7C${lat},${lng}&style=feature:all|element:geometry|color:0x242f3e&style=feature:all|element:labels.text.stroke|color:0x242f3e&style=feature:all|element:labels.text.fill|color:0x746855&key=YOUR_API_KEY`;

    const newMessagesMap = { ...messagesMap };

    contacts.forEach(contact => {
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
  };

  return (
    <AppContext.Provider
      value={{
        contacts,
        addContact,
        removeContact,
        messagesMap,
        addMessage,
        isAlerting,
        setIsAlerting,
        broadcastSOS,
        unreadMap,
        clearUnread,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

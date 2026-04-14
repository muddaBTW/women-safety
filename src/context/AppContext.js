import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const SEED_CONTACTS = [
  { id: '1', name: 'Mom', phone: '1234567890', isEmergency: true },
  { id: '2', name: 'Dad', phone: '0987654321', isEmergency: true },
  { id: '3', name: 'Emergency Services', phone: '911', isEmergency: true },
];

export const AppProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [messagesMap, setMessagesMap] = useState({}); // { contactId: [messages] }
  const [isAlerting, setIsAlerting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('contacts');
      const savedMessages = await AsyncStorage.getItem('messagesMap');
      
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      } else {
        // First launch: use seed data
        setContacts(SEED_CONTACTS);
        await AsyncStorage.setItem('contacts', JSON.stringify(SEED_CONTACTS));
      }

      if (savedMessages) {
        setMessagesMap(JSON.parse(savedMessages));
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const addContact = async (contact) => {
    if (contacts.length >= 10) { // Increased limit for general contacts
      alert('Maximum contacts reached.');
      return;
    }
    const newContacts = [...contacts, { ...contact, id: Date.now().toString() }];
    setContacts(newContacts);
    await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));
  };

  const removeContact = async (id) => {
    const newContacts = contacts.filter((c) => c.id !== id);
    setContacts(newContacts);
    await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));
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
  };

  const broadcastSOS = async (lat, lng) => {
    setIsAlerting(true);
    const sosMessage = `SOS Triggered! My location: https://www.google.com/maps?q=${lat},${lng}`;
    
    const newMessagesMap = { ...messagesMap };
    
    contacts.forEach(contact => {
      const newMessage = {
        id: `sos-${Date.now()}-${contact.id}`,
        text: sosMessage,
        type: 'emergency',
        timestamp: new Date().toISOString(),
      };
      const currentMessages = newMessagesMap[contact.id] || [];
      newMessagesMap[contact.id] = [newMessage, ...currentMessages];
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

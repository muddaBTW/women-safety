import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isAlerting, setIsAlerting] = useState(false);

  // Load data on startup
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('contacts');
      const savedMessages = await AsyncStorage.getItem('messages');
      if (savedContacts) setContacts(JSON.parse(savedContacts));
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const addContact = async (contact) => {
    if (contacts.length >= 5) {
      alert('You can only have up to 5 emergency contacts.');
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

  const addMessage = async (text, type = 'system') => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [newMessage, ...messages];
    setMessages(newMessages);
    await AsyncStorage.setItem('messages', JSON.stringify(newMessages));
  };

  const triggerSOS = async () => {
    setIsAlerting(true);
    await addMessage('SOS triggered', 'system');
    
    // Placeholder for ESP32 API Call
    // try {
    //   await fetch("http://ESP32_IP/sos");
    // } catch (e) { console.error("ESP32 Connection Error", e); }

    // Placeholder for GPS Location
    // console.log("Preparing to get location...");
  };

  return (
    <AppContext.Provider
      value={{
        contacts,
        addContact,
        removeContact,
        messages,
        addMessage,
        isAlerting,
        setIsAlerting,
        triggerSOS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

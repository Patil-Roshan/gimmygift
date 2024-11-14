import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

type Contact = {};

const contactsInstance = create(
  persist(
    set => ({
      userContacts: [],
      setUserContacts: (contacts: Contact | null) =>
        set({userContacts: contacts}),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default contactsInstance;

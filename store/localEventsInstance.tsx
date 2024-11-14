import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

type Event = [];

const localInstance = create(
  persist(
    set => ({
      localEvents: [],
      setLocalEvents: (data: Event | null) => set({localEvents: data}),
    }),
    {
      name: 'event-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default localInstance;

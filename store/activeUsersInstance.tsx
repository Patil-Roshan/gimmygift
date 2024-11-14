import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

type User = {};

const activeUserInstance = create(
  persist(
    set => ({
      activeUsers: [],
      setActiveUsers: (userData: User | null) => set({activeUsers: userData}),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default activeUserInstance;

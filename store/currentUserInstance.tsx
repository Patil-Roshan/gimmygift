import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';

type User = {};

const userInstance = create(
  persist(
    set => ({
      user: null,
      setUser: (userData: User | null) => set({user: userData}),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      //   storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default userInstance;

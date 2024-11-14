import {create} from 'zustand';

export const useDataStore = create(set => ({
  recipients: [],
  setRecipients: (recipients: any) => set({recipients}),
}));

import { StoreType } from '../store';

export const messages = (state: StoreType) => {
  // return state.messaging.messages;
  const messages = Object.values(state.messaging.messages)
    .sort((a, b) => {
      if (a.timeAdded < b.timeAdded) return -1;
      if (a.timeAdded > b.timeAdded) return 1;
      return 0;
    });

  return messages;
};

export const isLoading = (state: StoreType) => {
  return state.messaging.loading;
};
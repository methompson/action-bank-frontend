import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import authSlice, { actions as authActions } from './auth';
import messagingSlice, { actions as messagingActions } from './messaging';
import actionBankSlice, { actions as actionBankActions } from './action-bank';

console.log('Store index');

const combinedReducers = combineReducers({
  auth: authSlice.reducer,
  messaging: messagingSlice.reducer,
  actionBank: actionBankSlice.reducer,
});

const store = configureStore({ reducer: combinedReducers });

const state = store.getState();
export type StoreType = typeof state;

const actions = {
  ...authActions,
  ...messagingActions,
  ...actionBankActions,
};

export {
  actions,
};

export default store;
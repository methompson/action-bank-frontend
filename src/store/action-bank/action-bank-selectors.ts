import { StoreType } from '../store';
import { Exchange } from './action-bank-types';

export const exchanges = (state: StoreType) => {
  const exDat = state.actionBank.exchanges;

  const exchanges: Exchange[] = [];
  for (const el of Object.values(exDat)) {
    exchanges.push(Exchange.fromExchangeData(el));
  }

  return exchanges;
};

export const lastExchangeQuery = (state: StoreType) => state.actionBank.lastTimeRetrieved;

export const depositActionStatus = (state: StoreType) => state.actionBank.depositActionRequest;
export const withdrawalActionStatus = (state: StoreType) => state.actionBank.withdrawalActionRequest;

export const depositStatus = (state: StoreType) => state.actionBank.depositRequest;
export const withdrawalStatus = (state: StoreType) => state.actionBank.withdrawalRequest;

export const getExchangeById = (exchangeId: string) => {
  return (state: StoreType) => {
    return state.actionBank.exchanges[exchangeId];
  };
};

export const getDepositActionById = (depositActionId: string) => {
  return (state: StoreType) => {
    for (const ex of Object.values(state.actionBank.exchanges)) {
      for (const action of ex.depositActions) {
        if (action.id === depositActionId) {
          return action;
        }
      }
    }

    return null;
  };
};
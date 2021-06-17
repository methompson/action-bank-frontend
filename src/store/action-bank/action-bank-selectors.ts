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
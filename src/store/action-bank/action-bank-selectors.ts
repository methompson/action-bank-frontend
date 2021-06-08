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

export const lastExchangeQuery = (state: StoreType) => {
  return state.actionBank.lastTimeRetrieved;
};
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';

import { StoreType } from '../store';

import {
  ActionBankState,
  NewExchange,
  Exchange,
  NewWithdrawalAction,
  WithdrawalAction,
  NewDepositAction,
  DepositAction,
  NewWithdrawal,
  Withdrawal,
  NewDeposit,
  Deposit,
  ExchangeData,
} from './action-bank-types';

const apolloCache = new InMemoryCache();

const makeApolloClient = (authToken: string) => {
  const httpLink = createHttpLink({
    uri: 'http://localhost:3000/api/bank/graphql',
    headers: {
      authorization: `bearer ${authToken}`,
    },
  });

  return new ApolloClient({
    link: httpLink,
    cache: apolloCache,
  });
};

const initialState: ActionBankState = {
  exchanges: {},
  lastTimeRetrieved: -1,
};

const actionBankSlice = createSlice({
  name: 'actionBank',
  initialState: initialState,
  reducers: {
    resetExchanges(state, _) {
      console.log('Reseting Exchanges');
      state.exchanges = {};
      state.lastTimeRetrieved = -1;
    },
    setQueryTime(state, _) {
      console.log('Setting time');
      state.lastTimeRetrieved = new Date().getTime();
    },
    setExchange(state, action: PayloadAction<ExchangeData>) {
      state.exchanges[action.payload.id] = action.payload;
    },
    setMultipleExchanges(state, action: PayloadAction<ExchangeData[]>) {
      console.log('Serialize');
      console.log(JSON.stringify(action.payload));

      state.lastTimeRetrieved = new Date().getTime();

      action.payload.forEach((ex) => {
        state.exchanges[ex.id] = ex;
      });
    },
    deleteExchange(state, action: PayloadAction<string>) {
      delete state.exchanges[action.payload];
    },

    setWithdrawalAction(state, action: PayloadAction<WithdrawalAction>) {},
    deleteWithdrawalAction(state, action: PayloadAction<WithdrawalAction>) {},

    setDepositAction(state, action: PayloadAction<DepositAction>) {},
    deleteDepositAction(state, action: PayloadAction<DepositAction>) {},

    setWithdrawal(state, action: PayloadAction<Withdrawal>) {},
    deleteWithdrawal(state, action: PayloadAction<Withdrawal>) {},

    setDeposit(state, action: PayloadAction<Deposit>) {},
    deleteDeposit(state, action: PayloadAction<Deposit>) {},
  },
});

let queryLock = false;
const getAllExchanges = createAsyncThunk<unknown, undefined, { state: StoreType }>(
  'actionBank/getAllExchanges',
  async(_: unknown, thunkAPI) => {
    if (queryLock) {
      throw new Error('Already Requesting Exchanges');
    }

    queryLock = true;

    console.log('Dispatching getAllExchanges');
    const userId = thunkAPI.getState().auth.userId;

    const query = gql`
      query getExchange {
        getExchangesByUserId(userId: "${userId}") {
          id,
          userId,
          name,
          description,
          totalCurrency,
          depositActions {
            id,
            name,
            uom,
            uomQuantity,
            depositQuantity,
            enabled,
            sortedLocation,
            dateUpdated,
          },
          withdrawalActions {
            id,
            name,
            uom,
            uomQuantity,
            withdrawalQuantity,
            enabled,
            sortedLocation,
            dateUpdated,
          },
          deposits {
            id,
            depositActionId,
            depositActionName,
            uomQuantity,
            depositQuantity,
            quantity,
            dateAdded,
          },
          withdrawals {
            id,
            withdrawalActionId,
            withdrawalActionName,
            uomQuantity,
            withdrawalQuantity,
            quantity,
            dateAdded,
          },
          totalCurrency,
        }
      }
    `;

    const token = thunkAPI.getState().auth.jwt;

    const apolloClient = makeApolloClient(token);

    try {
      const res = await apolloClient.query({
        query,
      });

      console.log('Queried apolloClient');
      const rawExchanges = res.data.getExchangesByUserId;

      if (!Array.isArray(rawExchanges)) {
        throw new Error('Invalid Server Response');
      }

      const exchanges: ExchangeData[] = [];

      for (const ex of rawExchanges) {
        try {
          const exchange = Exchange.fromJSON(ex);

          exchanges.push(exchange.exchangeData);
        } catch(e) {
          console.error('Invalid Exchange', e);
        }
      }

      // thunkAPI.dispatch(actionBankSlice.actions.setQueryTime(null));
      thunkAPI.dispatch(actionBankSlice.actions.setMultipleExchanges(exchanges));
    } catch(e) {
      console.log('Error getting multiple exchanges', e);
    } finally {
      queryLock = false;
    }
  },
);

const addExchange = createAsyncThunk<unknown, NewExchange, { state: StoreType }>(
  'actionBank/addExchange',
  async(dat: NewExchange, thunkAPI) => {
    const query = gql`
      mutation exchange {
        addExchange(
          name: "${dat.name}",
        ) {
          id,
        }
      }
    `;

    const token = thunkAPI.getState().auth.jwt;

    const apolloClient = makeApolloClient(token);

    console.log();

    try {
      const res = await apolloClient.mutate({
        mutation: query,
      });

      const exchangeId = res.data.addExchange.id;

      thunkAPI.dispatch(actionBankSlice.actions.setExchange(Exchange.fromNewExchange(
        exchangeId,
        dat.name,
      )));

      console.log('Added an Exchange!', res);
    } catch (e) {
      console.log(e);
    }
  }
);

const editExchange = createAsyncThunk(
  'actionBank/editExchange',
  async(dat: Exchange, thunkAPI) => {}
);

const deleteExchange = createAsyncThunk(
  'actionBank/deleteExchange',
  async(dat: Exchange, thunkAPI) => {}
);

const addDepositAction = createAsyncThunk(
  'actionBank/addDepositAction',
  async(dat: NewDepositAction, thunkAPI) => {}
);

const editDepositAction = createAsyncThunk(
  'actionBank/editDepositAction',
  async(dat: DepositAction, thunkAPI) => {}
);

const deleteDepositAction = createAsyncThunk(
  'actionBank/deleteDepositAction',
  async(dat: DepositAction, thunkAPI) => {}
);

const addWithdrawalAction = createAsyncThunk(
  'actionBank/addWithdrawalAction',
  async(dat: NewWithdrawalAction, thunkAPI) => {}
);

const editWithdrawalAction = createAsyncThunk(
  'actionBank/editWithdrawalAction',
  async(dat: Withdrawal, thunkAPI) => {}
);

const deleteWithdrawalAction = createAsyncThunk(
  'actionBank/deleteWithdrawalAction',
  async(dat: Withdrawal, thunkAPI) => {}
);

const addDeposit = createAsyncThunk(
  'actionBank/addDeposit',
  async(dat: NewDeposit, thunkAPI) => {}
);

const editDeposit = createAsyncThunk(
  'actionBank/editDeposit',
  async(dat: Deposit, thunkAPI) => {}
);

const deleteDeposit = createAsyncThunk(
  'actionBank/deleteDeposit',
  async(dat: Deposit, thunkAPI) => {}
);

const addWithdrawal = createAsyncThunk(
  'actionBank/addWithdrawal',
  async(dat: NewWithdrawal, thunkAPI) => {}
);

const editWithdrawal = createAsyncThunk(
  'actionBank/editWithdrawal',
  async(dat: Withdrawal, thunkAPI) => {}
);

const deleteWithdrawal = createAsyncThunk(
  'actionBank/deleteWithdrawal',
  async(dat: Withdrawal, thunkAPI) => {}
);

const actions = {
  resetExchanges: actionBankSlice.actions.resetExchanges,
  getAllExchanges,
  addExchange,
  editExchange,
  deleteExchange,
  addDepositAction,
  editDepositAction,
  deleteDepositAction,
  addWithdrawalAction,
  editWithdrawalAction,
  deleteWithdrawalAction,
  addDeposit,
  editDeposit,
  deleteDeposit,
  addWithdrawal,
  editWithdrawal,
  deleteWithdrawal,
};

export { actions };

export default actionBankSlice;
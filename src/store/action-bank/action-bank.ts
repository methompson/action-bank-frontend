import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  ApolloClient,
  InMemoryCache,
  gql,
  createHttpLink,
} from '@apollo/client';

import { StoreType } from '../store';

import {
  RequestStatus,
  RequestStatusType,
  ActionBankState,
  NewExchange,
  Exchange,
  NewWithdrawalActionData,
  WithdrawalAction,
  NewDepositActionData,
  DepositAction,
  NewWithdrawal,
  Withdrawal,
  NewDeposit,
  Deposit,
  AddDepositData,
  AddWithdrawalData,
  ExchangeData,
  DepositActionData,
  WithdrawalActionData,
} from './action-bank-types';

const apolloCache = new InMemoryCache({
  resultCaching: false,
});

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
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
  });
};

const initialState: ActionBankState = {
  exchanges: {},
  lastTimeRetrieved: -1,
  exchangeRequest: {
    status: RequestStatusType.Idle,
    msg: '',
  },
  depositActionRequest: {
    status: RequestStatusType.Idle,
    msg: '',
  },
  withdrawalActionRequest: {
    status: RequestStatusType.Idle,
    msg: '',
  },
  depositRequest: {
    status: RequestStatusType.Idle,
    msg: '',
  },
  withdrawalRequest: {
    status: RequestStatusType.Idle,
    msg: '',
  },
};

const actionBankSlice = createSlice({
  name: 'actionBank',
  initialState: initialState,
  reducers: {
    resetExchanges(state, _) {
      state.exchanges = {};
      state.lastTimeRetrieved = -1;
    },
    setQueryTime(state, _) {
      state.lastTimeRetrieved = new Date().getTime();
    },
    setExchange(state, action: PayloadAction<ExchangeData>) {
      state.exchanges[action.payload.id] = action.payload;
    },
    setMultipleExchanges(state, action: PayloadAction<ExchangeData[]>) {
      state.lastTimeRetrieved = new Date().getTime();

      action.payload.forEach((ex) => {
        state.exchanges[ex.id] = ex;
      });
    },
    deleteExchange(state, action: PayloadAction<string>) {
      delete state.exchanges[action.payload];
    },

    setDepositActionStatus(state, action: PayloadAction<RequestStatus>) {
      state.depositActionRequest = action.payload;
      console.log('Setting Deposit Action Status');
    },
    setDepositAction(state, action: PayloadAction<DepositActionData>) {
      const exDat = state.exchanges[action.payload.exchangeId];

      if (exDat === null) return;

      const ex = Exchange.fromExchangeData(exDat);

      const depAction = DepositAction.fromDepositActionData(action.payload);

      ex.addDepositAction(depAction);

      state.exchanges[ex.id] = ex.exchangeData;
    },
    deleteDepositAction(state, action: PayloadAction<DepositActionData>) {
      console.log('deleteDepositAction within slice');
      const exDat = state.exchanges[action.payload.exchangeId];

      if (exDat === null) return;

      const ex = Exchange.fromExchangeData(exDat);

      const depAction = DepositAction.fromDepositActionData(action.payload);

      ex.deleteDepositAction(depAction);

      state.exchanges[ex.id] = ex.exchangeData;
    },

    setWithdrawalActionStatus(state, action: PayloadAction<RequestStatus>) {
      state.withdrawalActionRequest = action.payload;
      console.log('Setting Withdrawal Action Status', action.payload);
    },
    setWithdrawalAction(state, action: PayloadAction<WithdrawalActionData>) {
      const exDat = state.exchanges[action.payload.exchangeId];

      if (exDat === null) return;

      const ex = Exchange.fromExchangeData(exDat);

      const withdrawalAction = WithdrawalAction.fromWithdrawalActionData(action.payload);

      ex.addWithdrawalAction(withdrawalAction);

      state.exchanges[ex.id] = ex.exchangeData;
    },
    deleteWithdrawalAction(state, action: PayloadAction<WithdrawalActionData>) {
      console.log('deleteWithdrawalAction within slice');
      const exDat = state.exchanges[action.payload.exchangeId];

      if (exDat === null) return;

      const ex = Exchange.fromExchangeData(exDat);

      const withdrawalAction = WithdrawalAction.fromWithdrawalActionData(action.payload);

      ex.deleteWithdrawalAction(withdrawalAction);

      state.exchanges[ex.id] = ex.exchangeData;
    },

    setDepositStatus(state, action: PayloadAction<RequestStatus>) {
      state.depositRequest = action.payload;
      console.log('Setting Deposit Action Status');
    },
    setDeposit(state, action: PayloadAction<AddDepositData>) {
      console.log('Setting Deposit');
      const { depositData, totalFunds, totalDeposits } = action.payload;
      const exDat = state.exchanges[depositData.exchangeId];

      if (exDat === null) return;

      const ex = Exchange.fromExchangeData(exDat);

      const dep = Deposit.fromDepositData(depositData);

      ex.addDeposit(dep, totalDeposits, totalFunds);

      state.exchanges[ex.id] = ex.exchangeData;
    },
    deleteDeposit(state, action: PayloadAction<Deposit>) {},

    setWithdrawalStatus(state, action: PayloadAction<RequestStatus>) {
      state.withdrawalRequest = action.payload;
      console.log('Setting Withdrawal Status');
    },
    setWithdrawal(state, action: PayloadAction<AddWithdrawalData>) {
      console.log('Setting Withdrawal');
      const { withdrawalData, totalFunds, totalWithdrawals } = action.payload;

      const exDat = state.exchanges[withdrawalData.exchangeId];

      if (exDat === null) return;

      const ex = Exchange.fromExchangeData(exDat);

      const wd = Withdrawal.fromWithdrawalData(withdrawalData);

      ex.addWithdrawal(wd, totalWithdrawals, totalFunds);

      state.exchanges[ex.id] = ex.exchangeData;
    },
    deleteWithdrawal(state, action: PayloadAction<Withdrawal>) {},
  },
});

let queryLock = false;

/**************************************************************************************
 * Exchanges
**************************************************************************************/

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
      query getExchange($userId: ID!) {
        getExchangesByUserId(userId: $userId) {
          id,
          userId,
          name,
          description,
          totalCurrency,
          depositActions {
            id,
            exchangeId,
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
            exchangeId,
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
            exchangeId,
            depositActionId,
            depositActionName,
            uomQuantity,
            depositQuantity,
            quantity,
            dateAdded,
          },
          withdrawals {
            id,
            exchangeId,
            withdrawalActionId,
            withdrawalActionName,
            uomQuantity,
            withdrawalQuantity,
            quantity,
            dateAdded,
          },
          depositCount,
          withdrawalCount,
        }
      }
    `;

    const token = thunkAPI.getState().auth.jwt;

    const apolloClient = makeApolloClient(token);

    try {
      const res = await apolloClient.query({
        query,
        variables: {
          userId
        },
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
      console.error('Error getting multiple exchanges', e);
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
      ).exchangeData));

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

/**************************************************************************************
 * Deposit Actions
**************************************************************************************/

const addDepositAction = createAsyncThunk<unknown, NewDepositActionData, {state: StoreType}>(
  'actionBank/addDepositAction',
  async(dat: NewDepositActionData, thunkAPI) => {
    thunkAPI.dispatch(actionBankSlice.actions.setDepositActionStatus({
      status: RequestStatusType.Pending,
      msg: '',
    }));

    const mutation = gql`
      mutation depositAction(
        $exchangeId: String!,
        $name: String!,
        $uom: String!,
        $uomQuantity: Float!,
        $depositQuantity: Float!,
        $enabled: Boolean!,
      ) {
        addDepositAction(
          exchangeId: $exchangeId,
          name: $name,
          uom: $uom,
          uomQuantity: $uomQuantity,
          depositQuantity: $depositQuantity,
          enabled: $enabled,
        ) {
          id,
        }
      }
    `;

    const token = thunkAPI.getState().auth.jwt;

    const apolloClient = makeApolloClient(token);

    try {
      const res = await apolloClient.mutate({
        mutation,
        variables: {
          exchangeId: dat.exchangeId,
          name: dat.name,
          uom: dat.uom,
          uomQuantity: dat.uomQuantity,
          depositQuantity: dat.depositQuantity,
          enabled: true,
        },
      });

      const rawActionId = res.data.addDepositAction.id;

      const depositAction = DepositAction.fromNewDepositActionData(dat, rawActionId);

      thunkAPI.dispatch(actionBankSlice.actions.setDepositAction(
        depositAction.depositActionData
      ));

      thunkAPI.dispatch(actionBankSlice.actions.setDepositActionStatus({
        status: RequestStatusType.Success,
        msg: '',
      }));

      console.log('Done Adding Action');
    } catch(e) {
      const err = `Error Adding New Action: ${e}`;
      thunkAPI.dispatch(actionBankSlice.actions.setDepositActionStatus({
        status: RequestStatusType.Fail,
        msg: err,
      }));
      console.error(err);
    }
  },
);

const editDepositAction = createAsyncThunk(
  'actionBank/editDepositAction',
  async(dat: DepositAction, thunkAPI) => {}
);

interface DeleteDepositActionType {
  depositAction: DepositAction,
}

const deleteDepositAction = createAsyncThunk<unknown, DeleteDepositActionType, {state: StoreType}>(
  'actionBank/deleteDepositAction',
  async(dat: DeleteDepositActionType, thunkAPI) => {
    thunkAPI.dispatch(actionBankSlice.actions.setDepositActionStatus({
      status: RequestStatusType.Pending,
      msg: '',
    }));

    const mutation = gql`
      mutation depositAction(
        $depositActionId: ID!,
      ) {
        deleteDepositAction(
          depositActionId: $depositActionId,
        )
      }
    `;

    const token = thunkAPI.getState().auth.jwt;

    const apolloClient = makeApolloClient(token);

    try {
      await apolloClient.mutate({
        mutation,
        variables: {
          depositActionId: dat.depositAction.id,
        },
      });

      thunkAPI.dispatch(actionBankSlice.actions.deleteDepositAction(
        dat.depositAction.depositActionData
      ));

      thunkAPI.dispatch(actionBankSlice.actions.setDepositActionStatus({
        status: RequestStatusType.Success,
        msg: '',
      }));

      console.log('Done Deleting Deposit Action');
    } catch(e) {
      const err = `Error Deleting Deposit Action: ${e}`;
      thunkAPI.dispatch(actionBankSlice.actions.setDepositActionStatus({
        status: RequestStatusType.Fail,
        msg: err,
      }));
      console.error(err);
    }
  }
);

/**************************************************************************************
 * Withdrawal Actions
**************************************************************************************/

const addWithdrawalAction = createAsyncThunk<unknown, NewWithdrawalActionData, {state: StoreType}>(
  'actionBank/addWithdrawalAction',
  async(dat: NewWithdrawalActionData, thunkAPI) => {
    thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalActionStatus({
      status: RequestStatusType.Pending,
      msg: '',
    }));

    const mutation = gql`
      mutation withdrawalAction(
        $exchangeId: String!,
        $name: String!,
        $uom: String!,
        $uomQuantity: Float!,
        $withdrawalQuantity: Float!,
        $enabled: Boolean!,
      ) {
        addWithdrawalAction(
          exchangeId: $exchangeId,
          name: $name,
          uom: $uom,
          uomQuantity: $uomQuantity,
          withdrawalQuantity: $withdrawalQuantity,
          enabled: $enabled,
        ) {
          id,
        }
      }
    `;

    const token = thunkAPI.getState().auth.jwt;

    const apolloClient = makeApolloClient(token);

    try {
      const res = await apolloClient.mutate({
        mutation,
        variables: {
          exchangeId: dat.exchangeId,
          name: dat.name,
          uom: dat.uom,
          uomQuantity: dat.uomQuantity,
          withdrawalQuantity: dat.withdrawalQuantity,
          enabled: true,
        },
      });

      const rawActionId = res.data.addWithdrawalAction.id;

      const withdrawalAction = WithdrawalAction.fromNewWithdrawalActionData(dat, rawActionId);

      thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalAction(
        withdrawalAction.withdrawalActionData
      ));

      thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalActionStatus({
        status: RequestStatusType.Success,
        msg: '',
      }));

      console.log('Done Adding Action');
    } catch(e) {
      const err = `Error Adding New Action: ${e}`;
      thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalActionStatus({
        status: RequestStatusType.Fail,
        msg: err,
      }));
      console.error(err);
    }
  }
);

const editWithdrawalAction = createAsyncThunk(
  'actionBank/editWithdrawalAction',
  async(dat: Withdrawal, thunkAPI) => {}
);

interface DeleteWithdrawalActionType {
  withdrawalAction: WithdrawalAction,
}

const deleteWithdrawalAction = createAsyncThunk<unknown, DeleteWithdrawalActionType, {state: StoreType}>(
  'actionBank/deleteWithdrawalAction',
  async(dat: DeleteWithdrawalActionType, thunkAPI) => {
    thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalActionStatus({
      status: RequestStatusType.Pending,
      msg: '',
    }));

    const mutation = gql`
      mutation widthdrawalAction(
        $withdrawalActionId: ID!,
      ) {
        deleteWithdrawalAction(
          withdrawalActionId: $withdrawalActionId,
        )
      }
    `;

    const token = thunkAPI.getState().auth.jwt;

    const apolloClient = makeApolloClient(token);

    try {
      await apolloClient.mutate({
        mutation,
        variables: {
          withdrawalActionId: dat.withdrawalAction.id,
        },
      });

      thunkAPI.dispatch(actionBankSlice.actions.deleteWithdrawalAction(
        dat.withdrawalAction.withdrawalActionData
      ));

      thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalActionStatus({
        status: RequestStatusType.Success,
        msg: '',
      }));

      console.log('Done Deleting Withdrawal Action');
    } catch(e) {
      const err = `Error Deleting Withdrawal Action: ${e}`;
      thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalActionStatus({
        status: RequestStatusType.Fail,
        msg: err,
      }));
      console.error(err);
    }
  }
);

/**************************************************************************************
 * Deposits
**************************************************************************************/

const addDeposit = createAsyncThunk<unknown, NewDeposit, {state: StoreType}>(
  'actionBank/addDeposit',
  async(dat: NewDeposit, thunkAPI) => {
    console.log('Adding Deposit');

    thunkAPI.dispatch(actionBankSlice.actions.setDepositStatus({
      status: RequestStatusType.Pending,
      msg: '',
    }));

    const mutation = gql`
      mutation deposit(
        $depositActionId: ID!,
        $quantity: Float!
      ) {
        addDeposit(
          depositActionId: $depositActionId,
          quantity: $quantity,
        ) {
          deposit {
            id,
          },
          totalDeposits,
          totalFunds,
        }
      }
    `;

    const token = thunkAPI.getState().auth.jwt;

    const apolloClient = makeApolloClient(token);

    try {
      const res = await apolloClient.mutate({
        mutation,
        variables: {
          depositActionId: dat.depositAction.id,
          quantity: dat.quantity,
        },
      });

      const {
        deposit: rawDeposit,
        totalDeposits,
        totalFunds,
      } = res.data.addDeposit;

      const deposit = Deposit.fromNewDeposit(rawDeposit.id, dat.quantity, dat.depositAction);

      thunkAPI.dispatch(actionBankSlice.actions.setDeposit({
        depositData: deposit.depositData,
        totalDeposits,
        totalFunds,
      }));

      thunkAPI.dispatch(actionBankSlice.actions.setDepositStatus({
        status: RequestStatusType.Success,
        msg: '',
      }));

      console.log('Finished Adding Deposit');
    } catch(e) {
      const err = `Error Adding Deposit: ${e}`;
      thunkAPI.dispatch(actionBankSlice.actions.setDepositStatus({
        status: RequestStatusType.Fail,
        msg: err,
      }));
      console.error(err);
    }
  }
);

const editDeposit = createAsyncThunk(
  'actionBank/editDeposit',
  async(dat: Deposit, thunkAPI) => {}
);

const deleteDeposit = createAsyncThunk(
  'actionBank/deleteDeposit',
  async(dat: Deposit, thunkAPI) => {}
);

/**************************************************************************************
 * Withdrawals
**************************************************************************************/

const addWithdrawal = createAsyncThunk<unknown, NewWithdrawal, {state: StoreType}>(
  'actionBank/addWithdrawal',
  async(dat: NewWithdrawal, thunkAPI) => {
    thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalStatus({
      status: RequestStatusType.Pending,
      msg: '',
    }));

    const mutation = gql`
      mutation addWithdrawal(
        $withdrawalActionId: ID!,
        $quantity: Float!
      ) {
        addWithdrawal(
          withdrawalActionId: $withdrawalActionId,
          quantity: $quantity,
        ) {
          withdrawal {
            id,
          },
          totalWithdrawals,
          totalFunds,
        }
      }
    `;

    const token = thunkAPI.getState().auth.jwt;

    const apolloClient = makeApolloClient(token);

    try {
      const res = await apolloClient.mutate({
        mutation,
        variables: {
          withdrawalActionId: dat.withdrawalAction.id,
          quantity: dat.quantity,
        },
      });

      const {
        withdrawal: rawWithdrawal,
        totalWithdrawals,
        totalFunds,
      } = res.data.addWithdrawal;

      const withdrawal = Withdrawal.fromNewWithdrawal(rawWithdrawal.id, dat.quantity, dat.withdrawalAction);

      thunkAPI.dispatch(actionBankSlice.actions.setWithdrawal({
        withdrawalData: withdrawal.withdrawalData,
        totalWithdrawals,
        totalFunds,
      }));

      thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalStatus({
        status: RequestStatusType.Success,
        msg: '',
      }));

      console.log('Finished Adding Withdrawal');
    } catch(e) {
      const err = `Error Adding Withdrawal: ${e}`;
      thunkAPI.dispatch(actionBankSlice.actions.setWithdrawalStatus({
        status: RequestStatusType.Fail,
        msg: err,
      }));
      console.error(err);
    }
  }
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
import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import jwt from 'jsonwebtoken';

import { AuthState, AuthPayload } from './auth-store-types';
import { actions as actionBankActions } from 'store/action-bank';

const USER_TOKEN_KEY = 'userToken';

const decodeTokenOnStartup = (): AuthState => {
  const initialStoreState: AuthState = {
    username: '',
    userId: '',
    jwt: '',
  };

  const token = localStorage.getItem(USER_TOKEN_KEY);

  if (token === null || token === undefined || typeof token !== 'string') {
    return initialStoreState;
  }

  try {
    const decodedToken = jwt.decode(token);

    if (typeof decodedToken !== 'object'
      || decodedToken == null
      || typeof decodedToken.username !== 'string'
      || typeof decodedToken.userId !== 'string'
      || typeof decodedToken.exp !== 'number'
      || decodedToken.exp * 1000 < new Date().getTime()
    ) {
      throw new Error('Invalid JWT');
    }

    initialStoreState.userId = decodedToken.userId;
    initialStoreState.username = decodedToken.username;
    initialStoreState.jwt = token;
  } catch(e) {
    localStorage.removeItem(USER_TOKEN_KEY);
  }

  return initialStoreState;
};

const initialStoreState: AuthState = decodeTokenOnStartup();

const authSlice = createSlice({
  name: 'store',
  initialState: initialStoreState,
  reducers: {
    saveUserData(state, action: PayloadAction<AuthPayload>) {
      state.username = action.payload.username;
      state.userId = action.payload.userId;
      state.jwt = action.payload.jwt;
    },
    unsetUserData(state) {
      state.username = '';
      state.userId = '';
      state.jwt = '';
    }
  },
});

interface LoginRequest {
  username: string,
  password: string,
}

const logIn = createAsyncThunk(
  'auth/logIn',
  async (loginRequest: LoginRequest, thunkAPI) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const fetchResult = await fetch('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        username: loginRequest.username,
        password: loginRequest.password,
      }),
    });

    if (!fetchResult.ok) {
      throw new Error('Invalid Credentials');
    }

    const body = await fetchResult.json();

    if (typeof body !== 'object'
      || typeof body.token !== 'string')
    {
      throw new Error('Invalid payload');
    }

    const token: string = body.token;

    const decodedToken = jwt.decode(token);

    if (typeof decodedToken !== 'object'
      || decodedToken == null
      || typeof decodedToken.username !== 'string'
      || typeof decodedToken.userId !== 'string'
    ) {
      throw new Error('Invalid JWT');
    }

    localStorage.setItem(USER_TOKEN_KEY, token);

    const saveDispatch = authSlice.actions.saveUserData({
      username: decodedToken.username,
      userId: decodedToken.userId,
      jwt: token,
    });

    thunkAPI.dispatch(saveDispatch);

    // const exchangeDispatch = actionBankActions.getAllExchanges() as ThunkDispatch<unknown, undefined, Action<any>>;

    // thunkAPI.dispatch(exchangeDispatch);
  },
);

const logOut = createAsyncThunk(
  'auth/logOut',
  async (_, thunkAPI) => {
    localStorage.removeItem(USER_TOKEN_KEY);

    thunkAPI.dispatch(authSlice.actions.unsetUserData());

    const exchangeDispatch = actionBankActions.resetExchanges(null);
    // const exchangeDispatch = actionBankActions.getAllExchanges() as ThunkDispatch<unknown, undefined, Action<any>>;

    thunkAPI.dispatch(exchangeDispatch);
  },
);

const actions = {
  logIn,
  logOut,
};

export {
  actions,
};

export default authSlice;
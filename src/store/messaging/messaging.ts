import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import { MessagingState, Message, MessageType, MessagePayload } from './messaging-store-types';

const initialState: MessagingState = {
  messages: {},
  loading: false,
};

interface RemoveMessageType {
  id: string,
}

interface MessageCreationRequest {
  message: string,
  duration?: number,
}

/****************************************************************************************
* Thunk Functions
*****************************************************************************************/

const makeMessage = createAsyncThunk(
  'messaging/makeMessage',
  (req: MessagePayload, thunkAPI) => {
    const id = uuidv4();

      const timeout = window.setTimeout(() => {
        console.log('Removing');
        thunkAPI.dispatch(messagingStoreSlice.actions.removeMessage({ id }));
      }, req.duration);

      const msg = {
        id,
        messageType: req.messageType,
        message: req.message,
        timerId: timeout,
        timeAdded: new Date().getTime(),
      };

      thunkAPI.dispatch(messagingStoreSlice.actions.addNewMessage(msg));
  },
);

const addErrorMessage = createAsyncThunk(
  'messaging/addErrorMessage',
  (req: MessageCreationRequest, thunkAPI) => {
    const duration = req.duration ?? 60000;
    const messageType = MessageType.Error;

    thunkAPI.dispatch(makeMessage({
      messageType,
      message: req.message,
      duration,
    }));
  }
);

const addInfoMessage = createAsyncThunk(
  'messaging/addInfoMessage',
  (req: MessageCreationRequest, thunkAPI) => {
    console.log('addInfoMessage');
    const duration = req.duration ?? 10000;
    const messageType = MessageType.Info;

    thunkAPI.dispatch(makeMessage({
      messageType,
      message: req.message,
      duration,
    }));
  }
);

const addSuccessMessage = createAsyncThunk(
  'messaging/addSuccessMessage',
  (req: MessageCreationRequest, thunkAPI) => {
    const duration = req.duration ?? 10000;
    const messageType = MessageType.Success;

    thunkAPI.dispatch(makeMessage({
      messageType,
      message: req.message,
      duration,
    }));
  }
);

/****************************************************************************************
* Slice Creation
*****************************************************************************************/

const messagingStoreSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    addNewMessage(state, action: PayloadAction<Message>) {
      console.log('addNewMessage');
      const msg = action.payload;
      state.messages[msg.id] = msg;
    },
    removeMessage(state, action: PayloadAction<RemoveMessageType>) {
      const msg = state.messages[action.payload.id];

      if (msg == null) return;

      window.clearTimeout(msg.timerId);
      delete state.messages[msg.id];
    },
    setIsLoading(state, action: PayloadAction<void>) {
      state.loading = true;
    },
    setIsNotLoading(state, action: PayloadAction<void>) {
      state.loading = false;
    },
  },
});

const actions = {
  addErrorMessage,
  addInfoMessage,
  addSuccessMessage,
  removeMessage: messagingStoreSlice.actions.removeMessage,
  setIsLoading: messagingStoreSlice.actions.setIsLoading,
  setIsNotLoading: messagingStoreSlice.actions.setIsNotLoading,
};

export {
  actions,
};

export default messagingStoreSlice;
import store, { actions } from './store';

import * as authSelectors from './auth/auth-selectors';
import * as messagingSelectors from './messaging/messaging-selectors';
import * as actionBankSelectors from './action-bank/action-bank-selectors';

const selectors = {
  ...authSelectors,
  ...messagingSelectors,
  ...actionBankSelectors,
};

export {
  selectors,
  actions,
};

export default store;
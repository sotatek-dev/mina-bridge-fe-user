import { combineReducers } from '@reduxjs/toolkit';

import exampleSliceReducer from './exampleSlice';
import uiSlice from './uiSlice';
import walletObjSlice from './walletObjSlice';
import walletSlice from './walletSlice';
import walletInstanceSlice from './walletInstanceSlice';
import persistSlice from './persistSlice';

const rootReducer = combineReducers({
  persist: persistSlice,
  example: exampleSliceReducer,
  ui: uiSlice,
  wallet: walletSlice,
  walletObj: walletObjSlice,
  walletInstance: walletInstanceSlice,
});

export default rootReducer;

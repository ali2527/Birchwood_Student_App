import { Action, combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

import AsyncStorage from '@react-native-async-storage/async-storage';
import ClassSlice from './slices/class.slice';
import CommonSlice from './slices/common.slice';
import DiarySlice from './slices/diary.slice';
import PostSlice from './slices/post.slice';
import TimeTableSlice from './slices/timeTable.slice';
import UserSlice from './slices/user.slice';

const allreducers = combineReducers({
  common: CommonSlice,
  user: UserSlice,
  class: ClassSlice,
  post: PostSlice,
  diary: DiarySlice,
  timeTable: TimeTableSlice,
});

const persistConfig = {
  key: 'birchwoodStudent',
  storage: AsyncStorage,
  whitelist: ['user'],
};

const rootReducer = (state: any, action: Action) => {
  if (action.type === 'User/resetUserState') {
    state = {};
  }
  return allreducers(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

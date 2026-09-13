import { Action, combineReducers, configureStore } from '@reduxjs/toolkit';
import { createTransform, persistReducer, persistStore } from 'redux-persist';

import AsyncStorage from '@react-native-async-storage/async-storage';
import ClassSlice from './slices/class.slice';
import CommonSlice from './slices/common.slice';
import DiarySlice from './slices/diary.slice';
import NotificationSlice from './slices/notification.slice';
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
  notification: NotificationSlice,
});

/** Persist the JWT only when Remember me is on. Session still lives in memory either way. */
const persistAuthTransform = createTransform(
  (inboundState: any) => {
    if (inboundState && inboundState.rememberMe === false) {
      return { ...inboundState, token: null };
    }
    return inboundState;
  },
  (outboundState: any) => outboundState,
  { whitelist: ['user'] },
);

const persistConfig = {
  key: 'birchwoodStudent',
  storage: AsyncStorage,
  whitelist: ['user'],
  transforms: [persistAuthTransform],
};

const rootReducer = (state: any, action: Action) => {
  if (action.type === 'User/resetUserState') {
    state = undefined;
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

export async function persistAuthSession() {
  try {
    await persistor.flush();
  } catch (error) {
    console.log('Failed to persist auth session', error);
  }
}

export type RootState = ReturnType<typeof store.getState>;

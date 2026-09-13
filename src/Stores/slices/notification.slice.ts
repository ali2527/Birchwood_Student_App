import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';
import {AppNotification} from '../../Types/User';

type NotificationState = {
  items: AppNotification[];
  unreadCount: number;
  connected: boolean;
  loaded: boolean;
};

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  connected: false,
  loaded: false,
};

function notificationId(item: AppNotification | {_id?: string; id?: string}) {
  return String(item?._id || (item as any)?.id || '');
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.unreadCount = state.items.filter(item => !item.isRead).length;
      state.loaded = true;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = Math.max(0, Number(action.payload) || 0);
    },
    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.connected = Boolean(action.payload);
    },
    receiveNotification(state, action: PayloadAction<AppNotification>) {
      const incoming = action.payload;
      if (!incoming) {
        return;
      }
      const id = notificationId(incoming);
      if (!id) {
        return;
      }
      const existingIndex = state.items.findIndex(
        item => notificationId(item) === id,
      );
      if (existingIndex >= 0) {
        state.items[existingIndex] = {
          ...state.items[existingIndex],
          ...incoming,
        };
      } else {
        state.items.unshift({...incoming, isRead: incoming.isRead ?? false});
      }
      state.unreadCount = state.items.filter(item => !item.isRead).length;
      state.loaded = true;
    },
    setNotificationReadState(
      state,
      action: PayloadAction<{id: string; isRead?: boolean}>,
    ) {
      const id = String(action.payload.id || '');
      const isRead =
        action.payload.isRead !== undefined
          ? Boolean(action.payload.isRead)
          : true;
      if (!id) {
        return;
      }
      state.items = state.items.map(item =>
        notificationId(item) === id ? {...item, isRead} : item,
      );
      state.unreadCount = state.items.filter(item => !item.isRead).length;
    },
    markAllNotificationsReadInState(state) {
      state.items = state.items.map(item => ({...item, isRead: true}));
      state.unreadCount = 0;
    },
    clearNotifications() {
      return initialState;
    },
  },
});

export const {
  setNotifications,
  setUnreadCount,
  setSocketConnected,
  receiveNotification,
  setNotificationReadState,
  markAllNotificationsReadInState,
  clearNotifications,
} = notificationSlice.actions;

export const selectNotifications = (state: RootState) =>
  state.notification.items;
export const selectUnreadNotificationCount = (state: RootState) =>
  state.notification.unreadCount;
export const selectNotificationSocketConnected = (state: RootState) =>
  state.notification.connected;

export default notificationSlice.reducer;

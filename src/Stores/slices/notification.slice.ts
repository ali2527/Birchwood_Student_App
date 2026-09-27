import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';
import {AppNotification} from '../../Types/User';

type NotificationState = {
  items: AppNotification[];
  notices: AppNotification[];
  unreadCount: number;
  unreadNoticeCount: number;
  connected: boolean;
  loaded: boolean;
  noticesLoaded: boolean;
};

const initialState: NotificationState = {
  items: [],
  notices: [],
  unreadCount: 0,
  unreadNoticeCount: 0,
  connected: false,
  loaded: false,
  noticesLoaded: false,
};

function notificationId(item: AppNotification | {_id?: string; id?: string}) {
  return String(item?._id || (item as any)?.id || '');
}

export function isSchoolNotice(item?: AppNotification | null) {
  if (!item) {
    return false;
  }
  return Boolean(item.broadcastId) || item.source === 'NOTICE';
}

function upsertList(
  list: AppNotification[],
  incoming: AppNotification,
): AppNotification[] {
  const id = notificationId(incoming);
  if (!id) {
    return list;
  }
  const existingIndex = list.findIndex(item => notificationId(item) === id);
  if (existingIndex >= 0) {
    const next = list.slice();
    next[existingIndex] = {...next[existingIndex], ...incoming};
    return next;
  }
  return [{...incoming, isRead: incoming.isRead ?? false}, ...list];
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.loaded = true;
    },
    setNotices(state, action: PayloadAction<AppNotification[]>) {
      state.notices = Array.isArray(action.payload) ? action.payload : [];
      state.noticesLoaded = true;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = Math.max(0, Number(action.payload) || 0);
    },
    setUnreadNoticeCount(state, action: PayloadAction<number>) {
      state.unreadNoticeCount = Math.max(0, Number(action.payload) || 0);
    },
    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.connected = Boolean(action.payload);
    },
    receiveNotification(state, action: PayloadAction<AppNotification>) {
      const incoming = action.payload;
      if (!incoming || !notificationId(incoming)) {
        return;
      }

      const wasKnown =
        state.items.some(item => notificationId(item) === notificationId(incoming)) ||
        state.notices.some(item => notificationId(item) === notificationId(incoming));
      const isNotice = isSchoolNotice(incoming);
      const isUnread = incoming.isRead === false || incoming.isRead === undefined;

      if (isNotice) {
        state.notices = upsertList(state.notices, incoming);
        state.noticesLoaded = true;
        if (!wasKnown && isUnread) {
          state.unreadNoticeCount += 1;
        }
      } else {
        state.items = upsertList(state.items, incoming);
        state.loaded = true;
        if (!wasKnown && isUnread) {
          state.unreadCount += 1;
        }
      }
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

      const inNotices = state.notices.find(item => notificationId(item) === id);
      const inInbox = state.items.find(item => notificationId(item) === id);
      const previous = inNotices || inInbox;
      const wasRead = Boolean(previous?.isRead);

      state.notices = state.notices.map(item =>
        notificationId(item) === id ? {...item, isRead} : item,
      );
      state.items = state.items.map(item =>
        notificationId(item) === id ? {...item, isRead} : item,
      );

      if (previous && wasRead !== isRead) {
        if (isSchoolNotice(previous)) {
          state.unreadNoticeCount = Math.max(
            0,
            state.unreadNoticeCount + (isRead ? -1 : 1),
          );
        } else {
          state.unreadCount = Math.max(
            0,
            state.unreadCount + (isRead ? -1 : 1),
          );
        }
      }
    },
    markAllNotificationsReadInState(state) {
      state.items = state.items.map(item => ({...item, isRead: true}));
      state.unreadCount = 0;
    },
    removeNotification(state, action: PayloadAction<string | {id?: string; broadcastId?: string}>) {
      const payload = action.payload;
      const id =
        typeof payload === 'string'
          ? String(payload || '')
          : String(payload?.id || '');
      const broadcastId =
        typeof payload === 'object' && payload
          ? String(payload.broadcastId || '')
          : '';

      if (!id && !broadcastId) {
        return;
      }

      const matches = (item: AppNotification) => {
        if (id && notificationId(item) === id) {
          return true;
        }
        if (broadcastId && String((item as any).broadcastId || '') === broadcastId) {
          return true;
        }
        return false;
      };

      const removedNotices = state.notices.filter(matches);
      const removedInbox = state.items.filter(matches);

      state.notices = state.notices.filter(item => !matches(item));
      state.items = state.items.filter(item => !matches(item));

      removedNotices.forEach(previous => {
        if (!previous.isRead && isSchoolNotice(previous)) {
          state.unreadNoticeCount = Math.max(0, state.unreadNoticeCount - 1);
        }
      });
      removedInbox.forEach(previous => {
        if (!previous.isRead) {
          if (isSchoolNotice(previous)) {
            state.unreadNoticeCount = Math.max(0, state.unreadNoticeCount - 1);
          } else {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });
    },
    clearNotifications() {
      return initialState;
    },
  },
});

export const {
  setNotifications,
  setNotices,
  setUnreadCount,
  setUnreadNoticeCount,
  setSocketConnected,
  receiveNotification,
  setNotificationReadState,
  markAllNotificationsReadInState,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export const selectNotifications = (state: RootState) =>
  state.notification.items;
export const selectNotices = (state: RootState) => state.notification.notices;
export const selectUnreadNotificationCount = (state: RootState) =>
  state.notification.unreadCount;
export const selectUnreadNoticeCount = (state: RootState) =>
  state.notification.unreadNoticeCount;
export const selectNotificationSocketConnected = (state: RootState) =>
  state.notification.connected;

export default notificationSlice.reducer;

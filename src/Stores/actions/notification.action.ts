import {createAsyncThunk} from '@reduxjs/toolkit';
import {allApiPaths, ApiPaths} from '../../Service/apiPaths';
import {callApi} from '../../Service/api';
import {
  AppNotification,
  UserNotificationsResponse,
} from '../../Types/User';
import {
  setNotifications,
  setNotices,
  setNotificationReadState,
  setUnreadCount,
  setUnreadNoticeCount,
  removeNotification,
} from '../slices/notification.slice';

function pickDocs(payload: any): AppNotification[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.docs)) {
    return payload.docs;
  }
  if (Array.isArray(payload?.notifications)) {
    return payload.notifications;
  }
  return [];
}

export const asyncGetUserNotifications = createAsyncThunk(
  'notification/getUserNotifications',
  async (_, {dispatch}) => {
    try {
      const path = `${allApiPaths.getPath(
        'getUserNotifications',
      )}?page=1&limit=50&kind=inbox` as ApiPaths;
      const res = await callApi<UserNotificationsResponse>({path});
      if (res?.status) {
        const docs = pickDocs(res?.data ?? res);
        dispatch(setNotifications(docs));
      }
      return res;
    } catch (error) {
      console.log('getUserNotifications failed', error);
      throw error;
    }
  },
);

export const asyncGetUserNotices = createAsyncThunk(
  'notification/getUserNotices',
  async (_, {dispatch}) => {
    try {
      const path = `${allApiPaths.getPath(
        'getUserNotifications',
      )}?page=1&limit=50&kind=notice` as ApiPaths;
      const res = await callApi<UserNotificationsResponse>({path});
      if (res?.status) {
        const docs = pickDocs(res?.data ?? res);
        dispatch(setNotices(docs));
      }
      return res;
    } catch (error) {
      console.log('getUserNotices failed', error);
      throw error;
    }
  },
);

export const asyncGetUnreadUserNotifications = createAsyncThunk(
  'notification/getUnreadUserNotifications',
  async (_, {dispatch}) => {
    try {
      const path = `${allApiPaths.getPath(
        'getUnreadUserNotifications',
      )}?kind=inbox` as ApiPaths;
      const res = await callApi<{
        count?: number;
        totalUnreadCount?: number;
        notifications?: AppNotification[];
      }>({path});
      if (res?.status) {
        const count =
          res?.data?.totalUnreadCount ?? res?.data?.count ?? 0;
        dispatch(setUnreadCount(Number(count) || 0));
      }
      return res;
    } catch (error) {
      console.log('getUnreadUserNotifications failed', error);
      throw error;
    }
  },
);

export const asyncGetUnreadUserNotices = createAsyncThunk(
  'notification/getUnreadUserNotices',
  async (_, {dispatch}) => {
    try {
      const path = `${allApiPaths.getPath(
        'getUnreadUserNotifications',
      )}?kind=notice` as ApiPaths;
      const res = await callApi<{
        count?: number;
        totalUnreadCount?: number;
        notifications?: AppNotification[];
      }>({path});
      if (res?.status) {
        const count =
          res?.data?.totalUnreadCount ?? res?.data?.count ?? 0;
        dispatch(setUnreadNoticeCount(Number(count) || 0));
      }
      return res;
    } catch (error) {
      console.log('getUnreadUserNotices failed', error);
      throw error;
    }
  },
);

export const asyncMarkNotificationRead = createAsyncThunk(
  'notification/markAsRead',
  async (
    {id, isRead = true}: {id: string; isRead?: boolean},
    {dispatch},
  ) => {
    const path = allApiPaths.getPath('markNotificationAsRead', {
      id,
    }) as ApiPaths;
    const res = await callApi({
      path,
      method: 'POST',
      body: {isRead},
    });
    if (res?.status) {
      dispatch(setNotificationReadState({id, isRead}));
    }
    return res;
  },
);

export const asyncDeleteUserNotification = createAsyncThunk(
  'notification/deleteUserNotification',
  async ({id}: {id: string}, {dispatch}) => {
    const path = allApiPaths.getPath('deleteUserNotification', {
      id,
    }) as ApiPaths;
    const res = await callApi({
      path,
      method: 'POST',
    });
    if (res?.status) {
      dispatch(removeNotification(id));
    }
    return res;
  },
);

export const asyncBulkUserNotifications = createAsyncThunk(
  'notification/bulkUserNotifications',
  async (
    {ids, action}: {ids: string[]; action: 'read' | 'unread' | 'delete'},
    {dispatch},
  ) => {
    const path = allApiPaths.getPath('bulkUserNotifications') as ApiPaths;
    const res = await callApi<{ids?: string[]; action?: string}>({
      path,
      method: 'POST',
      body: {ids, action},
    });
    if (res?.status) {
      const applied =
        Array.isArray(res.data?.ids) && res.data.ids.length ? res.data.ids : ids;
      if (action === 'delete') {
        applied.forEach(id => dispatch(removeNotification(String(id))));
      } else {
        const isRead = action === 'read';
        applied.forEach(id =>
          dispatch(setNotificationReadState({id: String(id), isRead})),
        );
      }
    }
    return res;
  },
);

import {createAsyncThunk} from '@reduxjs/toolkit';
import {allApiPaths, ApiPaths} from '../../Service/apiPaths';
import {callApi} from '../../Service/api';
import {
  AppNotification,
  UserNotificationsResponse,
} from '../../Types/User';
import {
  setNotifications,
  setNotificationReadState,
  setUnreadCount,
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
      )}?page=1&limit=50` as ApiPaths;
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

export const asyncGetUnreadUserNotifications = createAsyncThunk(
  'notification/getUnreadUserNotifications',
  async (_, {dispatch}) => {
    try {
      const path = allApiPaths.getPath('getUnreadUserNotifications') as ApiPaths;
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

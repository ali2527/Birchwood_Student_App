import {useEffect} from 'react';
import {AppState} from 'react-native';
import {showAppAlert} from '../Components/AppAlert/host';
import {
  connectAppSocket,
  disconnectAppSocket,
  SOCKET_EVENTS,
} from '../Service/socket';
import {
  asyncGetUnreadUserNotifications,
  asyncGetUnreadUserNotices,
  asyncGetUserNotifications,
  asyncGetUserNotices,
} from '../Stores/actions/notification.action';
import {useAppDispatch, useAppSelector} from '../Stores/hooks';
import {
  isSchoolNotice,
  receiveNotification,
  removeNotification,
  setNotificationReadState,
  setSocketConnected,
} from '../Stores/slices/notification.slice';
import {selectUserToken} from '../Stores/slices/user.slice';

/**
 * Keeps a Socket.IO connection alive while the parent is signed in and
 * mirrors notification:new / notification:read into Redux.
 * School notices only bump the Notices tile badge — no toast alert.
 */
export function useNotificationSocket() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectUserToken);

  useEffect(() => {
    if (!token) {
      disconnectAppSocket();
      dispatch(setSocketConnected(false));
      return undefined;
    }

    const socket = connectAppSocket(token);
    if (!socket) {
      return undefined;
    }

    dispatch(asyncGetUserNotifications());
    dispatch(asyncGetUserNotices());
    dispatch(asyncGetUnreadUserNotifications());
    dispatch(asyncGetUnreadUserNotices());

    const refreshNotices = () => {
      dispatch(asyncGetUserNotices());
      dispatch(asyncGetUnreadUserNotices());
    };

    const onConnected = () => {
      dispatch(setSocketConnected(true));
      refreshNotices();
      dispatch(asyncGetUnreadUserNotifications());
    };

    const onDisconnect = () => {
      dispatch(setSocketConnected(false));
    };

    const onNotificationNew = payload => {
      const raw = payload?.notification || payload;
      const id = raw?._id || raw?.id;
      if (!raw || !id) {
        return;
      }
      const notification = {...raw, _id: String(id)};
      dispatch(receiveNotification(notification));
      if (isSchoolNotice(notification)) {
        refreshNotices();
        return;
      }
      showAppAlert({
        title: notification.title || 'New notification',
        description: notification.content || '',
        type: 'info',
      });
    };

    const onNotificationRead = payload => {
      const id = payload?.id;
      if (!id) {
        return;
      }
      dispatch(
        setNotificationReadState({
          id,
          isRead: payload?.isRead !== undefined ? Boolean(payload.isRead) : true,
        }),
      );
    };

    const onNotificationDeleted = payload => {
      const id = payload?.id;
      const broadcastId = payload?.broadcastId;
      if (!id && !broadcastId) {
        return;
      }
      dispatch(removeNotification({id, broadcastId}));
    };

    socket.on(SOCKET_EVENTS.CONNECTED, onConnected);
    socket.on('connect', onConnected);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, onNotificationNew);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, onNotificationRead);
    socket.on(SOCKET_EVENTS.NOTIFICATION_DELETED, onNotificationDeleted);

    if (socket.connected) {
      onConnected();
    }

    const appStateSub = AppState.addEventListener('change', next => {
      if (next === 'active') {
        refreshNotices();
      }
    });

    return () => {
      socket.off(SOCKET_EVENTS.CONNECTED, onConnected);
      socket.off('connect', onConnected);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, onNotificationNew);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ, onNotificationRead);
      socket.off(SOCKET_EVENTS.NOTIFICATION_DELETED, onNotificationDeleted);
      appStateSub.remove();
      disconnectAppSocket();
      dispatch(setSocketConnected(false));
    };
  }, [token, dispatch]);
}

export default useNotificationSocket;

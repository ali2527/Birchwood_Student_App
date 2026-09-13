import {useEffect} from 'react';
import {showAppAlert} from '../Components/AppAlert/host';
import {
  connectAppSocket,
  disconnectAppSocket,
  SOCKET_EVENTS,
} from '../Service/socket';
import {
  asyncGetUnreadUserNotifications,
  asyncGetUserNotifications,
} from '../Stores/actions/notification.action';
import {useAppDispatch, useAppSelector} from '../Stores/hooks';
import {
  receiveNotification,
  setNotificationReadState,
  setSocketConnected,
} from '../Stores/slices/notification.slice';
import {selectUserToken} from '../Stores/slices/user.slice';

/**
 * Keeps a Socket.IO connection alive while the parent is signed in and
 * mirrors notification:new / notification:read into Redux.
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
    dispatch(asyncGetUnreadUserNotifications());

    const onConnected = () => {
      dispatch(setSocketConnected(true));
      dispatch(asyncGetUnreadUserNotifications());
    };

    const onDisconnect = () => {
      dispatch(setSocketConnected(false));
    };

    const onNotificationNew = payload => {
      const notification = payload?.notification;
      if (!notification) {
        return;
      }
      dispatch(receiveNotification(notification));
      const title = notification.title || 'New notification';
      const description = notification.content || '';
      showAppAlert({
        title,
        description,
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

    socket.on(SOCKET_EVENTS.CONNECTED, onConnected);
    socket.on('connect', onConnected);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, onNotificationNew);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, onNotificationRead);

    if (socket.connected) {
      onConnected();
    }

    return () => {
      socket.off(SOCKET_EVENTS.CONNECTED, onConnected);
      socket.off('connect', onConnected);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, onNotificationNew);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ, onNotificationRead);
      disconnectAppSocket();
      dispatch(setSocketConnected(false));
    };
  }, [token, dispatch]);
}

export default useNotificationSocket;

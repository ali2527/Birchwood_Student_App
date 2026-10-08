import {useEffect, useRef} from 'react';
import {AppState, NativeModules} from 'react-native';
import {showAppAlert} from '../Components/AppAlert/host';
import {
  connectAppSocket,
  disconnectAppSocket,
  SOCKET_EVENTS,
} from '../Service/socket';
import {
  asyncGetUnreadUserNotifications,
  asyncGetUnreadUserNotices,
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
 *
 * Only unread badge endpoints are polled here. Full notification/notice lists
 * load when those screens open — avoids spam on reconnect / debugger focus.
 */
export function useNotificationSocket() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectUserToken);
  const appStateRef = useRef(AppState.currentState);
  const lastBadgeAt = useRef(0);

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

    const refreshBadges = (force = false) => {
      const now = Date.now();
      if (!force && now - lastBadgeAt.current < 8000) {
        return;
      }
      lastBadgeAt.current = now;
      dispatch(asyncGetUnreadUserNotifications());
      dispatch(asyncGetUnreadUserNotices());
    };

    refreshBadges(true);

    const onConnected = () => {
      dispatch(setSocketConnected(true));
      // Socket reconnects often in debug — only refresh unread badges, not full lists.
      refreshBadges();
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
        try {
          NativeModules.SplashSystemUi?.playNoticeSound?.();
        } catch (error) {
          // The notice still arrives if the phone cannot play a sound.
        }
        refreshBadges(true);
        return;
      }
      showAppAlert({
        title: notification.title || 'New notification',
        description: notification.content || '',
        type: 'info',
      });
      refreshBadges(true);
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
      const prev = appStateRef.current;
      appStateRef.current = next;
      // Ignore inactive↔active (alerts / debugger). Only refresh after a real background.
      if (prev === 'background' && next === 'active') {
        refreshBadges();
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

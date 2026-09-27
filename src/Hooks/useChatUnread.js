import {useCallback, useEffect} from 'react';
import {AppState} from 'react-native';
import {asyncGetUnreadChatCount} from '../Stores/actions/class.action';
import {useAppDispatch, useAppSelector} from '../Stores/hooks';
import {selectUserToken} from '../Stores/slices/user.slice';

/**
 * Keeps parent unread teacher-chat count in Redux for the footer badge.
 */
export function useChatUnread() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectUserToken);

  const refresh = useCallback(() => {
    if (!token) {
      return;
    }
    dispatch(asyncGetUnreadChatCount());
  }, [dispatch, token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }
    refresh();
    const interval = setInterval(refresh, 45000);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [token, refresh]);

  return refresh;
}

export default useChatUnread;

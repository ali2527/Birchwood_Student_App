import {useEffect, useMemo} from 'react';
import {
  applyIncomingChatDeletion,
  applyIncomingChatMessage,
  chatKeys,
  useChatList,
} from '../Query/chats';
import {queryClient} from '../Query/client';
import {connectAppSocket, getAppSocket} from '../Service/socket';
import {useAppSelector} from '../Stores/hooks';
import {selectUserToken} from '../Stores/slices/user.slice';

function joinKnownChats(socket, role) {
  const chats = queryClient.getQueryData(chatKeys.list(role));
  (Array.isArray(chats) ? chats : []).forEach(chat => {
    if (chat?._id) socket.emit('join chat', String(chat._id));
  });
}

/** Keeps the parent chat list live on home, the chat list, and an open room. */
export function useChatUnread() {
  const token = useAppSelector(selectUserToken);
  const chatsQuery = useChatList('parent');
  const chatIds = useMemo(() => {
    const list = Array.isArray(chatsQuery.data) ? chatsQuery.data : [];
    return list
      .map(chat => String(chat?._id || ''))
      .filter(Boolean)
      .sort()
      .join(',');
  }, [chatsQuery.data]);

  useEffect(() => {
    if (!token) return undefined;
    const socket = connectAppSocket(token) || getAppSocket();
    if (!socket) return undefined;

    const join = () => joinKnownChats(socket, 'parent');
    const onMessage = record => applyIncomingChatMessage('parent', record);
    const onDeleted = record => applyIncomingChatDeletion('parent', record);

    socket.on('connect', join);
    socket.on('message', onMessage);
    socket.on('message:deleted', onDeleted);
    if (socket.connected) join();

    return () => {
      socket.off('connect', join);
      socket.off('message', onMessage);
      socket.off('message:deleted', onDeleted);
    };
  }, [token, chatIds]);
}

export default useChatUnread;

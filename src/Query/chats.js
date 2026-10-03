import {useQuery, useQueryClient} from '@tanstack/react-query';
import {callApi} from '../Service/api';
import {allApiPaths} from '../Service/apiPaths';
import {store} from '../Stores';
import {useAppSelector} from '../Stores/hooks';
import {selectUserToken} from '../Stores/slices/user.slice';
import {queryClient} from './client';

export const chatKeys = {
  list: role => ['chats', role],
  messages: chatId => ['chats', 'messages', String(chatId || '')],
};

function listFrom(res) {
  const docs = res?.data?.docs || res?.data || [];
  return Array.isArray(docs) ? docs : [];
}

export async function fetchChatList(role) {
  const res = await callApi({
    path: allApiPaths.getPath('getMyChats'),
    options: {params: {type: role}},
  });
  if (!res?.status) {
    const error = new Error(res?.message || 'Could not load chats');
    error.status = res?.statusCode;
    throw error;
  }
  return listFrom(res);
}

export function useChatList(role) {
  const token = useAppSelector(selectUserToken);
  return useQuery({
    queryKey: chatKeys.list(role),
    queryFn: () => fetchChatList(role),
    enabled: Boolean(token),
    refetchInterval: 45 * 1000,
  });
}

export function markChatListRead(role, chatId) {
  queryClient.setQueryData(chatKeys.list(role), current =>
    (current || []).map(chat =>
      String(chat?._id) === String(chatId)
        ? {...chat, parentUnread: 0, teacherUnread: 0, unreadMessage: 0}
        : chat,
    ),
  );
}

export function removeChatFromList(role, chatId) {
  queryClient.setQueryData(chatKeys.list(role), current =>
    (current || []).filter(chat => String(chat?._id) !== String(chatId)),
  );
  queryClient.removeQueries({queryKey: chatKeys.messages(chatId)});
}

export function patchChatMessages(chatId, updater) {
  if (!chatId) return;
  queryClient.setQueryData(chatKeys.messages(chatId), current =>
    updater(Array.isArray(current) ? current : []),
  );
}

export function upsertChatMessage(chatId, message) {
  if (!chatId || !message?._id) return;
  patchChatMessages(chatId, list => {
    if (list.some(item => String(item?._id) === String(message._id))) {
      return list.map(item =>
        String(item?._id) === String(message._id) ? {...item, ...message} : item,
      );
    }
    return [...list, message];
  });
}

const seenLiveEvents = new Set();

function rememberLive(key) {
  if (!key || seenLiveEvents.has(key)) return false;
  seenLiveEvents.add(key);
  if (seenLiveEvents.size > 300) {
    const first = seenLiveEvents.values().next().value;
    seenLiveEvents.delete(first);
  }
  return true;
}

export function messageChatId(record) {
  const chat = record?.chat || record?.chatId || record?.chatRoom;
  if (!chat) return '';
  return typeof chat === 'string' ? chat : String(chat._id || chat.id || '');
}

function readingThisChat(chatId) {
  return String(store.getState()?.class?.readingChatId || '') === String(chatId);
}

function liveRecord(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  if (payload._id) return payload;
  if (payload.message?._id) return payload.message;
  return payload;
}

export function applyIncomingChatMessage(role, message) {
  const record = liveRecord(message);
  const chatId = messageChatId(record);
  const messageId = String(record?._id || '');
  if (!chatId || !messageId) return;
  const saved = {...record, _id: messageId, chat: chatId};
  upsertChatMessage(chatId, saved);
  if (!rememberLive(`${role}:message:${messageId}`)) return;

  const mine = saved.senderType === role;
  const reading = readingThisChat(chatId);
  let missing = false;
  queryClient.setQueryData(chatKeys.list(role), current => {
    if (!Array.isArray(current)) {
      missing = true;
      return current;
    }
    const index = current.findIndex(chat => String(chat?._id) === chatId);
    if (index < 0) {
      missing = true;
      return current;
    }
    const chat = current[index];
    const unreadKey = role === 'parent' ? 'parentUnread' : 'teacherUnread';
    let unread = Number(chat[unreadKey] || 0);
    if (reading) unread = 0;
    else if (!mine) unread += 1;
    const next = {
      ...chat,
      latestMessage: saved,
      [unreadKey]: unread,
      ...(role === 'parent' ? {unreadMessage: unread} : {}),
    };
    return [next, ...current.filter((_, itemIndex) => itemIndex !== index)];
  });
  if (missing) {
    queryClient.invalidateQueries({queryKey: chatKeys.list(role)});
  }
}

export function applyIncomingChatDeletion(role, record) {
  const chatId = messageChatId(record);
  const messageId = String(record?._id || '');
  if (!chatId || !messageId) return;
  if (!rememberLive(`${role}:delete:${messageId}:${record?.deletedForMe ? 'me' : 'all'}`)) return;
  if (record.deletedForMe) {
    patchChatMessages(chatId, list => list.filter(item => String(item?._id) !== messageId));
  } else if (record.deletedForEveryone) {
    patchChatMessages(chatId, list =>
      list.map(item =>
        String(item?._id) === messageId
          ? {...item, content: '', deletedForEveryone: true, attachment: undefined}
          : item,
      ),
    );
  }
  queryClient.setQueryData(chatKeys.list(role), current => {
    if (!Array.isArray(current)) return current;
    return current.map(chat => {
      if (String(chat?._id) !== chatId) return chat;
      if (String(chat?.latestMessage?._id || '') !== messageId) return chat;
      if (record.deletedForMe) {
        return {...chat, latestMessage: {...chat.latestMessage, hiddenForMe: true, content: ''}};
      }
      return {
        ...chat,
        latestMessage: {...chat.latestMessage, content: '', deletedForEveryone: true, attachment: undefined},
      };
    });
  });
}

async function fetchMessages(chatId) {
  const res = await callApi({
    path: allApiPaths.getPath('getMessagesByChatRoomId', {chatRoomId: chatId}),
    options: {params: {page: 1, limit: 100}},
  });
  if (!res?.status && !res?.data) {
    const error = new Error(res?.message || 'Could not load messages');
    error.status = res?.statusCode;
    throw error;
  }
  const docs = res?.data?.docs || [];
  return [...docs].reverse();
}

export function useChatMessages(chatId) {
  const token = useAppSelector(selectUserToken);
  return useQuery({
    queryKey: chatKeys.messages(chatId),
    queryFn: () => fetchMessages(chatId),
    enabled: Boolean(token && chatId),
  });
}

export function useInvalidateChats() {
  const client = useQueryClient();
  return role => client.invalidateQueries({queryKey: chatKeys.list(role)});
}

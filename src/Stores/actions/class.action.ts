import { createAsyncThunk } from '@reduxjs/toolkit';
import { ChatRoom, ChildAttendance, ClassRoom, CreateChatPayload, CreateChatRoomMessagePayload, CreateChatRoomMessageResponse, MessagesResponse } from '../../Types/Class';
import { callApi } from '../../Service/api';
import { allApiPaths, ApiPaths } from '../../Service/apiPaths';
import { setAttendances, setChatRoomMessage, setChatRoomMessages, setChild, setClassRoom, setUnreadChatCount } from '../slices/class.slice';
import { setLoading } from '../slices/common.slice';
import { asyncShowError, asyncShowSuccess } from './common.action';
import { RootState } from '..';

export const asyncGetClassRoomById = createAsyncThunk(
  'getClassRoomById',
  async (_, { dispatch, getState }) => {
    dispatch(setLoading(true));

    const classRoomId: string = (getState() as RootState).user.user?.classroom?._id

    const res = await callApi<{ classroom: ClassRoom }>({
      path: allApiPaths.getPath('getClassRoomById', {
        classRoomId
      }),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(
        setClassRoom(res.data?.classroom!)
      );
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncChildMonthlyAttendance = createAsyncThunk(
  'childMonthlyAttendance',
  async ({ childId, month, year }: any, { dispatch }) => {
    const res = await callApi<ChildAttendance>({
      path: (allApiPaths.getPath('childMonthlyAttendance', { childId }) +
        `?month=${month}&year=${year}`) as ApiPaths,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(setAttendances({ _id: childId, ...res.data! }));
    }
    return res;
  }
);

export const asyncCreateChat = createAsyncThunk(
  'createChat',
  async (data: CreateChatPayload, { dispatch }) => {
    const res = await callApi<ChatRoom, CreateChatPayload>({
      method: 'POST',
      path: allApiPaths.getPath('createChat'),
      body: data,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      if (res.data?._id) {
        dispatch(setChild({ _id: data.children, chats: res.data }));
      }
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncCreateChatRoomMessage = createAsyncThunk(
  'createChatRoomMessage',
  async (data: CreateChatRoomMessagePayload, { dispatch }) => {
    const res = await callApi<CreateChatRoomMessageResponse, CreateChatRoomMessagePayload>({
      method: 'POST',
      path: allApiPaths.getPath('createChatRoomMessage'),
      body: data,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      if (res.data?.message?._id) {
        dispatch(setChatRoomMessage({ chatRoomId: res.data.message.chat, message: res.data.message }));
      }
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetMessagesByChatRoomId = createAsyncThunk(
  'getMessagesByChatRoomId',
  async ({ chatRoomId }: { chatRoomId: string }, { getState, dispatch }) => {

    const { page, pages } = (getState() as RootState).class.chatRooms?.["chatRoom_" + chatRoomId]?.messagePagination ?? {}

    if (page >= pages) {
      return {
        status: true,
        message: 'You\'ve reached the end of the list'
      }
    }

    if (!page) {
      dispatch(setLoading(true));
    }

    const res = await callApi<MessagesResponse>({
      path: (allApiPaths.getPath('getMessagesByChatRoomId', {
        chatRoomId
      }) +
        `?limit=${10}&page=${(page ?? 0) + 1}`) as ApiPaths,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      if (res.data?.docs?.length) {
        dispatch(setChatRoomMessages({ chatRoomId, ...res.data }));
      }
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetUnreadChatCount = createAsyncThunk(
  'getUnreadChatCount',
  async (_, { dispatch }) => {
    try {
      const res = await callApi<any>({
        path: allApiPaths.getPath('getMyChats'),
        options: { params: { type: 'parent' } },
      });
      const docs = res?.data?.docs || res?.data || [];
      const list = Array.isArray(docs) ? docs : [];
      const total = list.reduce((sum: number, chat: any) => {
        const n = Number(chat?.parentUnread ?? chat?.unreadMessage ?? 0);
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0);
      dispatch(setUnreadChatCount(total));
      return total;
    } catch (error) {
      console.log('getUnreadChatCount failed', error);
      return 0;
    }
  }
);
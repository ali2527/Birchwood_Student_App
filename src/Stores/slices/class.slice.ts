import {
  PayloadAction,
  createDraftSafeSelector,
  createSlice
} from '@reduxjs/toolkit';
import { isSameWeek } from 'date-fns';
import { RootState } from '..';
import { Child, ChildAttendance, ClassResponse, ClassRoom, Message, MessagesResponse } from '../../Types/Class';
import { MessagePaginationProps, PaginationProps } from '../../Types/Common';

interface ClassSliceState {
  classRoom: ClassRoom;
  attendances: Record<string, ChildAttendance>;
  children: Record<string, Child>;
  pagination: PaginationProps;
  chatRooms: Record<string, {
    messages: Record<string, Message>,
    messagePagination: MessagePaginationProps
  }>;
}

const initialState: ClassSliceState = {
  classRoom: {} as ClassRoom,
  children: {},
  attendances: {},
  pagination: {} as PaginationProps,
  chatRooms: {}
};

const ClassSlice = createSlice({
  name: 'Class',
  initialState,
  reducers: {
    setClassRoom: (state, { payload }: PayloadAction<ClassRoom>) => {
      state.classRoom = payload;
    },
    setChildren: (state, { payload }: PayloadAction<ClassResponse>) => {
      const { docs, ...pagination } = payload;
      state.children = docs.reduce((acc, curr) => {
        acc["child_" + curr._id] = curr;
        return acc;
      }, {} as Record<string, Child>);
      state.pagination = pagination;
    },
    setChild: (state, { payload }: PayloadAction<Partial<Child>>) => {
      state.children["child_" + payload._id] = { ...state.children["child_" + payload._id], ...payload };
    },
    setAttendances: (state, { payload }: PayloadAction<Partial<ChildAttendance>>) => {
      state.attendances[payload._id] = { ...state.attendances[payload._id], ...payload };
    },
    setChatRoomMessages: (state, { payload }: PayloadAction<MessagesResponse & { chatRoomId: string }>) => {
      const { chatRoomId, docs, ...pagination } = payload;

      const chatRoomKey = `chatRoom_${chatRoomId}`;
      state.chatRooms[chatRoomKey] = state.chatRooms[chatRoomKey] || { messages: {}, messagePagination: {} };
      docs.forEach((message) => {
        state.chatRooms[chatRoomKey].messages[`message_${message._id}`] = {
          ...message,
          text: message.content,
          user: {
            _id: message.sender,
            name: 'Sender Name',
          },
        };
      });
      state.chatRooms[chatRoomKey].messagePagination = pagination;
    },
    setChatRoomMessage: (state, { payload }: PayloadAction<{ chatRoomId: string, message: Message }>) => {
      const { chatRoomId, message } = payload;
      const chatRoomKey = `chatRoom_${chatRoomId}`;
      state.chatRooms[chatRoomKey] = state.chatRooms[chatRoomKey] || { messages: {}, messagePagination: {} };
      state.chatRooms[chatRoomKey].messages = {
        [`message_${message._id}`]: {
          ...message,
          text: message.content,
          user: {
            _id: message.sender,
            name: 'Sender Name',
          },
        },
        ...state.chatRooms[chatRoomKey].messages,
      }
    },
    removeChatRoomMessage: (state, { payload }: PayloadAction<{ chatRoomId: string, messageId: string }>) => {
      const { chatRoomId, messageId } = payload;
      const chatRoomKey = `chatRoom_${chatRoomId}`;
      delete state.chatRooms[chatRoomKey].messages[`message_${messageId}`];
    },
    resetClassState: _ => initialState,
  },
});

export const { setClassRoom, setChildren, setChild, setAttendances, setChatRoomMessages, setChatRoomMessage, resetClassState } =
  ClassSlice.actions;

export default ClassSlice.reducer;

export const selectClassRoom = createDraftSafeSelector(
  [(state: RootState) => state.class],
  state => state.classRoom
);

export const selectChildren = createDraftSafeSelector(
  [(state: RootState) => state.class],
  state => Object.values(state.children) as Child[]
);

export const selectChildById = (childId: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.class.children],
    children => children["child_" + childId] as Child
  );

export const selectCurrentWeekAttendance = (_id: string, weekStart: Date) =>
  createDraftSafeSelector(
    [(state: RootState) => state.class.attendances],
    attendances => {
      return attendances?.[_id]?.attendance?.map((attendance => {
        if (isSameWeek(attendance.createdAt, weekStart))
          return attendance
      }))
    }
  );

export const selectChatRoomMessages = (chatRoomId: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.class.chatRooms],
    chatRooms => Object.values(chatRooms?.["chatRoom_" + chatRoomId]?.messages || {})
  );

export const selectChatRoomPagination = (chatRoomId: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.class.chatRooms],
    chatRooms => chatRooms?.["chatRoom_" + chatRoomId]?.messagePagination || {}
  );


import { MessagePaginationProps, PaginationProps } from "./Common";

export interface ClassRoom {
  _id: string;
  classroomId: string;
  classroomName: string;
  classroomGrade: number;
  classroomBatch: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  teacher: string
}

export interface Parent {
  _id: string;
  parentId: string;
  fatherFirstName: string;
  fatherLastName: string;
  motherFirstName: string;
  motherLastName: string;
  email: string;
  phone: string;
  status: string;
  childrens: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  _id: string;
  rollNumber: string;
  term: string;
  firstName: string;
  lastName: string;
  age: number;
  birthday: string;
  classroom: ClassRoom;
  checkIn: false;
  status: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  parent: Parent;
  todayAttendance: ChildCheckInOutResponse;
  chats: ChatRoom;
}

export interface ChatRoom {
  _id: string;
  isGroupChat: boolean;
  unreadMessage: number;
  teacher: string;
  parent: string;
  children: string;
  status: string;
  latestMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: string;
  content: string;
  chat: string;
  createdAt: string;
  updatedAt: string;

  // These properties are added just to support chat library
  text?: string;
  user?: {
    _id: string;
    name: string;
  }
}

export interface Category {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassResponse extends PaginationProps {
  docs: Child[];
}

export interface MessagesResponse extends MessagePaginationProps {
  docs: Message[];
}

export interface CreateChatPayload {
  teacher: string;
  parent: string;
  children: string;
}

export interface CreateChatRoomMessagePayload {
  chatId: string;
  content: string;
}

export interface CreateChatRoomMessageResponse {
  message: Message;
}

export interface CategoryResponse extends PaginationProps {
  docs: Category[],
}

export interface ChildCheckInOutPayload {
  children: string;
  checkIn: string;
}

export interface ChildCheckInOutResponse {
  _id: string;
  children: string;
  checkIn: string | null;
  checkOut: string | null;
  leaveReason: string;
  sickDescription: string;
  status: string;
  createdAt: string;
}

export interface ChildAttendance {
  [index: string]: any;
  attendance: ChildCheckInOutResponse[];
  stats: {
    PRESENT: number;
    ABSENT: number;
    LEAVE: number;
    HOLIDAY: number;
  };
}
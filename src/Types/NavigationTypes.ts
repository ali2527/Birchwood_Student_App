export enum ERootStack {
  auth = 'auth',
  main = 'main',
}

export type RootStackParams = {
  auth: undefined;
  main: undefined;
};

export enum EAuthStack {
  signIn = 'signIn',
  emailVerification = 'emailVerification',
  verificaionCode = 'verificaionCode',
  resetPassword = 'resetPassword',
  main = 'main',
}

export type AuthStackParams = {
  signIn: undefined;
  emailVerification: undefined;
  verificaionCode: {
    email: string;
  };
  resetPassword: {
    email: string;
    code: string;
  };
  main: undefined;
};

export enum EMainStack {
  home = 'home',
  profileRoutes = 'profileRoutes',
  myClassRoutes = 'myClassRoutes',
  postRoutes = 'postRoutes',
  diaryRoutes = 'diaryRoutes',
  chatRoutes = 'chatRoutes',
  attendanceRoutes = 'attendanceRoutes',
  timeTableRoutes = 'timeTableRoutes',
  changePassword = 'changePassword',
  checkOut = 'checkOut',
  logOut = 'logOut',
}

export type MainStackParams = {
  home: undefined;
  profileRoutes: undefined;
  myClassRoutes: undefined;
  postRoutes: undefined;
  diaryRoutes: undefined;
  chatRoutes: undefined;
  attendanceRoutes: undefined;
  timeTableRoutes: undefined;
  changePassword: undefined;
  checkOut: undefined;
  logOut: undefined;
};

export enum EProfileStack {
  profile = 'profile',
  editPersonalInfo = 'editPersonalInfo',
  editEducation = 'editEducation',
  editExperience = 'editExperience',
}

export type ProfileStackParams = {
  profile: undefined;
  editPersonalInfo: undefined;
  editEducation: undefined;
  editExperience: undefined;
};

export enum EClassStack {
  class = 'class',
  childInfo = 'childInfo',
}

export type ClassStackParams = {
  class: undefined;
  childInfo: {
    childId: string;
  };
};

export enum EPostStack {
  posts = 'posts',
  activityList = 'activityList',
  createPost = 'createPost',
}

export type PostStackParams = {
  posts: undefined;
  activityList: undefined;
  createPost: {
    activityId: string;
    postId: string;
  };
}

export enum EDiaryStack {
  diary = 'diary',
  createDiary = 'createDiary',
}

export type DiaryStackParams = {
  diary: undefined;
  createDiary: {
    homeWorkId?: string
  };
};

export enum EChatStack {
  chat = 'chat',
  createChat = 'createChat',
}

export type ChatStackParams = {
  chat: undefined;
  createChat: {
    childId: string;
    chatRoomId: string;
  };
};

export enum EAttendanceStack {
  attendance = 'attendance',
}

export type AttendanceStackParams = {
  attendance: undefined;
};

export enum ETimeTableStack {
  timeTable = 'timeTable',
  createTimeTable = 'createTimeTable',
}

export type TimeTableStackParams = {
  timeTable: undefined;
  createTimeTable: {
    timeTableRecordId?: string
    day?: string
  };
};
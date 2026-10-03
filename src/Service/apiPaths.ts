export enum AuthApiPaths {
  login = 'auth/signin',
  signup = 'auth/signup',
}

export enum ResetPasswordApiPaths {
  emailVerification = 'auth/emailVerificationCode',
  codeVerification = 'auth/verifyRecoverCode',
  resetPassword = 'auth/resetPassword',
}

export enum ProfileApiPaths {
  profile = 'profile/getProfile',
  updateProfile = 'profile/updateProfile',
  changePassword = 'profile/changePassword',
  getAllMyChildren = 'profile/getAllMyChildren',
  checkIn = 'children/attendance/markCheckIn',
  checkOut = 'children/attendance/markCheckOut',
  markLeave = 'children/attendance/markLeave',
  monthlyAttendance = 'children/attendance/getAttendanceByMonth/:childId',
  getAllChildAttendance = 'children/attendance/getAllChildAttendance/:childId',
  getAllHolidays = 'holiday/getAllHolidays',
  getAllChildVouchers = 'fees/getAllChildVouchers/:childId',
  getActiveGalleries = 'gallery/getActiveGalleries',
  assignChild = 'profile/assignChild',
  updateChildHealth = 'profile/updateChildHealth',
  getMonthlyAttendanceStats = 'children/attendance/getMonthlyAttendanceStats/:childId',
  getUserNotifications = 'notification/getUserNotifications',
  getUnreadUserNotifications = 'notification/getUnreadUserNotifications',
  markNotificationAsRead = 'notification/markAsRead/:id',
  deleteUserNotification = 'notification/deleteUserNotification/:id',
  getActiveAdvertisements = 'advertisement/getActiveAdvertisements',
}

export enum ClassApiPaths {
  getClassRoomById = 'classroom/getClassroomById/:classRoomId',
  childMonthlyAttendance = 'children/attendance/getAttendanceByMonth/:childId',
  createChat = 'chat/createChat',
  getMyChats = 'chat/getMyChats',
  getMessagesByChatRoomId = 'message/getChatMessages/:chatRoomId',
  createChatRoomMessage = 'message/createMessage',
  deleteChatMessage = 'message/deleteMessage',
  markChatRead = 'message/markChatRead',
  deleteChat = 'chat/deleteChat',
}

export enum PostApiPaths {
  getActivities = 'activity/getAllActivities',
  createPost = 'post/addPost',
  updatePost = 'post/updatePost/:postId',
  getAllPosts = 'post/getAllPosts',
  getAllClassPosts = 'post/getAllClassPosts/:classRoomId',
  getAllChildPosts = 'post/getAllChildPosts/:childId',
  likePost = 'post/likePost/:postId',
  createPostComment = 'post/commentPost/:postId',
  getAllPostComments = 'post/getAllPostComments/:postId',
  deletePost = 'post/deletePost/:postId',
}

export enum SupportApiPaths {
  createSupportTicket = 'support/createTicket',
  getAllSupportTickets = 'support/getAllTickets',
  getSupportTicket = 'support/getTicketById/:id',
  updateSupportTicket = 'support/updateTicket/:id',
  deleteSupportTicket = 'support/deleteTicket/:id',
  getSupportMessages = 'support/getTicketMessages/:id',
  sendSupportMessage = 'support/sendMessage/:id',
  markSupportTicketRead = 'support/markTicketRead/:id',
}

export enum ResultApiPaths {
  getPublishedByChild = 'result/getPublishedByChild/:childId',
  getPublishedExam = 'result/getPublishedExam/:id',
}

export enum SettingsApiPaths {
  getAppModules = 'settings/getModules',
  getAppInfo = 'settings/getAppInfo',
  openDays = 'settings/openDays',
}

export enum AssessmentApiPaths {
  getPublishedAssessmentsByChild = 'assessment/getPublishedByChild/:childId',
}

export enum DiaryApiPaths {
  getAllHomeWork = 'homework/getAllHomework',
  getAllChildHomework = 'homework/getAllChildHomework/:childId',
  getHomeworkById = 'homework/getHomeworkById/:homeWorkId',
}

export enum TimeTableApiPaths {
  getAllClassTimeTable = 'timetable/getAllClassTimetables/:classRoomId',
}

export const AllApiPaths = Object.freeze({
  ...AuthApiPaths,
  ...ResetPasswordApiPaths,
  ...ProfileApiPaths,
  ...ClassApiPaths,
  ...PostApiPaths,
  ...SupportApiPaths,
  ...ResultApiPaths,
  ...SettingsApiPaths,
  ...AssessmentApiPaths,
  ...DiaryApiPaths,
  ...TimeTableApiPaths
});

export type ApiPaths = AuthApiPaths | ResetPasswordApiPaths | ProfileApiPaths | ClassApiPaths | PostApiPaths | SupportApiPaths | ResultApiPaths | SettingsApiPaths | AssessmentApiPaths | DiaryApiPaths | TimeTableApiPaths;

class ApiPathHandler<T> {
  private paths: T;

  constructor(paths: T) {
    this.paths = paths;
  }

  getPath<K extends keyof T>(
    key: K,
    params?: Record<string, string | number>
  ): T[K] {
    let path: string = this.paths[key] as string;
    if (!params || !Object.keys(params ?? {}).length) {
      return path as T[K];
    }

    for (const param in params) {
      path = path.replace(`:${param}`, params[param].toString());
    }
    return path as T[K];
  }
}

export const allApiPaths = new ApiPathHandler(AllApiPaths);

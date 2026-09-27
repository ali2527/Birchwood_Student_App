import { ClassRoom } from "./Class";

export interface User {
  _id: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  image: string;
  bio: string;
  fatherFirstName?: string;
  fatherLastName?: string;
  motherFirstName?: string;
  motherLastName?: string;
  fatherImage?: string;
  motherImage?: string;
  checkIn: boolean;
  checkOut: boolean;
  status: string;
  education: UserEducation[];
  employment: UserExperience[];
  classroom: ClassRoom;
  todayAttendance: {
    status: string;
  };
  childrens?: string[];
  tokens: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LoginUserPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
  successMessage?: string;
}

export interface LoginUserResponse {
  user: User;
  parent: User;
  token: string;
  todayAttendance: UserCheckInOutLeave;
}

export interface EmailVerificationPayload {
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
  encodedEmail: string;
}

export interface OtpVerificationPayload {
  email: string;
  code: string;
}

export interface OtpVerificationResponse {
  message: string;
  encodedEmail: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirmPassword: string;
}

export interface UpdateUserProfilePayload {
  city?: string;
  state?: string;
  address?: string;
  image?: string;
}

export interface UserEducation {
  _id: string;
  school: string;
  subject: string[];
  start: Date;
  end: Date;
}

export interface UserExperience {
  _id: string;
  school: string;
  position: string;
  address: string;
  start: Date;
  end: Date;
}

export interface UserCheckInOutLeave {
  _id: string;
  teacher: string;
  checkIn: string | null;
  checkOut: string | null;
  leaveReason: string;
  sickDescription: string;
  leaveType: string;
  status: string;
}

export interface UserCheckInOutResponse extends Omit<UserCheckInOutLeave, 'teacher'> {
  teacher: Omit<User, 'todayAttendance'>;
}

/** Single row from GET .../getAllChildAttendance/:childId */
export interface ChildAttendanceRecord {
  _id: string;
  children: string;
  markedBy?: string;
  checkIn: string | null;
  checkOut?: string | null;
  leaveReason?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllChildAttendanceResponse {
  docs: ChildAttendanceRecord[];
  totalDocs?: number;
  limit?: number;
  page?: number;
  totalPages?: number;
  pagingCounter?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface UserAttendance {
  [index: string]: any;
  attendance: Record<string, any>[];
  stats: {
    PRESENT: number;
    ABSENT: number;
    LEAVE: number;
    HOLIDAY: number;
  };
}

export interface UserAttendanceResponse extends UserAttendance {
  [index: string]: any;
}

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  title?: string;
  type?: string;
  endDate?: string;
  audience?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  content?: string;
  isRead?: boolean;
  type?: string;
  source?: string;
  broadcastId?: string;
  createdAt: string;
}

export interface UserNotificationsResponse {
  docs?: AppNotification[];
  totalDocs?: number;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
}

/** POST children/attendance/markLeave */
export interface MarkChildLeaveBody {
  children: string;
  leaveReason: string;
  checkIn: string;
  markedBy: 'PARENT';
}

/** Leave screen → thunk (use YYYY-MM-DD strings so RN/Redux never breaks Date prototypes). */
export interface ParentLeaveSubmitInput {
  children: string;
  leaveType: string;
  reason?: string;
  startDate: string | Date;
  endDate?: string | Date | null;
}

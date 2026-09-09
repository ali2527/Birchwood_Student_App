import { createAsyncThunk } from '@reduxjs/toolkit';
import { callApi } from '../../Service/api';
import { allApiPaths, ApiPaths } from '../../Service/apiPaths';
import {
  ChangePasswordPayload,
  EmailVerificationPayload,
  EmailVerificationResponse,
  Holiday,
  LoginUserPayload,
  LoginUserResponse,
  OtpVerificationPayload,
  OtpVerificationResponse,
  ResetPasswordPayload,
  User,
  UserAttendance,
  UserAttendanceResponse,
  UserCheckInOutLeave,
  UserCheckInOutResponse,
  UserEducation,
  UserExperience,
  MarkChildLeaveBody,
  ParentLeaveSubmitInput,
  GetAllChildAttendanceResponse,
  ChildAttendanceRecord,
  UserNotificationsResponse,
} from '../../Types/User';
import { Child, ClassResponse } from '../../Types/Class';
import { setChildren, setSelectedChild } from '../slices/class.slice';
import { setLoading } from '../slices/common.slice';
import {
  resetUserState,
  setHolidays,
  setUser,
  setUserAttendance,
  setUserState,
} from '../slices/user.slice';
import { asyncShowError, asyncShowSuccess } from './common.action';
import { persistAuthSession } from '../index';
import type { RootState } from '../index';

export const asyncLogin = createAsyncThunk(
  'login',
  async (data: LoginUserPayload, { dispatch }) => {
    dispatch(setLoading(true));

    const rememberMe = data.rememberMe !== false;
    const credentials = {
      email: String(data.email || '').trim().toLowerCase(),
      password: data.password,
    };

    const loginPath = allApiPaths.getPath('login');
    const resolvedLoginPath = (
      loginPath.includes('teacher/auth') ? 'auth/signin' : loginPath
    ) as ApiPaths;
    console.log('login path resolved:', resolvedLoginPath);

    const res = await callApi<LoginUserResponse, LoginUserPayload>({
      method: 'POST',
      path: resolvedLoginPath,
      body: credentials,
      axiosSecure: false,
    });
    console.log('res:login:::::', res);

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else if (res.data?.token) {
      let { todayAttendance, user, parent, token } = res.data ?? {};
      const userData = user || parent;
      dispatch(
        setUserState({
          user: { ...userData, todayAttendance },
          holidays: {},
          attendance: {} as UserAttendance,
          token,
          rememberMe,
        })
      );
      await persistAuthSession();
      dispatch(
        asyncShowSuccess(
          data.successMessage || res.message || 'Signed in successfully',
        ),
      );
    } else {
      dispatch(
        asyncShowError(
          res.message || 'Login succeeded but no session token was returned.'
        )
      );
    }
    dispatch(setLoading(false));

    return res;
  }
);

export const asyncSignup = createAsyncThunk(
  'signup',
  async (data: any, { dispatch }) => {
    dispatch(setLoading(true));
    const isFormData = data instanceof FormData;
    const res = await callApi<any, any>({
      method: 'POST',
      path: allApiPaths.getPath('signup'),
      body: data,
      isFormData,
      axiosSecure: false,
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    }
    // Signup does not issue a JWT — caller signs in for a USER token.
    dispatch(setLoading(false));

    return res;
  }
);

export const asyncEmailVerification = createAsyncThunk(
  'emailVerification',
  async (data: EmailVerificationPayload, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<
      EmailVerificationResponse,
      EmailVerificationPayload
    >({
      method: 'POST',
      path: allApiPaths.getPath('emailVerification'),
      body: data,
      axiosSecure: false,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(asyncShowSuccess(res.message));
    }
    dispatch(setLoading(false));
    return res;
  }
);

export const asyncOtpVerification = createAsyncThunk(
  'otpVerification',
  async (data: OtpVerificationPayload, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<OtpVerificationResponse, OtpVerificationPayload>({
      method: 'POST',
      path: allApiPaths.getPath('codeVerification'),
      body: data,
      axiosSecure: false,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(asyncShowSuccess(res.message));
    }
    dispatch(setLoading(false));
    return res;
  }
);

export const asyncResetPassword = createAsyncThunk(
  'resetPassword',
  async (data: ResetPasswordPayload, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<{}, ResetPasswordPayload>({
      method: 'POST',
      path: allApiPaths.getPath('resetPassword'),
      body: data,
      axiosSecure: false,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(asyncShowSuccess(res.message));
    }
    dispatch(setLoading(false));
    return res;
  }
);

export const asyncChangePassword = createAsyncThunk(
  'changePassword',
  async (data: ChangePasswordPayload, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<{}, ChangePasswordPayload>({
      method: 'POST',
      path: allApiPaths.getPath('changePassword'),
      body: data,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(asyncShowSuccess(res.message));
    }
    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetUserProfile = createAsyncThunk(
  'profile/get',
  async (_, { dispatch }) => {
    dispatch(setLoading(true));
    const res = await callApi<User>({
      path: allApiPaths.getPath('profile'),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      if (res.data?._id) {
        let { classroom, ...teacher } = res.data ?? {}
        // Map fatherFirstName/lastName to firstName/lastName for consistency if needed
        const userData = {
          ...teacher,
          firstName: teacher.fatherFirstName || teacher.firstName || '',
          lastName: teacher.fatherLastName || teacher.lastName || '',
        };
        dispatch(setUser(userData));
      }
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetAllMyChildren = createAsyncThunk(
  'profile/getAllMyChildren',
  async (_, { dispatch, getState }) => {
    dispatch(setLoading(true));
    const res = await callApi<ClassResponse | Child[] | { children?: Child[] }>({
      path: allApiPaths.getPath('getAllMyChildren'),
    });
    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      const payload = (res.data ?? res) as any;
      const docs: Child[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.children)
          ? payload.children
          : Array.isArray(payload?.docs)
            ? payload.docs
            : [];

      dispatch(setChildren({ docs } as ClassResponse));

      const current = (getState() as RootState).class.selectedChild;
      const next =
        (current && docs.find(child => child._id === current._id)) || docs[0] || null;
      dispatch(setSelectedChild(next));
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncUpdateProfile = createAsyncThunk(
  'updateProfile',
  async (data: FormData | Record<string, any>, { dispatch }) => {
    dispatch(setLoading(true));

    // Check if data is FormData (for image upload) or regular object (for profile update)
    const isFormData = data instanceof FormData;

    const res = await callApi<User, FormData | Record<string, any>>({
      method: 'POST',
      path: allApiPaths.getPath('updateProfile'),
      isFormData: isFormData,
      body: data,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      if (res.data) {
        // Map API response fields to User type
        const responseData = res.data as any;
        const userData = {
          ...responseData,
          firstName: responseData.fatherFirstName || responseData.firstName || '',
          lastName: responseData.fatherLastName || responseData.lastName || '',
        };
        dispatch(setUser(userData));
      }
      dispatch(asyncShowSuccess(res.message));
    }
    dispatch(setLoading(false));
    return res;
  }
);

export const asyncUpdateEducation = createAsyncThunk(
  'updateEducation',
  async (data: any, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<User, UserEducation>({
      method: 'POST',
      path: allApiPaths.getPath('updateProfile'),
      body: data,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(setUser({ ...res.data }));
      dispatch(asyncShowSuccess(res.message));
    }
    dispatch(setLoading(false));
    return res;
  }
);

export const asyncUpdateExperience = createAsyncThunk(
  'updateExperience',
  async (data: any, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<User, UserExperience>({
      method: 'POST',
      path: allApiPaths.getPath('updateProfile'),
      body: data,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(setUser({ ...res.data }));
      dispatch(asyncShowSuccess(res.message));
    }
    dispatch(setLoading(false));
    return res;
  }
);

export const asyncCheckInUser = createAsyncThunk(
  'checkIn',
  async (data: any, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<{ newAttendance: UserCheckInOutResponse }, { checkIn: string }>({
      method: 'POST',
      path: allApiPaths.getPath('checkIn'),
      body: data,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      if (res.data?.newAttendance) {
        let { teacher: { classroom, ...teacher }, ...todayAttendance } = res.data?.newAttendance ?? {}
        dispatch(setUser({ todayAttendance, ...teacher }));
        dispatch(asyncShowSuccess(res.message));
      }
    }
    dispatch(setLoading(false));
    return res;
  }
);

export const asyncCheckOutUser = createAsyncThunk(
  'checkOut',
  async (data: any, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<{ newAttendance: UserCheckInOutResponse }, { checkOut: string }>({
      method: 'POST',
      path: allApiPaths.getPath('checkOut'),
      body: data,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(setUser({ todayAttendance: res.data?.newAttendance }));
      dispatch(asyncShowSuccess(res.message));
    }
    dispatch(setLoading(false));
    return res;
  }
);

function coerceToDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  // Hermes / remote contexts: Date may fail instanceof but still expose getTime()
  const duck = value as { getTime?: () => number };
  if (typeof duck?.getTime === 'function') {
    const t = duck.getTime();
    if (typeof t === 'number' && !Number.isNaN(t)) {
      return new Date(t);
    }
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const maybeMoment = value as { toDate?: () => Date };
  if (typeof maybeMoment?.toDate === 'function') {
    const d = maybeMoment.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }
  return null;
}

function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Normalize any calendar/thunk input to YYYY-MM-DD (local calendar day). */
function ymdFromInput(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : formatLocalYmd(d);
  }
  const d = coerceToDate(value);
  return d ? formatLocalYmd(d) : null;
}

/** Inclusive YYYY-MM-DD list using only fresh Date() instances (avoids broken payload Dates). */
function enumerateYmdInclusive(startYmd: string, endYmd: string): string[] {
  const parse = (s: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    return { y: +m[1], mo: +m[2], d: +m[3] };
  };
  const a = parse(startYmd);
  const b = parse(endYmd);
  if (!a || !b) return [];
  let start = new Date(a.y, a.mo - 1, a.d, 12, 0, 0, 0);
  let end = new Date(b.y, b.mo - 1, b.d, 12, 0, 0, 0);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (end < start) {
    const t = start;
    start = end;
    end = t;
  }
  const days: string[] = [];
  const cur = new Date(start.getTime());
  while (cur <= end) {
    days.push(formatLocalYmd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export const asyncUserLeave = createAsyncThunk(
  'userLeave',
  async (data: ParentLeaveSubmitInput, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const startYmd = ymdFromInput(data.startDate);
      const endYmd =
        ymdFromInput(data.endDate ?? data.startDate) ?? startYmd;
      if (!startYmd || !endYmd) {
        const err = { status: false as const, message: 'Invalid or missing leave dates.' };
        dispatch(asyncShowError(err.message));
        return err;
      }
      const dayKeys = enumerateYmdInclusive(startYmd, endYmd);
      if (dayKeys.length === 0) {
        const err = { status: false as const, message: 'Invalid date range.' };
        dispatch(asyncShowError(err.message));
        return err;
      }
      let lastRes: Awaited<
        ReturnType<typeof callApi<{ todayAttendance: UserCheckInOutLeave }, MarkChildLeaveBody>>
      > | null = null;

      for (const ymd of dayKeys) {
        const body: MarkChildLeaveBody = {
          children: data.children,
          leaveReason: data.leaveType,
          checkIn: `${ymd}T08:00:00.000Z`,
          markedBy: 'PARENT',
        };

        const res = await callApi<{ todayAttendance: UserCheckInOutLeave }, MarkChildLeaveBody>({
          method: 'POST',
          path: allApiPaths.getPath('markLeave'),
          body,
        });
        lastRes = res;

        if (!res?.status) {
          dispatch(asyncShowError(res.message));
          return res;
        }
      }

      if (lastRes?.status) {
        dispatch(
          setUser({
            todayAttendance: lastRes.data?.todayAttendance,
            checkIn: true,
          })
        );
        dispatch(asyncShowSuccess(lastRes.message));
      }
      return lastRes!;
    } catch (e: any) {
      dispatch(asyncShowError(e.message || 'Something went wrong'));
      throw e;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/** Fetches all pages of child attendance for calendar (parent app). */
export const asyncGetAllChildAttendance = createAsyncThunk(
  'getAllChildAttendance',
  async (childId: string, { dispatch }) => {
    if (!childId?.trim()) {
      dispatch(
        setUserAttendance({
          attendance: [],
          stats: { PRESENT: 0, ABSENT: 0, LEAVE: 0, HOLIDAY: 0 },
        })
      );
      return { status: false, message: 'No child selected' };
    }

    dispatch(setLoading(true));
    try {
      const allDocs: ChildAttendanceRecord[] = [];
      let page = 1;
      const limit = 50;
      let hasNext = true;

      while (hasNext) {
        const basePath = allApiPaths.getPath('getAllChildAttendance', {
          childId,
        }) as string;
        const path = `${basePath}?page=${page}&limit=${limit}` as ApiPaths;

        const res = await callApi<GetAllChildAttendanceResponse>({ path });

        if (!res?.status) {
          dispatch(asyncShowError(res.message));
          dispatch(
            setUserAttendance({
              attendance: [],
              stats: { PRESENT: 0, ABSENT: 0, LEAVE: 0, HOLIDAY: 0 },
            })
          );
          return res;
        }

        const raw = res.data as
          | GetAllChildAttendanceResponse
          | ChildAttendanceRecord[]
          | undefined;

        if (Array.isArray(raw)) {
          allDocs.push(...raw);
          hasNext = false;
        } else if (raw?.docs) {
          allDocs.push(...raw.docs);
          hasNext = Boolean(raw.hasNextPage);
          page += 1;
        } else {
          hasNext = false;
        }

        if (page > 100) break;
      }

      dispatch(
        setUserAttendance({
          attendance: allDocs as UserAttendance['attendance'],
          stats: { PRESENT: 0, ABSENT: 0, LEAVE: 0, HOLIDAY: 0 },
        })
      );
      return { status: true, message: '', data: { docs: allDocs } };
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const asyncUserMonthlyAttendance = createAsyncThunk(
  'monthlyAttendance',
  async ({ month, year }: any, { dispatch, getState }) => {
    dispatch(setLoading(true));
    try {
      const res = await callApi<UserAttendanceResponse>({
        path: (allApiPaths.getPath('getMonthlyAttendanceStats') +
          `?month=${month}&year=${year}`) as ApiPaths,
      });

      if (!res?.status) {
        dispatch(asyncShowError(res.message));
      } else {
        const prev = (getState() as RootState).user.attendance;
        const incoming = (res.data ?? {}) as UserAttendanceResponse;
        const prevDocs = Array.isArray(prev?.attendance) ? prev.attendance : [];
        const incomingDocs = Array.isArray(incoming.attendance)
          ? incoming.attendance
          : [];
        dispatch(
          setUserAttendance({
            ...prev,
            ...incoming,
            attendance:
              incomingDocs.length > 0 ? incomingDocs : prevDocs,
          } as UserAttendance)
        );
      }
      return res;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const asyncGetAllHolidays = createAsyncThunk(
  'getAllHolidays',
  async (_, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const res = await callApi<{ holidays: Holiday[] }>({
        path: allApiPaths.getPath('getAllHolidays')
      });

      if (!res?.status) {
        dispatch(asyncShowError(res.message));
      } else {
        dispatch(setHolidays(res.data?.holidays!));
      }
      return res;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const asyncSignOut = createAsyncThunk(
  'signOut',
  async (_, { dispatch }) => {
    dispatch(resetUserState());
    await persistAuthSession();
  }
);

export const asyncAssignChild = createAsyncThunk(
  'assignChild',
  async (data: any, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<any, any>({
      method: 'POST',
      path: allApiPaths.getPath('assignChild'),
      body: data,
    });

    if (!res?.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(asyncShowSuccess(res.message));
      // Refresh children list and user profile to update childrens array
      dispatch(asyncGetAllMyChildren());
      dispatch(asyncGetUserProfile());
    }
    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetUserNotifications = createAsyncThunk(
  'getUserNotifications',
  async (_, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const path = `${allApiPaths.getPath(
        'getUserNotifications',
      )}?page=1&limit=50` as ApiPaths;
      const res = await callApi<UserNotificationsResponse>({ path });
      if (!res?.status) {
        dispatch(asyncShowError(res.message));
      }
      return res;
    } finally {
      dispatch(setLoading(false));
    }
  },
);

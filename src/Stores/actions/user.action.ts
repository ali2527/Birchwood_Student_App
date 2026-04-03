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
  LeavePayload
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

export const asyncLogin = createAsyncThunk(
  'login',
  async (data: LoginUserPayload, { dispatch }) => {
    dispatch(setLoading(true));

    const loginPath = allApiPaths.getPath('login');
    const resolvedLoginPath = (
      loginPath.includes('teacher/auth') ? 'auth/signin' : loginPath
    ) as ApiPaths;
    console.log('login path resolved:', resolvedLoginPath);

    const res = await callApi<LoginUserResponse, LoginUserPayload>({
      method: 'POST',
      path: resolvedLoginPath,
      body: data,
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
        })
      );
      dispatch(
        asyncShowSuccess(res.message || 'Signed in successfully')
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
    console.log('data:::', data);
    const res = await callApi<any, any>({
      method: 'POST',
      path: allApiPaths.getPath('signup'),
      body: data,
      axiosSecure: false,
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      if (res.data?.token) {
        let { todayAttendance, user, parent, token } = res.data ?? {}
        const userData = user || parent;

        console.log('user', userData);
        dispatch(
          setUserState({
            user: { ...userData, todayAttendance },
            holidays: {},
            attendance: {} as UserAttendance,
            token,
          })
        );
      }
    }
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
  async (_, { dispatch }) => {
    dispatch(setLoading(true));
    const res = await callApi<ClassResponse | Child[]>({
      path: allApiPaths.getPath('getAllMyChildren'),
    });
    console.log('res:::', res);
    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      if (res.data) {
        const docs = Array.isArray(res.data) ? res.data : res.data.docs;

        // Always set the first child as selected if it exists
        if (docs && docs.length > 0) {
          dispatch(setSelectedChild(docs[0]));
        }

        // Only save full children list to redux if there are 2 or more children
        if (docs && docs.length >= 2) {
          const childrenData = Array.isArray(res.data)
            ? { docs: res.data }
            : res.data;
          dispatch(setChildren(childrenData as ClassResponse));
        }
      }
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

export const asyncUserLeave = createAsyncThunk(
  'userLeave',
  async (data: any, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const res = await callApi<{ todayAttendance: UserCheckInOutLeave }, LeavePayload>({
        method: 'POST',
        path: allApiPaths.getPath('markLeave'),
        body: data,
      });

      if (!res?.status) {
        dispatch(asyncShowError(res.message));
      } else {
        dispatch(setUser({ todayAttendance: res.data?.todayAttendance, checkIn: true }));
        dispatch(asyncShowSuccess(res.message));
      }
      return res;
    } catch (e: any) {
      dispatch(asyncShowError(e.message || 'Something went wrong'));
      throw e;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const asyncUserMonthlyAttendance = createAsyncThunk(
  'monthlyAttendance',
  async ({ month, year }: any, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const res = await callApi<UserAttendanceResponse>({
        path: (allApiPaths.getPath('getMonthlyAttendanceStats') +
          `?month=${month}&year=${year}`) as ApiPaths,
      });

      if (!res?.status) {
        dispatch(asyncShowError(res.message));
      } else {
        dispatch(setUserAttendance(res.data ?? ({} as UserAttendanceResponse)));
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

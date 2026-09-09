import {
  PayloadAction,
  createDraftSafeSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { Holiday, User, UserAttendance } from '../../Types/User';
import { RootState } from '../index';

interface UserSliceState {
  user: User;
  attendance: UserAttendance;
  holidays: Record<string, Record<string, Holiday>>;
  token: string | null;
  rememberMe: boolean;
}

const initialState: UserSliceState = {
  user: {} as User,
  attendance: {} as UserAttendance,
  holidays: {},
  token: null,
  rememberMe: true,
};

const UserSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    setUserState: (_, { payload }: PayloadAction<UserSliceState>) => payload,
    setUser: (
      state,
      { payload }: PayloadAction<Partial<User>>
    ) => {
      state.user = { ...state.user, ...payload };
    },
    setUserAttendance: (state, { payload }: PayloadAction<UserAttendance>) => {
      state.attendance = payload;
    },
    setHolidays: (state, { payload }: PayloadAction<Holiday[]>) => {
      state.holidays = {}
      payload.forEach(holiday => {
        const date = format(holiday.date, 'yyyy-MM');
        if (!state.holidays?.[date]) {
          state.holidays[date] = {}
        }
        state.holidays[date][holiday._id] = holiday;
      });
    },
    resetUserState: _ => initialState,
  },
});

export const { setUserState, setUser, setUserAttendance, setHolidays, resetUserState } =
  UserSlice.actions;

export default UserSlice.reducer;

export const selectUserToken = (state: RootState) => state.user.token;

export const selectUserProfile = (state: RootState) => state.user.user;

export const selectUserAttendance = (state: RootState) =>
  state.user.attendance;

export const selectHolidays = (state: RootState) => state.user.holidays;

export const selectHolidaysMonthWise = (monthWithYear: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.user.holidays],
    holidays => Object.values(holidays?.[monthWithYear] || {})
  );

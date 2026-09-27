import {
  PayloadAction,
  createDraftSafeSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { Holiday, User, UserAttendance } from '../../Types/User';
import { calendarMonthKey } from '../../Utils/calendarDay';
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
      state.holidays = {};
      (payload || []).forEach(holiday => {
        const startMonth = calendarMonthKey(holiday.date);
        if (!startMonth) {
          return;
        }
        let month = startMonth;
        const endMonth = calendarMonthKey(holiday.endDate) || startMonth;
        const stop = endMonth < startMonth ? startMonth : endMonth;
        while (month <= stop) {
          if (!state.holidays[month]) {
            state.holidays[month] = {};
          }
          state.holidays[month][holiday._id] = holiday;
          const [year, monthNumber] = month.split('-').map(Number);
          const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
          const nextYear = monthNumber === 12 ? year + 1 : year;
          month = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
        }
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

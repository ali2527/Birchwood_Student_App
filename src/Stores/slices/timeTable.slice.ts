import {
  PayloadAction,
  createDraftSafeSelector,
  createSlice
} from '@reduxjs/toolkit';
import { RootState } from '..';
import { TimeTable, TimeTableRecord } from '../../Types/TimeTable';

interface TimeTableSliceState {
  timeTable: TimeTable;
}

const initialState: TimeTableSliceState = {
  timeTable: {},
};

const TimeTableSlice = createSlice({
  name: 'TimeTable',
  initialState,
  reducers: {
    setTimeTable: (state, { payload }: PayloadAction<TimeTable>) => {
      state.timeTable = payload
    },
    setTimeTableRecord: (state, { payload }: PayloadAction<Partial<TimeTableRecord>>) => {
      if (!payload.day || !payload._id) {
        return;
      }

      const dayRecords = state.timeTable[payload.day] || [];
      const recordIndex = dayRecords.findIndex(record => record._id === payload._id);

      if (recordIndex >= 0) {
        dayRecords[recordIndex] = { ...dayRecords[recordIndex], ...payload };
      } else {
        dayRecords.push(payload as TimeTableRecord);
      }

      state.timeTable[payload.day] = dayRecords;
    },
    removeTimeTableRecord: (state, { payload }: PayloadAction<{ day: string, _id: string }>) => {
      if (state.timeTable[payload?.day]) {
        state.timeTable[payload.day] = state.timeTable[payload.day].filter(record => record._id !== payload._id);
      }
    },
    resetTimeTableState: _ => initialState,
  },
});

export const { setTimeTable, setTimeTableRecord, removeTimeTableRecord, resetTimeTableState } =
  TimeTableSlice.actions;

export default TimeTableSlice.reducer;

export const selectTimeTableByDay = (day: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.timeTable.timeTable],
    timeTable => Object.values(timeTable?.[day] || {})
  );

export const selectTimeTableRecordById = (_id: string, day: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.timeTable.timeTable],
    timeTable => (_id && day && timeTable?.[day].find(record => record._id === _id) || {}) as TimeTableRecord
  );

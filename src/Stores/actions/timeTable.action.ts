import { createAsyncThunk } from '@reduxjs/toolkit';
import { TimeTable, TimeTableRecord } from '../../Types/TimeTable';
import { callApi } from '../../Service/api';
import { allApiPaths } from '../../Service/apiPaths';
import { setLoading } from '../slices/common.slice';
import { setTimeTable } from '../slices/timeTable.slice';
import { asyncShowError } from './common.action';
import { RootState } from '..';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

function sortSlots(rows: TimeTableRecord[] = []) {
  return [...rows].sort((a, b) =>
    String(a.startTime || '').localeCompare(String(b.startTime || '')),
  );
}

function timetableFromResponse(
  data: TimeTable | { byDay?: TimeTable; slots?: TimeTableRecord[] } | undefined,
): TimeTable {
  const payload = (data || {}) as {
    byDay?: TimeTable;
    slots?: TimeTableRecord[];
  } & TimeTable;
  let grouped = payload.byDay;

  if (!grouped && Array.isArray(payload.slots)) {
    grouped = payload.slots.reduce<TimeTable>((days, slot) => {
      const key = String(slot.day || '').toUpperCase();
      if (!days[key]) {
        days[key] = [];
      }
      days[key].push(slot);
      return days;
    }, {});
  }

  if (!grouped) {
    grouped = WEEKDAYS.some(day => Array.isArray(payload[day])) ? payload : {};
  }

  return WEEKDAYS.reduce<TimeTable>((days, day) => {
    days[day] = sortSlots(grouped?.[day] || []);
    return days;
  }, {});
}

export const asyncGetAllClassTimeTable = createAsyncThunk(
  'getAllClassTimeTable',
  async (
    arg: string | { silent?: boolean; day?: string } | undefined,
    { dispatch, getState },
  ) => {
    const opts = arg && typeof arg === 'object' ? arg : {};
    const silent = !!opts.silent;
    if (!silent) {
      dispatch(setLoading(true));
    }

    const state = getState() as RootState;
    const selectedChild = state.class.selectedChild as any;

    const passedId = typeof arg === 'string' && arg.length > 5 ? arg : undefined;
    const day =
      typeof arg === 'string' && arg.length <= 5 ? arg : opts.day;

    const classroom = selectedChild?.classroom;
    const extractedId =
      typeof classroom === 'string' ? classroom : classroom?._id || classroom?.id;

    const classRoomId = passedId || extractedId;

    if (!classRoomId) {
      if (!silent) {
        dispatch(setLoading(false));
      }
      return {
        status: false,
        message: 'No classroom ID available',
      };
    }

    let path = allApiPaths.getPath('getAllClassTimeTable', {
      classRoomId,
    });

    if (day) {
      path = `${path}?day=${day}` as any;
    }

    const res = await callApi<
      TimeTable | { byDay?: TimeTable; slots?: TimeTableRecord[] }
    >({
      path,
    });

    if (!res.status) {
      if (!silent) {
        dispatch(asyncShowError(res.message));
      }
    } else {
      dispatch(setTimeTable(timetableFromResponse(res.data)));
    }

    if (!silent) {
      dispatch(setLoading(false));
    }
    return res;
  },
);

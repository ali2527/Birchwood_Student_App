import { createAsyncThunk } from '@reduxjs/toolkit';
import { CreateTimeTableRecordPayload, CreatTimeTableResonse, TimeTable, TimeTableRecord } from '../../Types/TimeTable';
import { callApi } from '../../Service/api';
import { allApiPaths } from '../../Service/apiPaths';
import { setLoading } from '../slices/common.slice';
import { removeTimeTableRecord, setTimeTable, setTimeTableRecord } from '../slices/timeTable.slice';
import { asyncShowError, asyncShowSuccess } from './common.action';
import { RootState } from '..';

export const asyncGetAllClassTimeTable = createAsyncThunk(
  'getAllClassTimeTable',
  async (arg: string | { silent?: boolean; day?: string } | undefined, { dispatch, getState }) => {
    const opts = arg && typeof arg === 'object' ? arg : {};
    const silent = !!opts.silent;
    if (!silent) {
      dispatch(setLoading(true));
    }

    const state = getState() as RootState;
    const selectedChild = state.class.selectedChild as any;

    const passedId = (typeof arg === 'string' && arg.length > 5) ? arg : undefined;
    const day = (typeof arg === 'string' && arg.length <= 5) ? arg : opts.day;

    const classroom = selectedChild?.classroom;
    const extractedId = typeof classroom === 'string' ? classroom : (classroom?._id || classroom?.classroomId || classroom?.id);

    const classRoomId = passedId || extractedId;

    if (!classRoomId) {
      if (!silent) {
        dispatch(setLoading(false));
      }
      return {
        status: false,
        message: 'No classroom ID available'
      };
    }

    let path = allApiPaths.getPath('getAllClassTimeTable', {
      classRoomId
    });

    if (day) {
      path = `${path}?day=${day}` as any;
    }

    const res = await callApi<TimeTable>({
      path,
    });

    if (!res.status) {
      if (!silent) {
        dispatch(asyncShowError(res.message));
      }
    } else {
      dispatch(
        setTimeTable(res.data!)
      );
    }

    if (!silent) {
      dispatch(setLoading(false));
    }
    return res;
  }
);

export const asyncCreateTimeTableRecord = createAsyncThunk(
  'createTimeTable',
  async (data: CreateTimeTableRecordPayload, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<CreatTimeTableResonse, CreateTimeTableRecordPayload>({
      method: "POST",
      path: allApiPaths.getPath('createTimeTable'),
      body: data
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(setTimeTableRecord(res.data?.newTimetable!))
      dispatch(asyncShowSuccess(res.message))
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncUpdateTimeTableRecord = createAsyncThunk(
  'updateTimeTableRecord',
  async ({ timeTableRecordId, prevDay, data }: { timeTableRecordId: string, prevDay: string, data: CreateTimeTableRecordPayload }, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<TimeTableRecord, CreateTimeTableRecordPayload>({
      method: "POST",
      path: allApiPaths.getPath('updateTimeTableRecord', {
        timeTableRecordId
      }),
      body: data
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      if (prevDay !== res.data?.day) dispatch(removeTimeTableRecord({ _id: res.data?._id!, day: prevDay }))
      dispatch(setTimeTableRecord(res.data!))
      dispatch(asyncShowSuccess(res.message))
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncDeleteTimeTableRecord = createAsyncThunk(
  'deleteTimeTableRecord',
  async ({ timeTableRecordId, day }: { timeTableRecordId: string, day: string }, { dispatch }) => {
    dispatch(setLoading(true));
    const res = await callApi({
      path: allApiPaths.getPath('deleteTimeTableRecord', {
        timeTableRecordId
      }),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(removeTimeTableRecord({ _id: timeTableRecordId, day }))
      dispatch(asyncShowSuccess(res.message))
    }

    dispatch(setLoading(false));
    return res;
  }
);
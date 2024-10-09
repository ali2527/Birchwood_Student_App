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
  async (_, { dispatch, getState }) => {
    dispatch(setLoading(true));

    const classRoomId: string = (getState() as RootState).user.user?.classroom?._id

    const res = await callApi<TimeTable>({
      path: allApiPaths.getPath('getAllClassTimeTable', {
        classRoomId
      }),
    });

    // console.log(res, 'respons is here')
    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(
        setTimeTable(res.data!)
      );
    }

    dispatch(setLoading(false));
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
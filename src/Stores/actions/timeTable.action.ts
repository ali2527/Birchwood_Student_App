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
  async (arg: string | undefined, { dispatch, getState }) => {
    dispatch(setLoading(true));

    const state = getState() as RootState;
    const selectedChild = state.class.selectedChild as any;

    // Check if the argument passed is actually an ID (longer than typical "MON", "TUE" etc)
    const passedId = (arg && arg.length > 5) ? arg : undefined;
    const day = (arg && arg.length <= 5) ? arg : undefined;

    const classroom = selectedChild?.classroom;
    const extractedId = typeof classroom === 'string' ? classroom : (classroom?._id || classroom?.classroomId || classroom?.id);

    const classRoomId = passedId || extractedId;

    console.log('DEBUG Action: selectedChild:', JSON.stringify(selectedChild, null, 2));
    console.log('DEBUG Action: classroom field:', classroom);
    console.log('DEBUG Action: final classRoomId:', classRoomId);

    if (!classRoomId) {
      console.log('No classroom ID found, skipping timetable fetch');
      dispatch(setLoading(false));
      return {
        status: false,
        message: 'No classroom ID available'
      };
    }
    console.log('Classroom ID:', classRoomId);

    let path = allApiPaths.getPath('getAllClassTimeTable', {
      classRoomId
    });

    // Add day query parameter if provided
    if (day) {
      path = `${path}?day=${day}` as any;
    }

    const res = await callApi<TimeTable>({
      path,
    });

    console.log('TimeTable API response:', JSON.stringify(res, null, 2));

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      console.log('TimeTable data:', res.data);
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
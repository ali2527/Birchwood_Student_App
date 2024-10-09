import { createAsyncThunk } from '@reduxjs/toolkit';
import { CreateHomeWorkPayload, GetAllHomeWorks, HomeWork } from '../../Types/Diary';
import { callApi } from '../../Service/api';
import { allApiPaths } from '../../Service/apiPaths';
import { setLoading } from '../slices/common.slice';
import { removeHomeWork, setHomeWork, setHomeWorks } from '../slices/diary.slice';
import { asyncShowError, asyncShowSuccess } from './common.action';

export const asyncGetAllHomeWorks = createAsyncThunk(
  'getAllHomeWork',
  async (_, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<GetAllHomeWorks>({
      path: allApiPaths.getPath('getAllHomeWork'),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(
        setHomeWorks(res.data!)
      );
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetAllChildHomeWorks = createAsyncThunk(
  'getAllChildHomeWork',
  async ({ childId }: { childId: string }, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<GetAllHomeWorks>({
      path: allApiPaths.getPath('getAllChildHomework', {
        childId
      }),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(
        setHomeWorks(res.data!)
      );
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncCreateHomeWork = createAsyncThunk(
  'createHomeWork',
  async (data: CreateHomeWorkPayload, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<{ homework: HomeWork }, CreateHomeWorkPayload>({
      method: "POST",
      path: allApiPaths.getPath('createHomeWork'),
      body: data
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(setHomeWork(res.data?.homework!))
      dispatch(asyncShowSuccess(res.message))
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncUpdateHomeWork = createAsyncThunk(
  'updateHomeWork',
  async ({ homeWorkId, data }: { homeWorkId: string, data: CreateHomeWorkPayload }, { dispatch }) => {
    dispatch(setLoading(true));

    const res = await callApi<HomeWork, CreateHomeWorkPayload>({
      method: "POST",
      path: allApiPaths.getPath('updateHomeWork', { homeWorkId }),
      body: data
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(setHomeWork(res.data!))
      dispatch(asyncShowSuccess(res.message))
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncDeleteHomeWork = createAsyncThunk(
  'deleteHomeWork',
  async ({ homeWorkId }: { homeWorkId: string }, { dispatch }) => {
    dispatch(setLoading(true));
    const res = await callApi({
      path: allApiPaths.getPath('deleteHomeWork', {
        homeWorkId
      }),
    });

    if (!res.status) {
      dispatch(asyncShowError(res.message));
    } else {
      dispatch(removeHomeWork({ _id: homeWorkId }))
      dispatch(asyncShowSuccess(res.message))
    }

    dispatch(setLoading(false));
    return res;
  }
);
import { createAsyncThunk } from '@reduxjs/toolkit';
import { GetAllHomeWorks } from '../../Types/Diary';
import { callApi } from '../../Service/api';
import { allApiPaths } from '../../Service/apiPaths';
import { setLoading } from '../slices/common.slice';
import { setHomeWorks } from '../slices/diary.slice';
import { asyncShowError } from './common.action';

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
      dispatch(setHomeWorks(res.data!));
    }

    dispatch(setLoading(false));
    return res;
  }
);

export const asyncGetAllChildHomeWorks = createAsyncThunk(
  'getAllChildHomeWork',
  async ({ childId, silent }: { childId: string; silent?: boolean }, { dispatch }) => {
    if (!silent) {
      dispatch(setLoading(true));
    }

    const res = await callApi<GetAllHomeWorks>({
      path: `${allApiPaths.getPath('getAllChildHomework', {
        childId,
      })}?page=1&limit=100` as any,
    });

    if (!res.status) {
      if (!silent) {
        dispatch(asyncShowError(res.message));
      }
    } else if (res.data) {
      dispatch(setHomeWorks(res.data));
    }

    if (!silent) {
      dispatch(setLoading(false));
    }
    return res;
  }
);

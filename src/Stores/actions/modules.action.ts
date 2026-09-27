import {createAsyncThunk} from '@reduxjs/toolkit';
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {setModules, AppModules, DEFAULT_MODULES} from '../slices/modules.slice';

export const asyncGetAppModules = createAsyncThunk(
  'modules/get',
  async (_, {dispatch}) => {
    const res = await callApi<{modules: AppModules}>({
      path: allApiPaths.getPath('getAppModules'),
    });
    const modules = {
      ...DEFAULT_MODULES,
      ...(res?.data?.modules || {}),
    };
    dispatch(setModules(modules));
    return modules;
  },
);

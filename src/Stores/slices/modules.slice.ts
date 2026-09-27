import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';

export type AppModules = {
  fees: boolean;
  gallery: boolean;
  ads: boolean;
  results: boolean;
  chat: boolean;
  assessments: boolean;
};

export const DEFAULT_MODULES: AppModules = {
  fees: true,
  gallery: true,
  ads: true,
  results: true,
  chat: true,
  assessments: true,
};

const modulesSlice = createSlice({
  name: 'Modules',
  initialState: DEFAULT_MODULES,
  reducers: {
    setModules: (_state, action: PayloadAction<Partial<AppModules>>) => ({
      ...DEFAULT_MODULES,
      ...action.payload,
    }),
  },
});

export const {setModules} = modulesSlice.actions;
export const selectModules = (state: RootState) => state.modules ?? DEFAULT_MODULES;
export default modulesSlice.reducer;

import {
  PayloadAction,
  createDraftSafeSelector,
  createSlice
} from '@reduxjs/toolkit';
import { RootState } from '..';
import { PaginationProps } from '../../Types/Common';
import { GetAllHomeWorks, HomeWork } from '../../Types/Diary';

interface DiarySliceState {
  homeworks: Record<string, HomeWork>;
  pagination: PaginationProps
}

const initialState: DiarySliceState = {
  homeworks: {},
  pagination: {
    totalDocs: 0,
    limit: 0,
    page: 0,
    totalPages: 0,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  },
};

const DiarySlice = createSlice({
  name: 'Diary',
  initialState,
  reducers: {
    setHomeWorks: (state, { payload }: PayloadAction<GetAllHomeWorks>) => {
      const { docs, ...pagination } = payload;
      state.homeworks = docs.reduce((acc, curr) => {
        acc["homework_" + curr._id] = curr;
        return acc;
      }, {} as Record<string, HomeWork>);
      state.pagination = pagination;
    },
    setHomeWork: (state, { payload }: PayloadAction<Partial<HomeWork>>) => {
      state.homeworks["homework_" + payload._id] = { ...state.homeworks["homework_" + payload._id], ...payload };
    },
    removeHomeWork: (state, { payload }: PayloadAction<{ _id: string }>) => {
      delete state.homeworks["homework_" + payload._id];
    },
    resetDiaryState: _ => initialState,
  },
});

export const { setHomeWorks, setHomeWork, removeHomeWork } = DiarySlice.actions;

export default DiarySlice.reducer;

export const selectHomeWorks = createDraftSafeSelector(
  [(state: RootState) => state.diary],
  state => Object.values(state.homeworks ?? {}) as HomeWork[]
);

export const selectHomeWorkById = (homeWorkId: string) =>
  createDraftSafeSelector(
    [(state: RootState) => state.diary.homeworks],
    homeworks => homeworks["homework_" + homeWorkId] as HomeWork
  );


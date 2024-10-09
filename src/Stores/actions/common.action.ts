import { createAsyncThunk } from '@reduxjs/toolkit';
import { showMessage } from 'react-native-flash-message';
import { setError, setSuccess } from '../slices/common.slice';

export const asyncShowError = createAsyncThunk(
  'common/error',
  async (message: string | null | undefined, { dispatch }) => {
    dispatch(setError(message));
    if (message) {
      showMessage({
        message,
        type: 'danger',
      });
      setTimeout(() => {
        dispatch(setError(null));
      }, 2000);
    }
  }
);
export const asyncShowSuccess = createAsyncThunk(
  'common/error',
  async (message: string | null | undefined, { dispatch }) => {
    dispatch(setSuccess(message));
    if (message) {
      showMessage({
        message,
        type: 'success',
      });
      setTimeout(() => {
        dispatch(setSuccess(null));
      }, 2000);
    }
  }
);

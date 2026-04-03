import { createAsyncThunk } from '@reduxjs/toolkit';
import { showMessage } from 'react-native-flash-message';
import { setError, setSuccess } from '../slices/common.slice';

const ERROR_FALLBACK = 'Something went wrong. Please try again.';
const SUCCESS_FALLBACK = 'Done.';

export const asyncShowError = createAsyncThunk(
  'common/error',
  async (message: string | null | undefined, { dispatch }) => {
    console.log('message:::', message);
    const text = (message && String(message).trim()) || ERROR_FALLBACK;
    console.log("text:::", text);
    dispatch(setError(text));
    showMessage({
      message: text,
      type: 'danger',
      duration: 4500,
      floating: true,
      icon: 'auto',
      title: 'Error',
    });
    setTimeout(() => {
      dispatch(setError(null));
    }, 4500);
  }
);

export const asyncShowSuccess = createAsyncThunk(
  'common/success',
  async (message: string | null | undefined, { dispatch }) => {
    const text = (message && String(message).trim()) || SUCCESS_FALLBACK;
    dispatch(setSuccess(text));
    showMessage({
      message: text,
      type: 'success',
      duration: 3500,
      floating: true,
      icon: 'auto',
      title: 'Success',
    });
    setTimeout(() => {
      dispatch(setSuccess(null));
    }, 3500);
  }
);

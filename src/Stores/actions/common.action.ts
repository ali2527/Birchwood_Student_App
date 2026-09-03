import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatAlert } from '../../Components/AppAlert/formatAlert';
import { showAppAlert } from '../../Components/AppAlert/host';
import { setError, setLoading, setSuccess } from '../slices/common.slice';

const ERROR_FALLBACK = 'Please try again.';
const SUCCESS_FALLBACK = 'Done.';

function presentAlert(kind, raw, dispatch) {
  const formatted = formatAlert(raw, kind);
  if (formatted.skip) {
    return formatted;
  }

  dispatch(setLoading(false));

  showAppAlert({
    title: formatted.title,
    description: formatted.description,
    type: formatted.type,
    duration: formatted.type === 'success' ? 3200 : 4800,
  });

  return formatted;
}

export const asyncShowError = createAsyncThunk(
  'common/error',
  async (message: string | null | undefined, { dispatch }) => {
    const formatted = presentAlert('danger', message || ERROR_FALLBACK, dispatch);
    if (formatted.skip) {
      return;
    }
    dispatch(setError(formatted.description || formatted.title));
    setTimeout(() => {
      dispatch(setError(null));
    }, 4200);
  },
);

export const asyncShowSuccess = createAsyncThunk(
  'common/success',
  async (message: string | null | undefined, { dispatch }) => {
    const formatted = presentAlert('success', message || SUCCESS_FALLBACK, dispatch);
    if (formatted.skip) {
      return;
    }
    dispatch(setSuccess(formatted.description || formatted.title));
    setTimeout(() => {
      dispatch(setSuccess(null));
    }, 2800);
  },
);

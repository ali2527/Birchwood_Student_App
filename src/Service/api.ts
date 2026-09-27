import {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  RawAxiosRequestHeaders,
} from 'axios';
import { axios, axiosPrivate } from './axios';
import {
  ResponseCallback,
  responseCallback,
} from './responseCallback';

import { persistAuthSession, persistor, store } from '../Stores';
import { resetUserState } from '../Stores/slices/user.slice';
import { ApiPaths } from './apiPaths';

axiosPrivate.interceptors.request.use(config => {
  const token = store.getState()?.user?.token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CallApi<T> {
  path?: ApiPaths;
  method?: Method;
  body?: T;
  token?: string;
  isFormData?: boolean;
  axiosSecure?: boolean;
  options?: AxiosRequestConfig;
  headers?: RawAxiosRequestHeaders | AxiosHeaders;
}

export const callApi = async <RT, T = undefined>({
  path,
  method = 'GET',
  body,
  token,
  isFormData = false,
  axiosSecure = true,
  options: ops = {},
  headers: customHeaders = {},
}: CallApi<T>): Promise<ResponseCallback<RT>> => {
  let headers: RawAxiosRequestHeaders | AxiosHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': 'en-US',
  };

  const options: AxiosRequestConfig = {
    method,
    ...ops,
  };

  if (isFormData) {
    headers = {
      Accept: 'application/json',
    };
  }

  if (axiosSecure) {
    if (!persistor.getState().bootstrapped) {
      return { status: false, message: 'Restoring your session...' };
    }
    const { token: userToken } = store.getState().user ?? {};
    if (userToken) {
      headers.Authorization = `Bearer ${userToken}`;
    } else {
      store.dispatch(resetUserState());
      await persistAuthSession();
      return { status: false, message: 'Token Expired, Signing you out!' };
    }
  }

  options.headers = { ...headers, ...customHeaders };

  if (body) {
    options.data = body;
  }

  options.url = path;

  const axiosInstance: AxiosInstance = axiosSecure ? axiosPrivate : axios;

  return axiosInstance(options)
    .then((response: AxiosResponse<ResponseCallback<RT>>) => responseCallback<RT>(response))
    .catch((error: AxiosError<ResponseCallback<RT>>) => {
      if (error.response) {
        return responseCallback<RT>(error.response);
      }
      // Offline / unreachable — keep the session; surface a soft error.
      if (error.request) {
        return {
          status: false,
          message: 'No response from server. Check your connection and try again.',
          data: undefined,
        };
      }
      return {
        status: false,
        message: error.message,
        data: undefined,
      };
    }) as Promise<ResponseCallback<RT>>;
};

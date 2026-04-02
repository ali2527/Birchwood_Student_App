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
import { ResponseCallback, responseCallback } from './responseCallback';

import { store } from '../Stores';
import { asyncSignOut } from '../Stores/actions/user.action';
import { ApiPaths } from './apiPaths';

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

  console.log(path, 'path');

  const options: AxiosRequestConfig = {
    method,
    ...ops,
  };

  if (isFormData) {
    headers = {
      'Content-Type': 'multipart/form-data',
    };
  }

  if (axiosSecure) {
    const { token: userToken } = store.getState().user ?? {};
    if (userToken) {
      headers.Authorization = `Bearer ${userToken}`;
    } else {
      await store.dispatch(asyncSignOut()).unwrap();
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
        console.log('error.responseff', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.response.config?.url,
          baseURL: error.response.config?.baseURL,
        });
        return responseCallback<RT>(error.response);
      }
      if (error.request) {
        console.log('error.requestddd', {
          message: error.message,
          code: error.code,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });
        return {
          status: false,
          message: error.message || 'Network error',
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

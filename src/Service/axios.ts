import ax from 'axios';
import {Platform} from 'react-native';

// Local Birchwood backend (parent/user token APIs on :3031).
// Android emulator → 10.0.2.2; physical device / iOS sim → LAN IP.
const LOCAL_HOST =
  Platform.OS === 'android' ? '10.0.2.2' : '192.168.100.94';
// Override for a physical Android device on the same Wi‑Fi:
const PHYSICAL_DEVICE_HOST = '192.168.100.94';
const USE_PHYSICAL_DEVICE = true; // set false when using Android emulator

const USE_LOCAL_API = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
const DEV_HOST = USE_PHYSICAL_DEVICE ? PHYSICAL_DEVICE_HOST : LOCAL_HOST;

export const APP_URL = USE_LOCAL_API
  ? `http://${DEV_HOST}:3031/`
  : 'https://api.thebirchwoodacademy.com/';
export const IMG_URL = APP_URL + 'uploads/';
export const BASE_URL = APP_URL + 'api/';

export const getImagePath = (str: string) => {
  if (!str) {
    return str;
  }
  if (/^https?:\/\//i.test(str) || str.startsWith('file:')) {
    return str;
  }
  return IMG_URL + str;
};

const axios = ax.create({
  baseURL: BASE_URL,
});

const axiosPrivate = ax.create({
  baseURL: BASE_URL,
});

const dump = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const attachApiLogs = (instance: ReturnType<typeof ax.create>) => {
  instance.interceptors.request.use(config => {
    console.log(
      '[API request]',
      (config.method || 'GET').toUpperCase(),
      `${config.baseURL || ''}${config.url || ''}`,
      dump(config.data),
    );
    return config;
  });
  instance.interceptors.response.use(
    response => {
      console.log(
        '[API response]',
        response.status,
        (response.config.method || 'GET').toUpperCase(),
        `${response.config.baseURL || ''}${response.config.url || ''}`,
        dump(response.data),
      );
      return response;
    },
    error => {
      console.log(
        '[API error]',
        error.response?.status,
        (error.config?.method || 'GET').toUpperCase(),
        `${error.config?.baseURL || ''}${error.config?.url || ''}`,
        dump(error.response?.data ?? error.message),
      );
      return Promise.reject(error);
    },
  );
};

attachApiLogs(axios);
attachApiLogs(axiosPrivate);

export {axios, axiosPrivate};

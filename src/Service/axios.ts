import ax from 'axios';
import {Platform} from 'react-native';

// Local Birchwood backend (parent/user token APIs on :3031).
// Android emulator → 10.0.2.2
// Physical phone on same Wi‑Fi → PC LAN IP (no adb reverse needed).
// USB + adb reverse → 127.0.0.1 with `adb reverse tcp:3031 tcp:3031`.
const LOCAL_HOST =
  Platform.OS === 'android' ? '10.0.2.2' : '10.101.46.171';
const PHYSICAL_DEVICE_HOST = '192.168.100.94';
const USE_PHYSICAL_DEVICE = true; // set false when using Android emulator

const USE_LOCAL_API = false;
const DEV_HOST = USE_PHYSICAL_DEVICE ? PHYSICAL_DEVICE_HOST : LOCAL_HOST;

export const APP_URL = USE_LOCAL_API
  ? `http://${DEV_HOST}:3031/`
  : 'https://api.thebirchwoodacademy.com/';
export const IMG_URL = APP_URL + 'uploads/';
export const BASE_URL = APP_URL + 'api/';

// Local file the user just saved, keyed by the server filename. Shows that
// photo immediately while the uploaded file is still a network URL.
const localPreviewByName = new Map<string, string>();

export function pinLocalPreview(remoteName?: string, localUri?: string) {
  const remote = String(remoteName || '').trim();
  const local = String(localUri || '').trim();
  if (!remote || !local) {
    return;
  }
  const fileName = remote.replace(/\\/g, '/').split('/').filter(Boolean).pop() || remote;
  localPreviewByName.set(remote, local);
  localPreviewByName.set(fileName, local);
}

export const getImagePath = (str: string) => {
  if (str == null || str === '') {
    return '';
  }
  const value = String(str).trim();
  if (!value || value === 'undefined' || value === 'null') {
    return '';
  }
  const pinned = localPreviewByName.get(value);
  if (pinned) {
    return pinned;
  }
  if (
    /^https?:\/\//i.test(value) ||
    value.startsWith('file:') ||
    value.startsWith('content:')
  ) {
    return value;
  }
  const name = value.replace(/\\/g, '/').split('/').filter(Boolean).pop();
  if (name && localPreviewByName.get(name)) {
    return localPreviewByName.get(name) as string;
  }
  return name ? IMG_URL + name : '';
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
    const url = `${config.baseURL || ''}${config.url || ''}`;
    const method = (config.method || 'GET').toUpperCase();
    if (config.data === undefined || config.data === null || config.data === '') {
      console.log('[API request]', method, url);
    } else {
      console.log('[API request]', method, url, dump(config.data));
    }
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

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

export const getImagePath = (str: string) => IMG_URL + str;

const axios = ax.create({
  baseURL: BASE_URL,
});

const axiosPrivate = ax.create({
  baseURL: BASE_URL,
});

export {axios, axiosPrivate};

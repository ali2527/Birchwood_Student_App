import ax from 'axios';
export const APP_URL = 'https://darkmodelabs.com:8201/';
export const IMG_URL = APP_URL + 'uploads/';
export const BASE_URL = APP_URL + 'api/';

export const getImagePath = (str: string) => IMG_URL + str;

const axios = ax.create({
  baseURL: BASE_URL,
});

const axiosPrivate = ax.create({
  baseURL: BASE_URL,
});

export { axios, axiosPrivate };

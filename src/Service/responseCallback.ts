import { AxiosResponse } from 'axios';
import { persistAuthSession, store } from '../Stores';
import { resetUserState } from '../Stores/slices/user.slice';

export interface ResponseCallback<RD> {
  status: boolean;
  message: string;
  data?: RD;
}

const AUTH_ERROR_MESSAGE =
  /session expired|unauthorized|invalid (admin )?token|please sign in again|token expired/i;

let loggingOut = false;

/** Clear persisted session so cached auth is not shown after logout. */
export function forceLogoutSession() {
  const token = store.getState()?.user?.token;
  if (!token || loggingOut) {
    return;
  }

  loggingOut = true;
  store.dispatch(resetUserState());
  persistAuthSession().finally(() => {
    loggingOut = false;
  });
}

function logoutOnBackendAuthError(httpStatus?: number, message?: string) {
  // Only hard-auth failures clear the session. Permission denials (403)
  // and network blips must not force sign-out.
  const isAuthStatus = httpStatus === 401;
  const isAuthMessage = Boolean(message && AUTH_ERROR_MESSAGE.test(message));
  if (!isAuthStatus && !isAuthMessage) {
    return;
  }

  forceLogoutSession();
}

/*
* axios response format
* {
    "data": {
        "data": {},
        "message": "custom server message",
        "status": true
    },
    "status": 200,
    "statusText": undefined
}
*/

export function responseCallback<RT>(
  res: AxiosResponse<ResponseCallback<RT>>
): ResponseCallback<RT> {
  const message = res.data?.message ?? res.statusText ?? "Something Went Wrong!";
  const status = res.data?.status ?? false;

  logoutOnBackendAuthError(res?.status, message);

  return {
    ...(res?.data ?? {}),
    message,
    status
  };
}

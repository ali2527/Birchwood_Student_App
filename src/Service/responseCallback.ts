import { AxiosResponse } from 'axios';
import { store } from '../Stores';
import { resetUserState } from '../Stores/slices/user.slice';

export interface ResponseCallback<RD> {
  status: boolean;
  message: string;
  data?: RD;
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
  const status = res.data?.status ?? false


  // console.log(res, 'checking API response')

  if (res.status === 401) {
    store.dispatch(resetUserState());
  }

  return {
    ...(res?.data ?? {}),
    message,
    status
  };
}

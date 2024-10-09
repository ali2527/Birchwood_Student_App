import { Dispatch, useCallback, useEffect, useState } from 'react';
import { Image } from 'react-native';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { ResponseCallback } from '../Service/responseCallback';
import { RootState, store } from './index';

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useLoaderDispatch = <T = undefined, RT = undefined>(
  loadData: (param?: T) => any,
  isLoading = true
) => {
  const [loading, setLoading] = useState(isLoading);
  const dispatch: AppDispatch = useAppDispatch();

  const fetchData = useCallback(
    async (param?: T | undefined): Promise<ResponseCallback<RT>> => {
      if (loadData) {
        setLoading(true);
        const res: ResponseCallback<RT> = (await dispatch(
          loadData(param)
        ).unwrap()) as ResponseCallback<RT>;
        setLoading(false);
        return res;
      }
      return {
        status: false,
        message: 'No data found',
      };
    },
    [dispatch, loadData]
  );

  return [loading, fetchData, setLoading] as [
    boolean,
    (param?: T) => Promise<ResponseCallback<RT>>,
    Dispatch<boolean>
  ];
};

export const useImageAspectRatio = (imageUrl: string) => {
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    let isValid = true;
    Image.getSize(imageUrl, (width, height) => {
      if (isValid) {
        setAspectRatio(width / height);
      }
    });

    return () => {
      isValid = false;
    };
  }, [imageUrl]);

  return aspectRatio;
};

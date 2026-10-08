import {AppState} from 'react-native';
import {focusManager, QueryClient} from '@tanstack/react-query';
import {store} from '../Stores';

focusManager.setEventListener(handleFocus => {
  const subscription = AppState.addEventListener('change', status => {
    handleFocus(status === 'active');
  });
  return () => subscription.remove();
});

function isAuthError(error) {
  const status = Number(error?.status || error?.response?.status || 0);
  if (status === 401 || status === 403) return true;
  return /token|unauthor|signing you out/i.test(String(error?.message || ''));
}

/** In-memory only. Chat and posts are never written to disk. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 45 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (count, error) => (isAuthError(error) ? false : count < 1),
      // RN focus flips (alerts, debugger, modals) were refetching every query.
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export function clearPrivateCache() {
  queryClient.clear();
}

let signedIn = Boolean(store.getState()?.user?.token);
store.subscribe(() => {
  const hasToken = Boolean(store.getState()?.user?.token);
  if (signedIn && !hasToken) {
    queryClient.clear();
  }
  signedIn = hasToken;
});

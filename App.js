import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import MainNavigator from './src/Navigation';
import AnimatedSplash from './src/Screens/SplashScreen';
import {AppAlertHost} from './src/Components/AppAlert/host';
import {AppLoader} from './src/Components/AppLoader';
import {store, persistor} from './src/Stores';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [rehydrated, setRehydrated] = useState(
    () => persistor.getState().bootstrapped,
  );
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    if (persistor.getState().bootstrapped) {
      setRehydrated(true);
    }
    const unsubscribe = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        setRehydrated(true);
      }
    });
    return unsubscribe;
  }, []);

  const onSplashDone = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
          <PersistGate loading={null} persistor={persistor}>
            {bootstrapped =>
              bootstrapped ? (
                <MainNavigator onReady={() => setNavReady(true)} />
              ) : null
            }
          </PersistGate>
          <AppLoader />
          <AppAlertHost />
          {showSplash ? (
            <AnimatedSplash
              appReady={rehydrated || navReady}
              onDone={onSplashDone}
            />
          ) : null}
        </View>
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;

import React, {useCallback, useEffect, useState} from 'react';
import {StatusBar, Platform, View} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import MainNavigator from './src/Navigation';
import AnimatedSplash from './src/Screens/SplashScreen';
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
    <Provider store={store}>
      <View style={{flex: 1, backgroundColor: showSplash ? '#FFFFFF' : '#ffffff'}}>
        <PersistGate loading={null} persistor={persistor}>
          <MainNavigator onReady={() => setNavReady(true)} />
          <FlashMessage
            position={
              Platform.OS === 'ios'
                ? 'top'
                : {top: StatusBar.currentHeight ?? 24, left: 0, right: 0}
            }
            duration={4000}
            icon="auto"
            animated={true}
            style={{paddingHorizontal: 16, paddingVertical: 14}}
            titleStyle={{fontSize: 15, fontWeight: '700'}}
            textStyle={{fontSize: 14}}
          />
        </PersistGate>
        {showSplash ? (
          <AnimatedSplash
            appReady={rehydrated && navReady}
            onDone={onSplashDone}
          />
        ) : null}
      </View>
    </Provider>
  );
}

export default App;

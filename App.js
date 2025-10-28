import React, { useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Platform,
  View,
  Text,
  InteractionManager
} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import MainNavigator from './src/Navigation';
import { store, persistor } from './src/Stores';

function App() {

  useEffect(() => {
    console.log('App mounted, hiding splash screen');
    
    // Hide splash screen after component mounts
    const timer = setTimeout(() => {
      try {
        SplashScreen.hide();
        console.log('Splash screen hidden successfully');
      } catch (error) {
        console.log('Error hiding splash screen:', error);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate 
        loading={null} 
        persistor={persistor}
        onBeforeLift={() => {
          console.log('PersistGate onBeforeLift called');
        }}
        onAfterLift={() => {
          console.log('PersistGate onAfterLift called');
        }}
      >
        {/* <CustomStatusBar /> */}
        <FlashMessage
          position={
            Platform.OS === 'ios'
              ? 'top'
              : { top: StatusBar.currentHeight, left: 0, right: 0 }
          }
          duration={2000}
          icon="auto"
          animated={true}
        />
        <MainNavigator />
      </PersistGate>
    </Provider>
  );
}

export default App;

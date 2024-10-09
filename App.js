import React, { useEffect } from 'react';
import {
  StatusBar,
  StyleSheet
} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';
import MainNavigator from './src/Navigation';
import { store } from './src/Stores';

function App() {

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <Provider store={store}>
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
    </Provider>
  );
}

export default App;

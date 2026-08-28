import React, {useEffect} from 'react';
import {StatusBar, Platform, View} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import SplashScreen from 'react-native-splash-screen';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import MainNavigator from './src/Navigation';
import {store, persistor} from './src/Stores';

function App() {
  useEffect(() => {
    try {
      SplashScreen.hide();
    } catch (error) {
      console.log('Error hiding splash screen:', error);
    }
  }, []);

  return (
    <Provider store={store}>
      <View style={{flex: 1}}>
        <PersistGate loading={null} persistor={persistor}>
          <MainNavigator />
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
      </View>
    </Provider>
  );
}

export default App;

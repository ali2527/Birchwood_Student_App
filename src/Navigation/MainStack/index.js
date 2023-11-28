import React, {useEffect} from 'react';
// import AnimatedSplash from 'react-native-animated-splash';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import routes from '../routes';
import OnBoardScreen from '../../Screens/OnBoardScreen';
import NavigationOptions from '../NavigationOptions';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={NavigationOptions}>
      <Stack.Screen name={routes.navigator.onboard} component={OnBoardScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;

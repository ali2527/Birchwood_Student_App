import React, {useEffect} from 'react';
// import AnimatedSplash from 'react-native-animated-splash';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import routes from '../routes';
import OnBoardScreen from '../../Screens/OnBoardScreen';
import NavigationOptions from '../NavigationOptions';
import SignIn from '../../Screens/Auth/SignIn';
import PasswordResetScreens from '../../Screens/Auth/PasswordResetScreens';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={NavigationOptions}>
      <Stack.Screen name={routes.navigator.onboard} component={OnBoardScreen} />
      <Stack.Screen name={routes.navigator.signin} component={SignIn}/>
      <Stack.Screen name={routes.navigator.passwordresetscreens} component={PasswordResetScreens}/>

    </Stack.Navigator>
  );
};

export default MainStack;

import React, { useEffect } from 'react';
// import AnimatedSplash from 'react-native-animated-splash';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import routes from '../routes';
import OnBoardScreen from '../../Screens/OnBoardScreen';
import NavigationOptions from '../NavigationOptions';
import SignIn from '../../Screens/Auth/SignIn';
import PasswordResetScreens from '../../Screens/Auth/PasswordResetScreens';
import SignUp from '../../Screens/Auth/SignUp';
import PersonalInfo from '../../Screens/Auth/PersonalInfo';
import Education from '../../Screens/Auth/Education';
import ParentContact from '../../Screens/Auth/ParentContact';
import Experience from '../../Screens/Auth/Experience';


const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={NavigationOptions}>
      <Stack.Screen name={routes.navigator.onboard} component={OnBoardScreen} />
      <Stack.Screen name={routes.navigator.signin} component={SignIn} />
      <Stack.Screen name={routes.navigator.signup} component={SignUp} />
      <Stack.Screen name={routes.navigator.personalInfo} component={PersonalInfo} />
      <Stack.Screen name={routes.navigator.education} component={Education} />
      <Stack.Screen name={routes.navigator.parentContact} component={ParentContact} />
      <Stack.Screen name={routes.navigator.experience} component={Experience} />
      <Stack.Screen name={routes.navigator.passwordresetscreens} component={PasswordResetScreens} />

    </Stack.Navigator>
  );
};

export default MainStack;

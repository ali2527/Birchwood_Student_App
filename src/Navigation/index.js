import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { colors } from '../theme/colors';

import MainStack from './MainStack';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.theme.white,
  },
};

const MainNavigator = ({onReady}) => {
  return (
    <NavigationContainer theme={MyTheme} onReady={onReady}>
      <MainStack />
    </NavigationContainer>
  );
};

export default MainNavigator;

import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { colors } from '../theme/colors';

import MainStack from './MainStack';
import { navigationRef } from './rootNavigation';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.theme.white,
  },
};

const MainNavigator = ({onReady}) => {
  return (
    <NavigationContainer ref={navigationRef} theme={MyTheme} onReady={onReady}>
      <MainStack />
    </NavigationContainer>
  );
};

export default MainNavigator;

import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { colors } from '../theme/colors';

import MainStack from './MainStack';
import { useAppSelector } from '../Stores/hooks';
import { selectAppLoader } from '../Stores/slices/common.slice';
import { AppLoader } from '../Components/AppLoader';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.theme.white,
  },
};

const MainNavigator = ({onReady}) => {
  const loader = useAppSelector(selectAppLoader);

  return (
    <NavigationContainer theme={MyTheme} onReady={onReady}>
      {loader && <AppLoader />}
      <MainStack />
    </NavigationContainer>
  );
};

export default MainNavigator;

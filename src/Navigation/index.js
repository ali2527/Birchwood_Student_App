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

const MainNavigator = () => {
  const loader = useAppSelector(selectAppLoader);
  
  console.log('MainNavigator rendered, loader:', loader);

  return (
    <NavigationContainer theme={MyTheme}>
      {loader && <AppLoader />}
      <MainStack />
    </NavigationContainer>
  );
};

export default MainNavigator;

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AppFooter from '../Components/AppFooter';
import routes from './routes';
import HomeScreen from '../Screens/HomeScreen';
import Children from '../Screens/Children';
import SchoolCalendar from '../Screens/SchoolCalendar';
import Notices from '../Screens/Notices';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName={routes.screens.homeScreen}
      backBehavior="history"
      tabBar={props => <AppFooter {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}>
      <Tab.Screen
        name={routes.screens.children}
        component={Children}
      />
      <Tab.Screen
        name={routes.screens.schoolCalendar}
        component={SchoolCalendar}
      />
      <Tab.Screen
        name={routes.screens.homeScreen}
        component={HomeScreen}
      />
      <Tab.Screen name={routes.screens.notices} component={Notices} />
    </Tab.Navigator>
  );
}

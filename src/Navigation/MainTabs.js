import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AppFooter from '../Components/AppFooter';
import routes from './routes';
import HomeScreen from '../Screens/HomeScreen';
import AttendanceLog from '../Screens/AttendanceLog';
import ActivityScreen from '../Screens/ActivityScreen';
import TeacherChat from '../Screens/TeacherChat';

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
        name={routes.screens.teacherChat}
        component={TeacherChat}
      />
      <Tab.Screen
        name={routes.screens.attendanceLog}
        component={AttendanceLog}
      />
      <Tab.Screen
        name={routes.screens.homeScreen}
        component={HomeScreen}
      />
      <Tab.Screen
        name={routes.screens.activityScreen}
        component={ActivityScreen}
      />
    </Tab.Navigator>
  );
}

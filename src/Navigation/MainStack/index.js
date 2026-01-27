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
import HomeScreen from '../../Screens/HomeScreen';
import Profile from '../../Screens/Profile';
import AddChild from '../../Screens/AddChild';
import ChildProfile from '../../Screens/ChildProfile';
import HealthDetails from '../../Screens/HealthDetails';
import ProfileForm from '../../Screens/ProfileForm';
import AttendanceLog from '../../Screens/AttendanceLog';
import FeesDue from '../../Screens/FeesDue';
import TimeTable from '../../Screens/TimeTable';
import SchoolAlbums from '../../Screens/Albums';
import Result from '../../Screens/Result';
import CheckIn from '../../Screens/CheckIn';
import LeaveApplication from '../../Screens/LeaveApplication';
import { useAppSelector } from '../../Stores/hooks';
import { selectUserToken } from '../../Stores/slices/user.slice';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const token = useAppSelector(selectUserToken);

  console.log('MainStack rendered, token:', token);

  return (
    <Stack.Navigator screenOptions={NavigationOptions} initialRouteName={routes.navigator.onboard}>
      {!token ?
        <Stack.Group>
          <Stack.Screen name={routes.navigator.onboard} component={OnBoardScreen} />
          <Stack.Screen
            name={routes.navigator.passwordresetscreens}
            component={PasswordResetScreens}
          />
          <Stack.Screen name={routes.navigator.signin} component={SignIn} />
          <Stack.Screen name={routes.navigator.signup} component={SignUp} />
          <Stack.Screen
            name={routes.navigator.personalInfo}
            component={PersonalInfo}
          />
          <Stack.Screen name={routes.navigator.education} component={Education} />
          <Stack.Screen
            name={routes.navigator.parentContact}
            component={ParentContact}
          />
          <Stack.Screen
            name={routes.screens.healthDetails}
            component={HealthDetails}
          />
        </Stack.Group>
        :
        <Stack.Group>
          <Stack.Screen name={routes.screens.homeScreen} component={HomeScreen} />
          <Stack.Screen name={routes.navigator.experience} component={Experience} />
          <Stack.Screen name={routes.screens.profile} component={Profile} />
          <Stack.Screen name={routes.screens.addChild} component={AddChild} />
          <Stack.Screen
            name={routes.screens.childProfile}
            component={ChildProfile}
          />
          <Stack.Screen name={routes.screens.profileForm} component={ProfileForm} />
          <Stack.Screen
            name={routes.screens.attendanceLog}
            component={AttendanceLog}
          />
          <Stack.Screen name={routes.screens.feesDue} component={FeesDue} />
          <Stack.Screen name={routes.screens.timeTable} component={TimeTable} />
          <Stack.Screen
            name={routes.screens.schoolAlbums}
            component={SchoolAlbums}
          />
          <Stack.Screen name={routes.screens.result} component={Result} />
          <Stack.Screen name={routes.screens.checkIn} component={CheckIn} />
          <Stack.Screen
            name={routes.screens.leaveApplication}
            component={LeaveApplication}
          />
        </Stack.Group>
      }
    </Stack.Navigator>
  );
};

export default MainStack;

import React from 'react';
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
import MainTabs from '../MainTabs';
import Profile from '../../Screens/Profile';
import AddChild from '../../Screens/AddChild';
import EditChild from '../../Screens/EditChild';
import ChildProfile from '../../Screens/ChildProfile';
import HealthDetails from '../../Screens/HealthDetails';
import ProfileForm from '../../Screens/ProfileForm';
import SchoolCalendar from '../../Screens/SchoolCalendar';
import FeesDue from '../../Screens/FeesDue';
import Result from '../../Screens/Result';
import Assessments from '../../Screens/Assessments';
import TimeTable from '../../Screens/TimeTable';
import SchoolAlbums from '../../Screens/Albums';
import CheckIn from '../../Screens/CheckIn';
import DailyAttendance from '../../Screens/DailyAttendance';
import LeaveApplication from '../../Screens/LeaveApplication';
import ActivityDetail from '../../Screens/ActivityDetail';
import EmptyDashboard from '../../Screens/EmptyDashboard';
import Settings from '../../Screens/Settings';
import DiaryHomework from '../../Screens/DiaryHomework';
import Notices from '../../Screens/Notices';
import NoticeDetail from '../../Screens/Notices/Detail';
import Notifications from '../../Screens/Notifications';
import NotificationDetail from '../../Screens/Notifications/Detail';
import HelpSupport from '../../Screens/HelpSupport';
import CreateSupportTicket from '../../Screens/HelpSupport/CreateTicket';
import SupportTicket from '../../Screens/HelpSupport/TicketChat';
import ChangePassword from '../../Screens/ChangePassword';
import Children from '../../Screens/Children';
import TeacherChatThread from '../../Screens/TeacherChat/Thread';
import { useAppSelector } from '../../Stores/hooks';
import { selectUserToken } from '../../Stores/slices/user.slice';
import useNotificationSocket from '../../Hooks/useNotificationSocket';
import useChatUnread from '../../Hooks/useChatUnread';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const token = useAppSelector(selectUserToken);
  useNotificationSocket();
  useChatUnread();

  return (
    <Stack.Navigator
      screenOptions={NavigationOptions}
      initialRouteName={
        token ? routes.navigator.mainTabs : routes.navigator.onboard
      }>
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
          <Stack.Screen name={routes.navigator.mainTabs} component={MainTabs} />
          <Stack.Screen name={routes.screens.emptyDashboard} component={EmptyDashboard} />
          <Stack.Screen name={routes.navigator.experience} component={Experience} />
          <Stack.Screen name={routes.screens.profile} component={Profile} />
          <Stack.Screen name={routes.screens.addChild} component={AddChild} />
          <Stack.Screen name={routes.screens.editChild} component={EditChild} />
          <Stack.Screen
            name={routes.screens.childProfile}
            component={ChildProfile}
          />
          <Stack.Screen name={routes.screens.profileForm} component={ProfileForm} />
          <Stack.Screen
            name={routes.screens.schoolCalendar}
            component={SchoolCalendar}
            options={{contentStyle: {backgroundColor: '#F4F5F8'}}}
          />
          <Stack.Screen
            name={routes.screens.feesDue}
            component={FeesDue}
            options={{contentStyle: {backgroundColor: '#F4F5F8'}}}
          />
          <Stack.Screen
            name={routes.screens.result}
            component={Result}
            options={{contentStyle: {backgroundColor: '#F4F5F8'}}}
          />
          <Stack.Screen
            name={routes.screens.assessments}
            component={Assessments}
            options={{contentStyle: {backgroundColor: '#F4F5F8'}}}
          />
          <Stack.Screen name={routes.screens.timeTable} component={TimeTable} />
          <Stack.Screen
            name={routes.screens.schoolAlbums}
            component={SchoolAlbums}
            options={{contentStyle: {backgroundColor: '#F4F5F8'}}}
          />
          <Stack.Screen
            name={routes.screens.children}
            component={Children}
            options={{contentStyle: {backgroundColor: '#FFFFFF'}}}
          />
          <Stack.Screen
            name={routes.screens.teacherChatThread}
            component={TeacherChatThread}
            options={{contentStyle: {backgroundColor: '#F2F5FA'}}}
          />
          <Stack.Screen name={routes.screens.checkIn} component={CheckIn} />
          <Stack.Screen
            name={routes.screens.dailyAttendance}
            component={DailyAttendance}
            options={{
              gestureEnabled: false,
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'none',
              contentStyle: {backgroundColor: 'transparent'},
            }}
          />
          <Stack.Screen
            name={routes.screens.leaveApplication}
            component={LeaveApplication}
          />
          <Stack.Screen
            name={routes.screens.activityDetail}
            component={ActivityDetail}
          />
          <Stack.Screen name={routes.screens.notices} component={Notices} />
          <Stack.Screen
            name={routes.screens.noticeDetail}
            component={NoticeDetail}
            options={{contentStyle: {backgroundColor: '#F2F5FA'}}}
          />
          <Stack.Screen name={routes.screens.settings} component={Settings} />
          <Stack.Screen
            name={routes.screens.diaryHomework}
            component={DiaryHomework}
          />
          <Stack.Screen
            name={routes.screens.notifications}
            component={Notifications}
          />
          <Stack.Screen
            name={routes.screens.notificationDetail}
            component={NotificationDetail}
            options={{contentStyle: {backgroundColor: '#F2F5FA'}}}
          />
          <Stack.Screen
            name={routes.screens.helpSupport}
            component={HelpSupport}
          />
          <Stack.Screen
            name={routes.screens.createSupportTicket}
            component={CreateSupportTicket}
          />
          <Stack.Screen
            name={routes.screens.supportTicket}
            component={SupportTicket}
          />
          <Stack.Screen
            name={routes.screens.changePassword}
            component={ChangePassword}
          />
        </Stack.Group>
      }
    </Stack.Navigator>
  );
};

export default MainStack;

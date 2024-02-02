import {Text, View, StatusBar, SafeAreaView} from 'react-native';
import React from 'react';
import {styles} from './style';
import ContainerComponent from '../../Components/ContainerComponent';
import {SecondaryHeader} from '../../Components/SecondaryHeader';

const AttendanceLog = () => {
  return (
    <>
      <StatusBar
        translucent
        // backgroundColor="#035392"
        barStyle="light-content"
      />
      <SecondaryHeader />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>AttendanceLog</Text>
        </View>
      </SafeAreaView>
    </>
  );
};

export default AttendanceLog;

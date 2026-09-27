import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
  Text,
} from 'react-native';
import CustomStatusBar from '../StatusBar';

const ContainerComponent = ({children, scrollview}) => {
  return (
    <>
      <CustomStatusBar backgroundColor="#F4F5F8" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {scrollview ? (
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            {children}
          </ScrollView>
        ) : (
          <>{children}</>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ContainerComponent;

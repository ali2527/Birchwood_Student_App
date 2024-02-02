import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
  Text,
} from 'react-native';

const ContainerComponent = ({
  children,
  barStyle,
  backgroundColor,
  translucent,
  style,
}) => {
  return (
    <>
      <StatusBar
        translucent
        // backgroundColor="#035392"
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.container}>
        <View>
          <Text>Your content goes here</Text>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: 'white', // Set your desired background color here
  },
});

export default ContainerComponent;

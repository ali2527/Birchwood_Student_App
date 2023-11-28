// CustomStatusBar.js
import React from 'react';
import {StatusBar, SafeAreaView} from 'react-native';

const CustomStatusBar = ({backgroundColor, barStyle}) => {
  return (
    <SafeAreaView style={{backgroundColor}}>
      <StatusBar backgroundColor={backgroundColor} barStyle={barStyle} />
    </SafeAreaView>
  );
};

export default CustomStatusBar;

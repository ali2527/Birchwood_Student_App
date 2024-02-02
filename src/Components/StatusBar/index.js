// CustomStatusBar.js
import React from 'react';
import {StatusBar, SafeAreaView, Platform} from 'react-native';

const CustomStatusBar = ({backgroundColor, barStyle}) => {
  return (
    <SafeAreaView
      style={{
        backgroundColor,
      }}>
      <StatusBar
        backgroundColor={backgroundColor || 'transparent'}
        barStyle={barStyle || 'dark-content'}
      />
    </SafeAreaView>
  );
};

export default CustomStatusBar;

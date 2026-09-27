// CustomStatusBar.js
import React from 'react';
import {
  StatusBar,
  SafeAreaView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const CustomStatusBar = ({backgroundColor, barStyle = 'dark-content', ...props}) => {
  return (
    <View style={[styles.statusBar, {backgroundColor}]}>
      <SafeAreaView>
        <StatusBar
          translucent
          backgroundColor={backgroundColor}
          barStyle={barStyle}
          {...props}
        />
      </SafeAreaView>
    </View>
  );
};

export default CustomStatusBar;

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});

import React from 'react';
import {StyleSheet, Platform, StatusBar} from 'react-native';
import {vh, vw} from '../../theme/units';

export const styles = StyleSheet.create({
  container: {
    // flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    // backgroundColor: 'green',
    // alignItems: 'center',
    justifyContent: 'center',
    // margin: vh * 3,
  },
  borderDesign: {
    // marginTop: vh * 2,
    height: vh * 7,
    width: vw * 100,
    backgroundColor: 'white',
  },
});

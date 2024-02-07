import React from 'react';
import {StyleSheet, Text, View, Platform, StatusBar} from 'react-native';
import {vh, vw} from '../../theme/units';
import {colors} from '../../theme/colors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // position: 'relative',

    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    zIndex: 1,
    padding: 10,
    // position: 'absolute',
    top: -35,
    borderTopLeftRadius: vh * 5,
    borderTopRightRadius: vh * 5,
    // backgroundColor: 'green',
    backgroundColor: colors.theme.white,
    height: vh * 100,
    width: vw * 100,
    // padding: 15,
  },
});

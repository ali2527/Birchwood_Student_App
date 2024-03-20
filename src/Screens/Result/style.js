import React from 'react';
import {StyleSheet} from 'react-native';
import {vh, vw} from '../../theme/units';
import {colors} from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  childContainer: {
    flex: 1,
    position: 'absolute',
    backgroundColor: colors.theme.white,
    height: vh * 60,
    width: vw * 100,
    // zIndex: 100,
    top: vh * 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: vh * 2,
    // bottom: 30,
  },
  topBannerImg: {
    height: vh * 30,
    width: vw * 100,
    resizeMode: 'contain',
  },
  gradeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradePercentImgContainer: {
    height: vh * 19,
    width: vw * 38.5,
    borderRadius: 100,
  },
  gradePercentImg: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultTableContainer: {
    borderWidth: 1,
    borderColor: colors.theme.borderColor,
    width: vw * 80,
    borderRadius: 10,
    marginTop: vh * 5,
  },
  cardContainer: {
    flexDirection: 'row',
  },
  itemContent: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 12,
    color: colors.text.black,
  },
});

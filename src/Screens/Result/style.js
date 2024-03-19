import React from 'react';
import {StyleSheet} from 'react-native';
import {vh, vw} from '../../theme/units';
import {colors} from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  childContainer: {
    flex: 2,
    position: 'absolute',
    backgroundColor: colors.theme.white,
    height: vh * 100,
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
  flatListContainer: {
    // flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: colors.theme.borderColor,
    width: vw * 80,
    borderRadius: 10,
  },
  statusContainer: {
    borderWidth: 1,
    borderColor: colors.theme.primary,
    backgroundColor: colors.theme.primary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  borderLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.theme.borderColor,
    marginVertical: 5,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 13,
    marginVertical: 5,
  },
});

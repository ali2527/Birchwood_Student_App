import React from 'react';
import {StyleSheet} from 'react-native';
import {vh, vw} from '../../theme/units';
import {colors} from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: vh * 2,
  },
  flatListContainer: {
    // flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  cardContainer: {
    // borderWidth: 1,
    // borderColor: colors.theme.borderColor,
    width: vw * 40,
    height: vh * 13,
    borderRadius: 10,
    margin: vh * 1,
    // shadow box
    //shadowColor: '#000',
  },
  elevation: {
    elevation: -2,
    // shadowColor: '#000',
  },
  cardImgStyle: {
    resizeMode: 'contain',
    height: '100%',
    width: '100%',
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: vw * 5.5,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.theme.borderColor,
    borderRadius: vh * 2,
    height: vh * 3.5,
  },
  stepperBtnSelected: {
    backgroundColor: colors.theme.primary,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: vw * 5,
    flex: 1,
    borderRadius: vh * 2,
  },
  stepperBtnUnSelected: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    // paddingHorizontal: vw * 5,
    // width: '25%',
  },
  selectedTitle: {
    color: colors.theme.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  unSelectedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  lunch_break_icon: {
    height: vh * 7,
    width: vw * 8,
  },
});

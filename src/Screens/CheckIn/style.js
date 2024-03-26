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
  dp: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  attendanceTableContainer: {
    borderWidth: 1,
    borderColor: colors.theme.borderColor,
    borderRadius: 10,
    backgroundColor: colors.table.background,
  },
  tableHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.theme.borderColor,
    padding: 5,
  },
  tableItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableItems: {
    // padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.theme.borderColor,
    borderBottomColor: colors.theme.borderColor,
  },
  attendanceItem: {
    padding: 15,
    flex: 1,
    textAlign: 'center',
    color: colors.theme.black,
    fontSize: 13,
    alignSelf: 'center',
  },
});

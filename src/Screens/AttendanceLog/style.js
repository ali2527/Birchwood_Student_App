import React from 'react';
import { StyleSheet, Text, View, Platform, StatusBar } from 'react-native';
import { vh, vw } from '../../theme/units';
import { colors } from '../../theme/colors';

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
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  statIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 15,
  },
  statTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 16,
    color: colors.text.black,
    fontFamily: 'Glory-Medium',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  detailsDate: {
    fontSize: 18,
    color: colors.text.black,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 15,
    color: colors.text.black,
    fontFamily: 'Glory-Bold',
  },
});

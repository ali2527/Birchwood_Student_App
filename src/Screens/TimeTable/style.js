import React from 'react';
import { StyleSheet } from 'react-native';
import { vh, vw } from '../../theme/units';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.theme.white,
  },
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: colors.theme.primary + '08',
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  dayBtn: {
    width: vw * 15,
    height: vh * 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dayBtnSelected: {
    backgroundColor: colors.theme.primary,
    borderColor: colors.theme.primary,
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Glory-Bold',
    color: colors.text.grey,
  },
  dayTextSelected: {
    color: '#fff',
  },
  timelineContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: vh * 10,
  },
  timeContainer: {
    width: vw * 15,
    alignItems: 'flex-end',
    paddingRight: 15,
    paddingTop: 5,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Glory-Bold',
    color: colors.text.black,
  },
  endTimeText: {
    fontSize: 12,
    fontFamily: 'Glory-Regular',
    color: colors.text.grey,
  },
  timelineGraphic: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 8,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
  activityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginLeft: 15,
    marginBottom: 20,
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  lunchCard: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    marginLeft: 12,
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    color: colors.text.black,
  },
  periodText: {
    fontSize: 12,
    fontFamily: 'Glory-Medium',
    color: colors.text.grey,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 15,
    fontFamily: 'Glory-Medium',
    color: colors.text.grey,
    textAlign: 'center',
  },
});

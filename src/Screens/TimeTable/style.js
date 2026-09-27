import {StyleSheet} from 'react-native';
import fonts from '../../Assets/fonts';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PRIMARY = '#035392';
const LOGO_BLUE = '#D3E6F6';
const PAGE = '#F4F5F8';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
    paddingRight: 18,
    paddingBottom: 8,
  },
  switcher: {
    marginLeft: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 2,
  },
  dateLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: MUTED,
  },
  headerTitle: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: NAVY,
  },
  days: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dayText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: MUTED,
  },
  dateCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    flexShrink: 0,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#D5D8E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleOn: {
    backgroundColor: LOGO_BLUE,
    borderColor: '#8BB8DC',
  },
  dateNum: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    lineHeight: 18,
    textAlign: 'center',
    color: NAVY,
    includeFontPadding: false,
  },
  dateNumOn: {
    color: NAVY,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    flexGrow: 1,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 28,
  },
  timeCol: {
    width: 72,
    paddingTop: 2,
  },
  startTime: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 13,
    color: NAVY,
  },
  startTimeNow: {
    color: PRIMARY,
  },
  endTime: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  track: {
    width: 18,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D5D8E0',
    backgroundColor: PAGE,
    marginTop: 4,
  },
  dotNow: {
    borderColor: NAVY,
    backgroundColor: NAVY,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 4,
    backgroundColor: '#E3E6EE',
    borderRadius: 1,
  },
  card: {
    flex: 1,
    minHeight: 108,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  specialCard: {
    flex: 1,
    minHeight: 72,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  specialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specialTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    letterSpacing: -0.3,
    color: NAVY,
  },
  subject: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    letterSpacing: -0.3,
    color: NAVY,
  },
  description: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5568',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  person: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: '#3E4658',
  },
  breakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  breakText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: MUTED,
  },
  loading: {
    paddingTop: 28,
    alignItems: 'center',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D3E6F6',
  },
  emptyCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  emptyTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: NAVY,
  },
  emptyBody: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
});

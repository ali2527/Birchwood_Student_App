import { StyleSheet } from 'react-native';
import { vh, vw } from '../../theme/units';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: vh * 2,
    backgroundColor: colors.theme.white,
  },
  childBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.theme.lightGray + '40',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  childLabel: {
    fontSize: 16,
    color: colors.text.black,
    fontFamily: 'Glory-Medium',
  },
  childName: {
    fontSize: 16,
    color: colors.theme.primary,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  formContainer: {
    paddingHorizontal: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.text.black,
    fontFamily: 'Glory-Bold',
    marginBottom: 8,
  },
  reasonInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    height: vh * 15,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  historyContainer: {
    marginTop: 10,
    backgroundColor: '#F1F3F5',
    padding: 15,
    borderRadius: 20,
    marginBottom: 40,
  },
  historyTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: colors.text.black,
  },
  historyCard: {
    backgroundColor: colors.theme.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: colors.text.black,
    fontFamily: 'Glory-Bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Glory-Bold',
  },
  historyReason: {
    fontSize: 14,
    color: colors.text.grey,
    fontFamily: 'Glory-Regular',
  },
});

import {StyleSheet} from 'react-native';
import {vh, vw} from '../../theme/units';
import {colors} from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: vh * 2,
  },
  inputStyle: {
    backgroundColor: colors.theme.white,
  },
});

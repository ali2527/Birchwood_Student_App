import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {vh, vw} from '../../theme/units';
import {SecondaryHeader} from '../SecondaryHeader';
import {colors} from '../../theme/colors';

const ScreenWrapperContainer = ({children, title}) => {
  return (
    <View style={styles.container}>
      <SecondaryHeader
        iconName="chevron-back-outline"
        headerHeight={vh * 15}
        title={title}
        color={colors.theme.white}
      />

      <View style={styles.childContainer}>{children}</View>
    </View>
  );
};

export default ScreenWrapperContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  childContainer: {
    flex: 1,
    position: 'absolute',
    backgroundColor: colors.theme.white,
    // height: vh * 100,
    width: vw * 100,
    zIndex: 100,
    top: vh * 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    bottom: 30,
  },
});

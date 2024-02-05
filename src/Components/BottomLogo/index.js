import {StyleSheet, Text, View, ImageBackground} from 'react-native';
import React from 'react';
import bg_bottom_logo from '../../Assets/images/bottom-logo.png';
import {vh} from '../../theme/units';

const BottomLogo = () => {
  return (
    <View style={styles.bottomView}>
      <ImageBackground
        source={bg_bottom_logo}
        style={styles.bottomImageBackground}></ImageBackground>
    </View>
  );
};

export default BottomLogo;

const styles = StyleSheet.create({
  bottomView: {
    overflow: 'visible',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: vh * 20,
    zIndex: 1,
  },
  bottomImageBackground: {
    flex: 1,
    resizeMode: 'contain',
    // alignItems: 'flex-end',
    // justifyContent: 'flex-end',
    // padding: 20,
  },
});

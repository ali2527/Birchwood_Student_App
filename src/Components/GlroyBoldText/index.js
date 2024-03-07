import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const GlroyBold = ({text, _style, color}) => {
  return <Text style={{...styles.text, color: color, ..._style}}>{text}</Text>;
};

export default GlroyBold;

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Glory-Bold',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

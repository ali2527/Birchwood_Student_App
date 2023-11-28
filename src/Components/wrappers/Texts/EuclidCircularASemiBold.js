import React from 'react';
import {Text} from 'react-native';

import styles from './styles';

const EuclidCircularASemiBold = props => {
  return (
    <Text
      allowFontScaling={false}
      adjustsFontSizeToFit={false}
      ellipsizeMode="tail"
      {...props}
      style={[styles.text, styles.euclidCircularASemiBold, props.style]}>
      {props.text}
    </Text>
  );
};

export default EuclidCircularASemiBold;

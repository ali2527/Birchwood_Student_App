import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientComponent = ({colors, start, end, children, style}) => {
  return (
    <LinearGradient
      colors={colors || ['#035392', '#6688CA']}
      // start={start || {x: 0, y: 0}} // Default start point if not provided
      // end={end || {x: 1, y: 1}} // Default end point if not provided
      style={style}>
      {children}
    </LinearGradient>
  );
};

export default GradientComponent;

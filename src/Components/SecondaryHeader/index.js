import {View, Text} from 'react-native';
import React from 'react';
import {styles} from './style';
import GradientComponent from '../Gradient';
import {vh} from '../../theme/units';

export const SecondaryHeader = () => {
  return (
    <GradientComponent style={{height: vh * 17}}>
      <View style={styles.container}>
        <Text>index</Text>
      </View>
    </GradientComponent>
  );
};

import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {styles} from './style';
import GradientComponent from '../Gradient';
import {vh, vw} from '../../theme/units';
import ToggleButton from '../ToggleButton';
import VectorIcon from '../VectorIcons';
import {colors} from '../../theme/colors';

export const SecondaryHeader = ({btn, handlePress, iconName}) => {
  return (
    <GradientComponent style={{height: vh * 17}}>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: vh * 3,
            marginHorizontal: 15,
          }}>
          <TouchableOpacity>
            <VectorIcon
              type={'Ionicons'}
              name={iconName}
              size={20}
              color={colors.theme.white}
            />
          </TouchableOpacity>
          {btn && (
            <View
              style={{
                alignItems: 'center',
                width: vw * 60,
              }}>
              <ToggleButton btn={btn} handlePress={handlePress} />
            </View>
          )}
        </View>
      </View>
    </GradientComponent>
  );
};

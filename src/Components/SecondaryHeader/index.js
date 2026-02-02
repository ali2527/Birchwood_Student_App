import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { styles } from './style';
import GradientComponent from '../Gradient';
import { vh, vw } from '../../theme/units';
import ToggleButton from '../ToggleButton';
import VectorIcon from '../VectorIcons';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import GlroyBold from '../GlroyBoldText';

export const SecondaryHeader = ({
  btn,
  handlePress,
  iconName,
  headerHeight,
  navigateHandler,
  title,
  color,
}) => {
  const navigation = useNavigation();
  return (
    <GradientComponent style={{ height: headerHeight, paddingTop: vh * 6 }}>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: vh * 2,
            marginHorizontal: 15,
          }}>
          <TouchableOpacity
            onPress={() =>
              navigateHandler ? navigateHandler() : navigation.goBack()
            }>
            <VectorIcon
              type={'Ionicons'}
              name={iconName}
              size={20}
              color={colors.theme.white}
            />
          </TouchableOpacity>
          {title && (
            <GlroyBold
              text={title}
              _style={{ color: color, marginHorizontal: 8 }}
            />
          )}
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

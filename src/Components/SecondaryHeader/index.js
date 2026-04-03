import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { styles } from './style';
import GradientComponent from '../Gradient';
import { vh } from '../../theme/units';
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
  const showBack = Boolean(iconName);

  return (
    <GradientComponent style={{ height: headerHeight, paddingTop: vh * 6 }}>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: vh * 2,
            paddingHorizontal: 12,
          }}>
          {showBack ? (
            <TouchableOpacity
              onPress={() =>
                navigateHandler ? navigateHandler() : navigation.goBack()
              }
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{
                paddingVertical: 8,
                paddingRight: 10,
                minWidth: 44,
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}>
              <VectorIcon
                type={'Ionicons'}
                name={iconName || 'chevron-back-outline'}
                size={26}
                color={colors.theme.white}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 8 }} />
          )}
          {title ? (
            <GlroyBold
              text={title}
              _style={{ color: color, marginHorizontal: 6 }}
            />
          ) : null}
          {btn ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ToggleButton btn={btn} handlePress={handlePress} />
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}
        </View>
      </View>
    </GradientComponent>
  );
};

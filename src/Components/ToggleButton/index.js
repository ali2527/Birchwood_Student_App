import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {colors} from '../../theme/colors';
import {vw, vh} from '../../theme/units';

const ToggleButton = ({btn, handlePress}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          btn.selected === btn.left ? styles.selectedBtn : styles.unSelectedBtn,
          {},
        ]}
        onPress={() => handlePress('selected', btn.left)}>
        <Text
          style={[
            styles.title,
            {
              color:
                btn.selected === btn.left
                  ? colors.theme.primary
                  : colors.theme.white,
            },
          ]}>
          {btn.left}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          btn.selected === btn.right
            ? styles.selectedBtn
            : styles.unSelectedBtn,
          {left: vw * 25},
        ]}
        onPress={() => handlePress('selected', btn.right)}>
        <Text
          style={[
            styles.title,
            {
              color:
                btn.selected === btn.right
                  ? colors.theme.primary
                  : colors.theme.white,
            },
          ]}>
          {btn.right}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ToggleButton;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    // alignItems: 'center',
  },
  selectedBtn: {
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 20,
    backgroundColor: colors.theme.white,
    position: 'absolute',
    zIndex: 1,
    width: vw * 30,
    height: vh * 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unSelectedBtn: {
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 20,
    backgroundColor: colors.background.sky,
    width: vw * 30,
    height: vh * 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

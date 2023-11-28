import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import CustomStatusBar from '../../Components/StatusBar';
import {colors} from '../../theme/colors';

export default function OnBoardScreen() {
  return (
    <View style={{flex: 1}}>
      <CustomStatusBar
        backgroundColor={colors.theme.white}
        barStyle="dark-content"
      />
      <Text>index</Text>
    </View>
  );
}

const styles = StyleSheet.create({});

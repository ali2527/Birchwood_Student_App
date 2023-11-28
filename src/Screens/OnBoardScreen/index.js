import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import CustomStatusBar from '../../Components/StatusBar';
import { colors } from '../../theme/colors';
import MainLogo from '../../Components/MainLogo';
import ChildLogo from '../../Components/ChildLogo';

export default function OnBoardScreen() {
  return (
    <View style={{ flex: 1 }}>
      <CustomStatusBar
        backgroundColor={colors.theme.white}
        barStyle="dark-content"
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ flex: 1, flexGrow: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1.2, alignItems: 'center' }}>
            <MainLogo />
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ChildLogo />
          </View>
          <View style={{ flex: 1, backgroundColor: 'green' }}>
            <Text>Kdjkafdlal</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});

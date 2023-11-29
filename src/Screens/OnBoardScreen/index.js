import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import CustomStatusBar from '../../Components/StatusBar';
import { colors } from '../../theme/colors';
import MainLogo from '../../Components/MainLogo';
import ChildLogo from '../../Components/ChildLogo';
import CustomButton from '../../Components/Button';
import GlroyBold from '../../Components/GlroyBoldText';
import GrayMediumText from '../../Components/GrayMediumText';
import SocialMediaIcons from '../../Components/SocialMediaIcons';

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
          <View style={{ flex: 1, alignItems: 'center' }}>
            <MainLogo />
            <GlroyBold
              text={'Empowering dreams, Uniting Futures'}
              _style={styles.head}
            />
            <GrayMediumText
              text={'Welcome to Birchwood Montessori Academy, a family-owned and operated school with a profound mission and vision.'}
              _style={styles.para}
            />
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ChildLogo />
          </View>
          <View style={{ flex: 0.8, justifyContent: 'center' }}>
            <View style={styles.btn_container}>
              <CustomButton
                title={'Sign Up'}
              />
              <CustomButton
                isFocused={true}
                title={'Sign In'}
              />
            </View>
            <GlroyBold
              text={'Sign In With'}
              _style={styles.text}
            />
            <SocialMediaIcons />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  btn_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
    marginHorizontal: 15
    // alignItems: 'center'
  },
  text: {
    color: colors.text.black,
    marginTop: 15,
    alignSelf: 'center'
  },
  head: {
    marginTop: 20,
    color: colors.text.black
  },
  para: {
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22
  }
});

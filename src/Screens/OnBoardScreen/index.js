import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../../Components/StatusBar';
import { colors, appShadow } from '../../theme/colors';
import MainLogo from '../../Components/MainLogo';
import ChildLogo from '../../Components/ChildLogo';
import CustomButton from '../../Components/Button';
import GlroyBold from '../../Components/GlroyBoldText';
import GrayMediumText from '../../Components/GrayMediumText';
import { useNavigation } from '@react-navigation/native';
import routes from '../../Navigation/routes';
import { vw } from '../../theme/units';

export default function OnBoardScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
    
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}>

          <View style={styles.hero}>
            <View style={[styles.logoCard]}>
              <MainLogo _style={{width:vw*100}}/>
            </View>
            <Text style={styles.academyName}>Birchwood Montessori Academy</Text>
            <GlroyBold
              text="Empowering dreams, uniting futures"
              _style={styles.headline}
            />
            <GrayMediumText
              text="A family-owned school with a clear mission: nurture curiosity, character, and community—so every child can thrive."
              _style={styles.para}
            />
          </View>

          <View style={styles.illustrationWrap}>
            <ChildLogo _style={styles.childLogo} />
          </View>

          <View style={[styles.actionsCard, appShadow]}>
            <Text style={styles.actionsLabel}>Get started</Text>
            <View style={styles.btnRow}>
              <CustomButton
                title="Sign up"
                onPress={() => navigation.navigate(routes.navigator.signup)}
                containerStyle={styles.btnHalf}
              />
              <CustomButton
                isFocused
                title="Sign in"
                onPress={() => navigation.navigate(routes.navigator.signin)}
                containerStyle={styles.btnHalf}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.theme.white,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  accentBar: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.theme.secondary,
    marginTop: 8,
    marginBottom: 20,
    opacity: 0.85,
  },
  hero: {
    alignItems: 'center',
  },
  logoCard: {
    // backgroundColor: colors.theme.white,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 28,
    marginBottom: 20,
  },
  academyName: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.theme.primary,
    marginBottom: 10,
  },
  headline: {
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 30,
    color: colors.text.black,
    paddingHorizontal: 8,
  },
  para: {
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 24,
    fontSize: 15,
    color: colors.text.greyAlt2,
    paddingHorizontal: 4,
    maxWidth: 340,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 28,
    minHeight: 180,
  },
  childLogo: {
    height: 160,
    width: 280,
    maxWidth: '100%',
  },
  actionsCard: {
    backgroundColor: colors.theme.white,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: colors.theme.lightGray,
  },
  actionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.text.altGrey,
    marginBottom: 16,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  btnHalf: {
    flex: 1,
    marginVertical: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    minWidth: 0,
  },
});

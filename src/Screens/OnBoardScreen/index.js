import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../Components/Button';
import ChildLogo from '../../Components/ChildLogo';
import GlroyBold from '../../Components/GlroyBoldText';
import GrayMediumText from '../../Components/GrayMediumText';
import MainLogo from '../../Components/MainLogo';
import routes from '../../Navigation/routes';
import { colors, appShadow } from '../../theme/colors';
import { vw } from '../../theme/units';
import { useNavigation } from '@react-navigation/native';

export default function OnBoardScreen() {
  const navigation = useNavigation();

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(32)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;

  const illusOpacity = useRef(new Animated.Value(0)).current;
  const illusTranslateY = useRef(new Animated.Value(36)).current;

  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const actionsTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.spring(heroTranslateY, {
          toValue: 0,
          friction: 9,
          tension: 68,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 72,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(illusOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.spring(illusTranslateY, {
          toValue: 0,
          friction: 9,
          tension: 64,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(actionsOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(actionsTranslateY, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.theme.white} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <Animated.View
            style={[
              styles.hero,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslateY }],
              },
            ]}>
            <Animated.View
              style={[
                styles.logoCard,
                { transform: [{ scale: logoScale }] },
              ]}>
              <MainLogo _style={{ width: vw * 100 }} />
            </Animated.View>
            <Text style={styles.academyName}>Birchwood Montessori Academy</Text>
            <GlroyBold
              text="Empowering dreams, uniting futures"
              _style={styles.headline}
            />
            <GrayMediumText
              text="A family-owned school with a clear mission: nurture curiosity, character, and community—so every child can thrive."
              _style={styles.para}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.illustrationWrap,
              {
                opacity: illusOpacity,
                transform: [{ translateY: illusTranslateY }],
              },
            ]}>
            <ChildLogo _style={styles.childLogo} />
          </Animated.View>

          <Animated.View
            style={[
              styles.actionsCard,
              appShadow,
              {
                opacity: actionsOpacity,
                transform: [{ translateY: actionsTranslateY }],
              },
            ]}>
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
          </Animated.View>
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
  hero: {
    alignItems: 'center',
  },
  logoCard: {
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

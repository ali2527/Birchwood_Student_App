import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomButton from '../../Components/Button';
import MainLogo from '../../Components/MainLogo';
import fonts from '../../Assets/fonts';
import splashImage from '../../Assets/images/splash_image.png';
import routes from '../../Navigation/routes';
import {colors} from '../../theme/colors';
import {HEIGHT, WIDTH} from '../../theme/units';
import {useNavigation} from '@react-navigation/native';

export default function OnBoardScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.theme.white} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.logoWrap}>
            <MainLogo _style={styles.logo} />
          </View>

          <Text style={styles.headline}>Empowering dreams, Uniting Futures</Text>
          <Text style={styles.body}>
            Welcome to Birchwood Montessori Academy, a family-owned and operated
            school with a profound mission and vision.
          </Text>

          <Image
            source={splashImage}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <View style={styles.btnRow}>
            <CustomButton
              title="Sign Up"
              onPress={() => navigation.navigate(routes.navigator.signup)}
              containerStyle={styles.btnHalf}
            />
            <CustomButton
              isFocused
              title="Sign In"
              onPress={() => navigation.navigate(routes.navigator.signin)}
              containerStyle={styles.btnHalf}
            />
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
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  logoWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: {
    marginTop: 0,
    width: WIDTH * 0.5,
    height: 56,
  },
  headline: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 22,
    lineHeight: 28,
    color: '#2B2B2B',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  body: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 20,
    color: '#8A8A8A',
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
    maxWidth: 340,
  },
  heroImage: {
    width: WIDTH * 0.82,
    height: HEIGHT * 0.32,
    marginVertical: 8,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  btnHalf: {
    flex: 1,
    height: 44,
    marginVertical: 0,
    marginHorizontal: 6,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 22,
    minWidth: 0,
  },
});

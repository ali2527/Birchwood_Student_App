import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CustomButton from '../../Components/Button';
import AuthShell from '../../Components/Auth/AuthShell';
import MainLogo from '../../Components/MainLogo';
import fonts from '../../Assets/fonts';
import splashImage from '../../Assets/images/splash_image.png';
import routes from '../../Navigation/routes';
import {colors} from '../../theme/colors';
import {HEIGHT, WIDTH} from '../../theme/units';

export default function OnBoardScreen() {
  const navigation = useNavigation();

  return (
    <AuthShell contentStyle={styles.content}>
      <View style={styles.cluster}>
        <View style={styles.logoWrap}>
          <MainLogo _style={styles.logo} />
        </View>

        <Text style={styles.headline}>
          Empowering dreams,{'\n'}Uniting Futures
        </Text>
        <Text style={styles.body}>
          Welcome to Birchwood Montessori Academy, a family-owned and operated
          school with a proud mission and vision.
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
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: HEIGHT * 0.08,
  },
  cluster: {
    width: '100%',
    alignItems: 'center',
  },
  logoWrap: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    marginTop: 0,
    width: WIDTH * 0.6,
    height: 58,
  },
  headline: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 23,
    lineHeight: 31,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 8,
  },
  body: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 20,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    maxWidth: 340,
  },
  heroImage: {
    width: WIDTH * 0.8,
    height: HEIGHT * 0.3,
    marginTop: 16,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  btnHalf: {
    flex: 1,
    height: 48,
    marginVertical: 0,
    marginHorizontal: 6,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 14,
    minWidth: 0,
    borderWidth: 1.5,
    borderColor: colors.theme.primary,
  },
});

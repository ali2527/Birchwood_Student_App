import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SplashScreen from 'react-native-splash-screen';
import splashImage from '../../Assets/images/splash_image.png';
import mainLogo from '../../Assets/images/logo/main_logo.png';
import {vw} from '../../theme/units';

const SCREEN_H = Dimensions.get('window').height;

export default function AnimatedSplash({onDone}) {
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const bounceAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const [splashReady, setSplashReady] = useState(false);

  useEffect(() => {
    const fallback = setTimeout(() => setSplashReady(true), 900);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (!splashReady) {
      return;
    }

    try {
      SplashScreen.hide();
    } catch (error) {
      console.log('Error hiding splash screen:', error);
    }

    const wave = Animated.loop(
      Animated.stagger(
        140,
        bounceAnims.map(dot =>
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -8,
              duration: 360,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 360,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    );
    wave.start();

    const exit = Animated.sequence([
      Animated.delay(1800),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 480,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    exit.start(({finished}) => {
      if (finished) {
        onDone?.();
      }
    });

    return () => {
      wave.stop();
      exit.stop();
    };
  }, [splashReady]);

  return (
    <Animated.View style={[styles.root, {opacity: screenOpacity}]}>
      <LinearGradient
        colors={['#8BB4E8', '#5A8FD0', '#2E5BB2', '#035392']}
        locations={[0, 0.28, 0.65, 1]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradient}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={styles.center}>
          <Image source={mainLogo} style={styles.logo} resizeMode="contain" />
          <Image
            source={splashImage}
            style={styles.splashImage}
            resizeMode="contain"
            onLoadEnd={() => setSplashReady(true)}
          />
          <View style={styles.loader}>
            {bounceAnims.map((dot, index) => (
              <Animated.View
                key={index}
                style={[styles.loaderDot, {transform: [{translateY: dot}]}]}
              />
            ))}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
  gradient: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: (StatusBar.currentHeight || 24) + SCREEN_H * 0.14,
    paddingHorizontal: 8,
  },
  logo: {
    width: vw * 78,
    height: vw * 22,
  },
  splashImage: {
    width: vw * 82,
    height: vw * 79,
    marginTop: 20,
    marginBottom: 24,
  },
  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 5,
    opacity: 0.95,
  },
});

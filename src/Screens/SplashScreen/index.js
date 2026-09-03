import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  NativeModules,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import splashBackground from '../../Assets/images/background.png';
import boyImage from '../../Assets/images/boy.png';
import mainLogo from '../../Assets/images/logo/main_logo.png';
import planeImage from '../../Assets/images/plane.png';
import planetImage from '../../Assets/images/planet.png';
import planet2Image from '../../Assets/images/planet_2.png';
import fonts from '../../Assets/fonts';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');
const STATUS_TOP = StatusBar.currentHeight || 24;

const LOGO_W = SCREEN_W * 0.72;
const LOGO_FULL_H = LOGO_W * (182 / 668);
const LOGO_CLIP_H = LOGO_FULL_H * 0.66;

// Splash layout v18: boy → planes → planets one by one
const SPLASH_LAYOUT_VERSION = 17;

function hideNativeSplash() {
  try {
    if (Platform.OS === 'android' && NativeModules.SplashSystemUi) {
      NativeModules.SplashSystemUi.hideNativeSplash();
    } else {
      require('react-native-splash-screen').default.hide();
    }
  } catch (error) {
    console.log('Error hiding splash screen:', error);
  }
}

function endSplashImmersive() {
  try {
    if (Platform.OS === 'android' && NativeModules.SplashSystemUi) {
      NativeModules.SplashSystemUi.endSplashImmersive();
    }
  } catch (error) {
    console.log('Error restoring system bars:', error);
  }
}

const PLANE1_TOP = SCREEN_H * 0.42;
const PLANE2_TOP = SCREEN_H * 0.58;
const PLANE1_ANCHOR_LEFT = SCREEN_W * 0.18;
const PLANE2_ANCHOR_RIGHT = SCREEN_W * 0.26;
const PLANE_ASPECT = 58 / 94;
const PLANE1_W = 58;
const PLANE1_H = PLANE1_W * PLANE_ASPECT;
const PLANE2_W = 36;
const PLANE2_H = PLANE2_W * PLANE_ASPECT;
const PLANE1_START_X = -SCREEN_W * 0.58;
const PLANE1_END_X = -SCREEN_W * 0.08;
const PLANE1_START_Y = -SCREEN_H * 0.07;
const PLANE1_START_ROTATE = -18;
const PLANE2_START_X = SCREEN_W * 0.58;
const PLANE2_START_Y = -SCREEN_H * 0.055;
const PLANE2_START_ROTATE = 16;

/** Clean white 4-point sparkle */
function Star({size = 10}) {
  const arm = Math.max(1.4, size * 0.14);
  const core = Math.max(2, size * 0.22);
  return (
    <View
      pointerEvents="none"
      style={[styles.starBox, {width: size, height: size}]}>
      <View
        style={[
          styles.starArm,
          {
            width: arm,
            height: size,
            backgroundColor: '#FFFFFF',
            borderRadius: arm,
          },
        ]}
      />
      <View
        style={[
          styles.starArm,
          {
            width: size,
            height: arm,
            backgroundColor: '#FFFFFF',
            borderRadius: arm,
          },
        ]}
      />
      <View
        style={[
          styles.starCore,
          {width: core, height: core, borderRadius: core / 2},
        ]}
      />
    </View>
  );
}

export default function AnimatedSplash({onDone, appReady = true}) {
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const cloudLeftY = useRef(new Animated.Value(SCREEN_H * 0.18)).current;
  const cloudLeftOpacity = useRef(new Animated.Value(0)).current;
  const cloudRightY = useRef(new Animated.Value(SCREEN_H * 0.22)).current;
  const cloudRightOpacity = useRef(new Animated.Value(0)).current;

  const plane1X = useRef(new Animated.Value(PLANE1_START_X)).current;
  const plane1Y = useRef(new Animated.Value(PLANE1_START_Y)).current;
  const plane1Rotate = useRef(new Animated.Value(PLANE1_START_ROTATE)).current;
  const plane1Opacity = useRef(new Animated.Value(0)).current;

  const studentX = useRef(new Animated.Value(-SCREEN_W * 0.92)).current;
  const studentRotate = useRef(new Animated.Value(-14)).current;
  const studentOpacity = useRef(new Animated.Value(1)).current;

  const planet1Scale = useRef(new Animated.Value(0.35)).current;
  const planet1Opacity = useRef(new Animated.Value(0)).current;
  const planet2Scale = useRef(new Animated.Value(0.35)).current;
  const planet2Opacity = useRef(new Animated.Value(0)).current;

  const plane2X = useRef(new Animated.Value(PLANE2_START_X)).current;
  const plane2Y = useRef(new Animated.Value(PLANE2_START_Y)).current;
  const plane2Rotate = useRef(new Animated.Value(PLANE2_START_ROTATE)).current;
  const plane2Opacity = useRef(new Animated.Value(0)).current;

  const starTwinkleA = useRef(new Animated.Value(0.4)).current;
  const starTwinkleB = useRef(new Animated.Value(0.65)).current;
  const starTwinkleC = useRef(new Animated.Value(0.35)).current;
  const starTwinkleD = useRef(new Animated.Value(0.5)).current;
  const starPulseA = useRef(new Animated.Value(1)).current;
  const starPulseB = useRef(new Animated.Value(1)).current;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(18)).current;
  const logoScale = useRef(new Animated.Value(0.95)).current;

  const [animationDone, setAnimationDone] = useState(false);
  const timelineStartedRef = useRef(false);
  const fadeStartedRef = useRef(false);
  const revealStartedRef = useRef(false);
  const bgLoadedRef = useRef(false);
  const laidOutRef = useRef(false);
  const exitAnimRef = useRef(null);
  const timelineAnimRef = useRef(null);
  const timersRef = useRef([]);

  const fadeOut = useCallback(() => {
    if (fadeStartedRef.current) {
      return;
    }
    fadeStartedRef.current = true;

    const exit = Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 560,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    });
    exitAnimRef.current = exit;
    exit.start(({finished}) => {
      if (finished) {
        endSplashImmersive();
        onDone?.();
      }
    });
  }, [onDone, screenOpacity]);

  const startTimeline = useCallback(() => {
    if (timelineStartedRef.current) {
      return;
    }
    timelineStartedRef.current = true;

    const flightEase = Easing.bezier(0.22, 0.82, 0.28, 1);
    const swoopEase = Easing.bezier(0.18, 0.7, 0.22, 1);
    const landEase = Easing.bezier(0.2, 0.9, 0.28, 1);
    const softEase = Easing.inOut(Easing.sin);

    const leftPlaneSwoop = Animated.parallel([
      Animated.timing(plane1Opacity, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(plane1X, {
            toValue: PLANE1_END_X + 12,
            duration: 400,
            easing: swoopEase,
            useNativeDriver: true,
          }),
          Animated.timing(plane1Y, {
            toValue: 16,
            duration: 400,
            easing: swoopEase,
            useNativeDriver: true,
          }),
          Animated.timing(plane1Rotate, {
            toValue: 11,
            duration: 400,
            easing: swoopEase,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(plane1X, {
            toValue: PLANE1_END_X,
            duration: 180,
            easing: landEase,
            useNativeDriver: true,
          }),
          Animated.timing(plane1Y, {
            toValue: 0,
            duration: 180,
            easing: landEase,
            useNativeDriver: true,
          }),
          Animated.timing(plane1Rotate, {
            toValue: 0,
            duration: 180,
            easing: landEase,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    const rightPlaneSwoop = Animated.parallel([
      Animated.timing(plane2Opacity, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(plane2X, {
            toValue: -10,
            duration: 380,
            easing: swoopEase,
            useNativeDriver: true,
          }),
          Animated.timing(plane2Y, {
            toValue: 14,
            duration: 380,
            easing: swoopEase,
            useNativeDriver: true,
          }),
          Animated.timing(plane2Rotate, {
            toValue: -10,
            duration: 380,
            easing: swoopEase,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(plane2X, {
            toValue: 0,
            duration: 170,
            easing: landEase,
            useNativeDriver: true,
          }),
          Animated.timing(plane2Y, {
            toValue: 0,
            duration: 170,
            easing: landEase,
            useNativeDriver: true,
          }),
          Animated.timing(plane2Rotate, {
            toValue: 0,
            duration: 170,
            easing: landEase,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    const starLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(starTwinkleA, {
              toValue: 1,
              duration: 1100,
              easing: softEase,
              useNativeDriver: true,
            }),
            Animated.timing(starTwinkleA, {
              toValue: 0.28,
              duration: 1100,
              easing: softEase,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(starTwinkleB, {
              toValue: 0.22,
              duration: 1400,
              easing: softEase,
              useNativeDriver: true,
            }),
            Animated.timing(starTwinkleB, {
              toValue: 1,
              duration: 1400,
              easing: softEase,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(200),
            Animated.timing(starTwinkleC, {
              toValue: 1,
              duration: 1200,
              easing: softEase,
              useNativeDriver: true,
            }),
            Animated.timing(starTwinkleC, {
              toValue: 0.2,
              duration: 1200,
              easing: softEase,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(360),
            Animated.timing(starTwinkleD, {
              toValue: 0.95,
              duration: 1000,
              easing: softEase,
              useNativeDriver: true,
            }),
            Animated.timing(starTwinkleD, {
              toValue: 0.25,
              duration: 1000,
              easing: softEase,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(starPulseA, {
              toValue: 1.28,
              duration: 1100,
              easing: softEase,
              useNativeDriver: true,
            }),
            Animated.timing(starPulseA, {
              toValue: 0.88,
              duration: 1100,
              easing: softEase,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(starPulseB, {
              toValue: 0.82,
              duration: 1300,
              easing: softEase,
              useNativeDriver: true,
            }),
            Animated.timing(starPulseB, {
              toValue: 1.32,
              duration: 1300,
              easing: softEase,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

    const scene = Animated.parallel([
      Animated.parallel([
        Animated.timing(cloudLeftY, {
          toValue: 0,
          duration: 850,
          easing: flightEase,
          useNativeDriver: true,
        }),
        Animated.timing(cloudLeftOpacity, {
          toValue: 0.92,
          duration: 540,
          easing: flightEase,
          useNativeDriver: true,
        }),
        Animated.timing(cloudRightY, {
          toValue: 0,
          duration: 920,
          easing: flightEase,
          useNativeDriver: true,
        }),
        Animated.timing(cloudRightOpacity, {
          toValue: 0.88,
          duration: 580,
          easing: flightEase,
          useNativeDriver: true,
        }),
      ]),

      Animated.sequence([
        Animated.parallel([
          Animated.timing(studentX, {
            toValue: 0,
            duration: 680,
            easing: flightEase,
            useNativeDriver: true,
          }),
          Animated.timing(studentRotate, {
            toValue: 0,
            duration: 680,
            easing: flightEase,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(40),
        leftPlaneSwoop,
        Animated.delay(28),
        rightPlaneSwoop,
        Animated.delay(48),
        Animated.parallel([
          Animated.spring(planet1Scale, {
            toValue: 1,
            friction: 5.2,
            tension: 88,
            useNativeDriver: true,
          }),
          Animated.timing(planet1Opacity, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(60),
        Animated.parallel([
          Animated.spring(planet2Scale, {
            toValue: 1,
            friction: 5.2,
            tension: 88,
            useNativeDriver: true,
          }),
          Animated.timing(planet2Opacity, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(50),
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 460,
            easing: flightEase,
            useNativeDriver: true,
          }),
          Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 460,
            easing: flightEase,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 460,
            easing: flightEase,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(900),
      ]),
    ]);

    starLoop.start();
    timelineAnimRef.current = {
      stop() {
        starLoop.stop();
        scene.stop();
      },
    };
    scene.start(({finished}) => {
      if (!finished) {
        return;
      }
      setAnimationDone(true);
    });
  }, [
    cloudLeftOpacity,
    cloudLeftY,
    cloudRightOpacity,
    cloudRightY,
    logoOpacity,
    logoScale,
    logoTranslateY,
    plane1X,
    plane1Y,
    plane1Rotate,
    plane1Opacity,
    plane2X,
    plane2Y,
    plane2Rotate,
    plane2Opacity,
    planet1Opacity,
    planet1Scale,
    planet2Opacity,
    planet2Scale,
    starPulseA,
    starPulseB,
    starTwinkleA,
    starTwinkleB,
    starTwinkleC,
    starTwinkleD,
    studentRotate,
    studentX,
  ]);

  const revealJsSplash = useCallback(() => {
    if (revealStartedRef.current) {
      return;
    }
    if (!laidOutRef.current || !bgLoadedRef.current) {
      return;
    }
    revealStartedRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hideNativeSplash();
        startTimeline();
      });
    });
  }, [startTimeline]);

  const onSplashLayout = useCallback(() => {
    laidOutRef.current = true;
    revealJsSplash();
  }, [revealJsSplash]);

  const onBackgroundLoad = useCallback(() => {
    bgLoadedRef.current = true;
    revealJsSplash();
  }, [revealJsSplash]);

  useEffect(() => {
    const fallbackPaint = setTimeout(() => {
      hideNativeSplash();
      startTimeline();
    }, 1200);
    return () => clearTimeout(fallbackPaint);
  }, [startTimeline]);

  useEffect(() => {
    if (!(animationDone && appReady)) {
      return undefined;
    }
    fadeOut();
    return undefined;
  }, [animationDone, appReady, fadeOut]);

  useEffect(() => {
    const hardCap = setTimeout(fadeOut, 14000);
    return () => clearTimeout(hardCap);
  }, [fadeOut]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timelineAnimRef.current?.stop();
      exitAnimRef.current?.stop();
      screenOpacity.stopAnimation();
    };
  }, [screenOpacity]);

  const studentRotateDeg = studentRotate.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });
  const plane1RotateDeg = plane1Rotate.interpolate({
    inputRange: [-30, 30],
    outputRange: ['-30deg', '30deg'],
  });
  const plane2RotateDeg = plane2Rotate.interpolate({
    inputRange: [-30, 30],
    outputRange: ['-30deg', '30deg'],
  });

  return (
    <Animated.View
      collapsable={false}
      onLayout={onSplashLayout}
      pointerEvents="auto"
      style={[styles.root, {opacity: screenOpacity}]}>
      <Image
        source={splashBackground}
        style={styles.backgroundImage}
        resizeMode="cover"
        onLoadEnd={onBackgroundLoad}
      />
      <View style={styles.gradient}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={styles.sceneLayer} pointerEvents="none">
          <View style={styles.starsLayer} pointerEvents="none">
            <Animated.View
              style={[
                styles.starPos1,
                {opacity: starTwinkleA, transform: [{scale: starPulseA}]},
              ]}>
              <Star size={11} />
            </Animated.View>
            <Animated.View
              style={[
                styles.starPos2,
                {opacity: starTwinkleB, transform: [{scale: starPulseB}]},
              ]}>
              <Star size={9} />
            </Animated.View>
            <Animated.View style={[styles.starPos3, {opacity: starTwinkleC}]}>
              <Star size={10} />
            </Animated.View>
            <Animated.View
              style={[
                styles.starPos4,
                {opacity: starTwinkleD, transform: [{scale: starPulseA}]},
              ]}>
              <Star size={8} />
            </Animated.View>
            <Animated.View style={[styles.starPos5, {opacity: starTwinkleB}]}>
              <Star size={7} />
            </Animated.View>
            <Animated.View style={[styles.dotA, {opacity: starTwinkleC}]} />
            <Animated.View style={[styles.dotB, {opacity: starTwinkleA}]} />
            <Animated.View style={[styles.dotC, {opacity: starTwinkleD}]} />
            <Animated.View style={[styles.dotD, {opacity: starTwinkleB}]} />
            <Animated.View style={[styles.dotE, {opacity: starTwinkleA}]} />
          </View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.plane1,
              {
                opacity: plane1Opacity,
                transform: [
                  {translateX: plane1X},
                  {translateY: plane1Y},
                  {rotate: plane1RotateDeg},
                ],
              },
            ]}>
            <Image
              source={planeImage}
              style={[styles.planeImage, styles.planeFlipX]}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.student,
              {
                opacity: studentOpacity,
                transform: [{translateX: studentX}, {rotate: studentRotateDeg}],
              },
            ]}>
            <Image
              source={boyImage}
              style={styles.studentImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.planet1,
              {
                opacity: planet1Opacity,
                transform: [{scale: planet1Scale}],
              },
            ]}>
            <Image
              source={planetImage}
              style={styles.planetImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.planet2,
              {
                opacity: planet2Opacity,
                transform: [{scale: planet2Scale}],
              },
            ]}>
            <Image
              source={planet2Image}
              style={styles.planetImageSm}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.plane2,
              {
                opacity: plane2Opacity,
                transform: [
                  {translateX: plane2X},
                  {translateY: plane2Y},
                  {rotate: plane2RotateDeg},
                ],
              },
            ]}>
            <Image
              source={planeImage}
              style={styles.planeImageSm}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.logoWrap,
              {
                opacity: logoOpacity,
                transform: [{translateY: logoTranslateY}, {scale: logoScale}],
              },
            ]}>
            <View style={styles.logoClip}>
              <Image
                source={mainLogo}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logoSubtitle}>MONTESSORI ACADEMY</Text>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: '#0033C5',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  sceneLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  starsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  starBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starArm: {
    position: 'absolute',
  },
  starCore: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  starPos1: {
    position: 'absolute',
    top: SCREEN_H * 0.12,
    left: SCREEN_W * 0.1,
  },
  starPos2: {
    position: 'absolute',
    top: SCREEN_H * 0.18,
    right: SCREEN_W * 0.12,
  },
  starPos3: {
    position: 'absolute',
    top: SCREEN_H * 0.42,
    left: SCREEN_W * 0.08,
  },
  starPos4: {
    position: 'absolute',
    top: SCREEN_H * 0.28,
    right: SCREEN_W * 0.18,
  },
  starPos5: {
    position: 'absolute',
    top: SCREEN_H * 0.52,
    right: SCREEN_W * 0.28,
  },
  dotA: {
    position: 'absolute',
    top: SCREEN_H * 0.24,
    left: SCREEN_W * 0.3,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
  },
  dotB: {
    position: 'absolute',
    top: SCREEN_H * 0.36,
    right: SCREEN_W * 0.32,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  dotC: {
    position: 'absolute',
    top: SCREEN_H * 0.48,
    left: SCREEN_W * 0.22,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  dotD: {
    position: 'absolute',
    top: SCREEN_H * 0.15,
    left: SCREEN_W * 0.52,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  dotE: {
    position: 'absolute',
    top: SCREEN_H * 0.33,
    left: SCREEN_W * 0.62,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
  },
  plane1: {
    position: 'absolute',
    top: PLANE1_TOP,
    left: PLANE1_ANCHOR_LEFT,
  },
  plane2: {
    position: 'absolute',
    top: PLANE2_TOP,
    right: PLANE2_ANCHOR_RIGHT,
  },
  planeImage: {
    width: PLANE1_W,
    height: PLANE1_H,
  },
  planeFlipX: {
    transform: [{scaleX: -1}],
  },
  planeImageSm: {
    width: PLANE2_W,
    height: PLANE2_H,
  },
  planetImage: {
    width: 78,
    height: 78,
  },
  planetImageSm: {
    width: 42,
    height: 42,
  },
  student: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: SCREEN_H * 0.58,
    alignItems: 'center',
  },
  studentImage: {
    width: SCREEN_W * 0.58,
    height: SCREEN_W * 0.39,
  },
  planet1: {
    position: 'absolute',
    top: SCREEN_H * 0.46,
    right: SCREEN_W * 0.05,
  },
  planet2: {
    position: 'absolute',
    top: SCREEN_H * 0.6,
    left: SCREEN_W * 0.06,
  },
  logoWrap: {
    position: 'absolute',
    top: STATUS_TOP + SCREEN_H * 0.22,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoClip: {
    width: LOGO_W,
    height: LOGO_CLIP_H,
    overflow: 'hidden',
    alignItems: 'center',
  },
  logoImage: {
    width: LOGO_W,
    height: LOGO_FULL_H,
  },
  logoSubtitle: {
    marginTop: 6,
    color: '#FFFFFF',
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    letterSpacing: 2.4,
    textAlign: 'center',
  },
});

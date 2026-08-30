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
import fonts from '../../Assets/fonts';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');
const STATUS_TOP = StatusBar.currentHeight || 24;

const LOGO_W = SCREEN_W * 0.72;
const LOGO_FULL_H = LOGO_W * (182 / 668);
const LOGO_CLIP_H = LOGO_FULL_H * 0.66;

// Splash layout v6: nose-aligned flight + straight “fly in” settle
const SPLASH_LAYOUT_VERSION = 6;

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

const PLANE1_TOP = SCREEN_H * 0.44;
const PLANE2_TOP = SCREEN_H * 0.5;
const PLANE1_ANCHOR_LEFT = SCREEN_W * 0.1;
const PLANE2_ANCHOR_LEFT = SCREEN_W * 0.58;
// plane.png: pointed nose is bottom-left ≈ 135° in screen atan2 (Y-down)
const PLANE_NOSE_OFFSET_DEG = 135;

function unwrapHeadings(headings) {
  for (let i = 1; i < headings.length; i++) {
    while (headings[i] - headings[i - 1] > 180) {
      headings[i] -= 360;
    }
    while (headings[i] - headings[i - 1] < -180) {
      headings[i] += 360;
    }
  }
  return headings;
}

/**
 * Rotation so the pointed nose follows travel direction.
 * Left plane uses scaleX:-1 after rotate → use mirrorX.
 */
function rotationForTravel(travelDeg, mirrorX = false) {
  if (mirrorX) {
    // rotate(R) then scaleX(-1) ⇒ visual nose ≈ 180 − (R + 135) = 45 − R
    return 45 - travelDeg;
  }
  return travelDeg - PLANE_NOSE_OFFSET_DEG;
}

function headingsFromPoints(xs, ys, mirrorX = false) {
  const headings = [];
  for (let i = 0; i < xs.length; i++) {
    let dx;
    let dy;
    if (i === 0) {
      dx = xs[1] - xs[0];
      dy = ys[1] - ys[0];
    } else if (i === xs.length - 1) {
      dx = xs[i] - xs[i - 1];
      dy = ys[i] - ys[i - 1];
    } else {
      dx = xs[i + 1] - xs[i - 1];
      dy = ys[i + 1] - ys[i - 1];
    }
    if (Math.abs(dx) + Math.abs(dy) < 0.0001) {
      headings.push(i > 0 ? headings[i - 1] : 0);
    } else {
      const travelDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      headings.push(rotationForTravel(travelDeg, mirrorX));
    }
  }
  return unwrapHeadings(headings);
}

/**
 * Spiral in, then settle on a straight "flying in" approach
 * so the pointed nose ends level toward the scene.
 */
function spiralSettlePath({
  radius,
  turns,
  startAngle,
  endX = 0,
  endY = 0,
  steps = 84,
  settleRatio = 0.24,
  /** Final travel direction in degrees (0 = right, 180 = left). */
  finalTravelDeg = 0,
  mirrorX = false,
}) {
  const xs = [];
  const ys = [];
  const spiralSteps = Math.max(20, Math.floor(steps * (1 - settleRatio)));
  const settleSteps = Math.max(10, steps - spiralSteps);

  const travelRad = (finalTravelDeg * Math.PI) / 180;
  // Approach from behind the final flight direction so the nose "flies in"
  const gateDist = radius * 0.16;
  const gateX = endX - Math.cos(travelRad) * gateDist;
  const gateY = endY - Math.sin(travelRad) * gateDist;

  for (let i = 0; i <= spiralSteps; i++) {
    const t = i / spiralSteps;
    const ease = t * t * (3 - 2 * t);
    const r = radius * (1 - ease);
    const angle = startAngle + turns * Math.PI * 2 * ease;
    // Blend spiral center toward the gate so the last arc lines up with settle
    const cx = endX + (gateX - endX) * ease;
    const cy = endY + (gateY - endY) * ease;
    const spiralX = cx + r * Math.cos(angle);
    const spiralY = cy + r * Math.sin(angle);
    // Final 20% of spiral eases onto the gate point
    const ontoGate = Math.max(0, (ease - 0.8) / 0.2);
    const g = ontoGate * ontoGate * (3 - 2 * ontoGate);
    xs.push(spiralX + (gateX - spiralX) * g);
    ys.push(spiralY + (gateY - spiralY) * g);
  }

  // Straight level glide into place (nose stays pointed along travel)
  const fromX = xs[xs.length - 1];
  const fromY = ys[ys.length - 1];
  for (let i = 1; i <= settleSteps; i++) {
    const t = i / settleSteps;
    const ease = 1 - Math.pow(1 - t, 1.85);
    xs.push(fromX + (endX - fromX) * ease);
    ys.push(fromY + (endY - fromY) * ease);
  }

  const headings = headingsFromPoints(xs, ys, mirrorX);
  const settleStart = xs.length - settleSteps;
  const finalRot = rotationForTravel(finalTravelDeg, mirrorX);

  // Soften spiral heading jitter
  for (let pass = 0; pass < 2; pass++) {
    const smoothed = headings.slice();
    for (let i = 1; i < settleStart - 1; i++) {
      smoothed[i] = (headings[i - 1] + headings[i] * 2 + headings[i + 1]) / 4;
    }
    for (let i = 1; i < settleStart - 1; i++) {
      headings[i] = smoothed[i];
    }
  }

  let locked = finalRot;
  if (settleStart > 0) {
    while (locked - headings[settleStart - 1] > 180) locked -= 360;
    while (locked - headings[settleStart - 1] < -180) locked += 360;
    const blendFrom = Math.max(0, settleStart - 14);
    for (let i = blendFrom; i < settleStart; i++) {
      const u = (i - blendFrom) / Math.max(1, settleStart - blendFrom);
      const s = u * u * (3 - 2 * u);
      headings[i] = headings[i] + (locked - headings[i]) * s;
    }
  }
  for (let i = settleStart; i < headings.length; i++) {
    headings[i] = locked;
  }

  return {xs, ys, headings};
}

// Left plane (scaleX:-1): spiral from top, finish flying right into the scene.
const PLANE1_SPIRAL = spiralSettlePath({
  radius: SCREEN_W * 0.66,
  turns: 1.05,
  startAngle: -Math.PI * 0.55,
  settleRatio: 0.26,
  steps: 88,
  finalTravelDeg: 0,
  mirrorX: true,
});

// Right plane: spiral from bottom, finish flying left into the scene.
const PLANE2_SPIRAL = spiralSettlePath({
  radius: SCREEN_W * 0.7,
  turns: -1.05,
  startAngle: Math.PI * 0.55,
  settleRatio: 0.26,
  steps: 88,
  finalTravelDeg: 180,
  mirrorX: false,
});

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

  const plane1Progress = useRef(new Animated.Value(0)).current;
  const plane1Opacity = useRef(new Animated.Value(0)).current;

  const studentX = useRef(new Animated.Value(-SCREEN_W * 0.92)).current;
  const studentRotate = useRef(new Animated.Value(-12)).current;
  const studentOpacity = useRef(new Animated.Value(1)).current;

  const planet1Scale = useRef(new Animated.Value(0.45)).current;
  const planet1Opacity = useRef(new Animated.Value(0)).current;
  const planet2Scale = useRef(new Animated.Value(0.45)).current;
  const planet2Opacity = useRef(new Animated.Value(0)).current;

  const plane2Progress = useRef(new Animated.Value(0)).current;
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
      duration: 720,
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

    const flightEase = Easing.bezier(0.33, 0.0, 0.2, 1);
    const planeEase = Easing.bezier(0.37, 0.0, 0.18, 1);
    const softEase = Easing.inOut(Easing.sin);

    const timeline = Animated.parallel([
      Animated.loop(
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
      ),

      Animated.parallel([
        Animated.timing(cloudLeftY, {
          toValue: 0,
          duration: 1700,
          easing: flightEase,
          useNativeDriver: true,
        }),
        Animated.timing(cloudLeftOpacity, {
          toValue: 0.92,
          duration: 1100,
          easing: flightEase,
          useNativeDriver: true,
        }),
        Animated.timing(cloudRightY, {
          toValue: 0,
          duration: 1850,
          easing: flightEase,
          useNativeDriver: true,
        }),
        Animated.timing(cloudRightOpacity, {
          toValue: 0.88,
          duration: 1200,
          easing: flightEase,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(plane1Opacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(plane1Progress, {
          toValue: 1,
          duration: 4600,
          easing: planeEase,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(380),
          Animated.parallel([
            Animated.timing(plane2Opacity, {
              toValue: 1,
              duration: 420,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(plane2Progress, {
              toValue: 1,
              duration: 4600,
              easing: planeEase,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),

      Animated.sequence([
        Animated.delay(280),
        Animated.parallel([
          Animated.timing(studentX, {
            toValue: 0,
            duration: 1600,
            easing: flightEase,
            useNativeDriver: true,
          }),
          Animated.timing(studentRotate, {
            toValue: 0,
            duration: 1600,
            easing: flightEase,
            useNativeDriver: true,
          }),
        ]),
      ]),

      Animated.sequence([
        Animated.delay(780),
        Animated.parallel([
          Animated.spring(planet1Scale, {
            toValue: 1,
            friction: 5.5,
            tension: 58,
            useNativeDriver: true,
          }),
          Animated.timing(planet1Opacity, {
            toValue: 1,
            duration: 640,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),

      Animated.sequence([
        Animated.delay(980),
        Animated.parallel([
          Animated.spring(planet2Scale, {
            toValue: 1,
            friction: 5.5,
            tension: 58,
            useNativeDriver: true,
          }),
          Animated.timing(planet2Opacity, {
            toValue: 1,
            duration: 640,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),

      Animated.sequence([
        Animated.delay(1680),
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 900,
            easing: flightEase,
            useNativeDriver: true,
          }),
          Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 900,
            easing: flightEase,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 900,
            easing: flightEase,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    timelineAnimRef.current = timeline;
    timeline.start();

    const holdDone = setTimeout(() => {
      setAnimationDone(true);
    }, 5600);
    timersRef.current.push(holdDone);
  }, [
    cloudLeftOpacity,
    cloudLeftY,
    cloudRightOpacity,
    cloudRightY,
    logoOpacity,
    logoScale,
    logoTranslateY,
    plane1Opacity,
    plane1Progress,
    plane2Opacity,
    plane2Progress,
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

  const plane1ProgressRange = PLANE1_SPIRAL.xs.map(
    (_, i) => i / (PLANE1_SPIRAL.xs.length - 1),
  );
  const plane2ProgressRange = PLANE2_SPIRAL.xs.map(
    (_, i) => i / (PLANE2_SPIRAL.xs.length - 1),
  );
  const plane1X = plane1Progress.interpolate({
    inputRange: plane1ProgressRange,
    outputRange: PLANE1_SPIRAL.xs,
  });
  const plane1Y = plane1Progress.interpolate({
    inputRange: plane1ProgressRange,
    outputRange: PLANE1_SPIRAL.ys,
  });
  const plane1RotateDeg = plane1Progress.interpolate({
    inputRange: plane1ProgressRange,
    outputRange: PLANE1_SPIRAL.headings.map(deg => `${deg}deg`),
  });
  const plane2X = plane2Progress.interpolate({
    inputRange: plane2ProgressRange,
    outputRange: PLANE2_SPIRAL.xs,
  });
  const plane2Y = plane2Progress.interpolate({
    inputRange: plane2ProgressRange,
    outputRange: PLANE2_SPIRAL.ys,
  });
  const plane2RotateDeg = plane2Progress.interpolate({
    inputRange: plane2ProgressRange,
    outputRange: PLANE2_SPIRAL.headings.map(deg => `${deg}deg`),
  });
  const studentRotateDeg = studentRotate.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
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
                  {scaleX: -1},
                ],
              },
            ]}>
            <Image
              source={planeImage}
              style={styles.planeImage}
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
              source={planetImage}
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
    left: PLANE2_ANCHOR_LEFT,
  },
  planeImage: {
    width: 58,
    height: 58,
  },
  planeImageSm: {
    width: 36,
    height: 36,
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

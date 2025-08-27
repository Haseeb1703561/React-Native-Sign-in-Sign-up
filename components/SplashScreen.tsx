import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

// Animated loading dots component
function LoadingDots() {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    const animateDots = () => {
      dot1Opacity.value = withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.3, { duration: 500 })
      );
      
      setTimeout(() => {
        dot2Opacity.value = withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        );
      }, 200);
      
      setTimeout(() => {
        dot3Opacity.value = withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        );
      }, 400);
    };

    animateDots();
    const interval = setInterval(animateDots, 1500);
    return () => clearInterval(interval);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingDot, dot1Style]} />
      <Animated.View style={[styles.loadingDot, dot2Style]} />
      <Animated.View style={[styles.loadingDot, dot3Style]} />
    </View>
  );
}

// Floating bubble background element
interface FloatingBubbleProps {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  delay?: number;
  duration?: number;
}

function FloatingBubble({
  size,
  color,
  initialX,
  initialY,
  delay = 0,
  duration = 4000,
}: FloatingBubbleProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.5);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-12, { duration, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    translateX.value = withDelay(
      delay + 200,
      withRepeat(
        withSequence(
          withTiming(8, { duration: Math.max(1200, duration * 0.8), easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: Math.max(1200, duration * 0.8), easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.06, { duration: Math.max(1200, duration * 0.9) }),
          withTiming(0.96, { duration: Math.max(1200, duration * 0.9) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration }),
          withTiming(0.35, { duration })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: initialY,
          left: initialX,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: 0.5,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
        animStyle,
      ]}
    />
  );
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const containerOpacity = useSharedValue(1);
  const logoRotation = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.7);
  const beamTranslateX = useSharedValue(-width);

  useEffect(() => {
    // Logo animation sequence - using simpler animations
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 800 }),
      withTiming(1, { duration: 200 })
    );

    logoOpacity.value = withTiming(1, { duration: 800 });

    // Subtle rotation for the brain
    logoRotation.value = withSequence(
      withTiming(5, { duration: 1000 }),
      withTiming(-2, { duration: 800 }),
      withTiming(0, { duration: 600 })
    );

    // Text animation with delay
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(600, withTiming(0, { duration: 800 }));

    // Glow pulse around logo
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1400, easing: Easing.out(Easing.quad) }),
        withTiming(0.98, { duration: 1600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1400 }),
        withTiming(0.6, { duration: 1600 })
      ),
      -1,
      true
    );

    // Light beam sweep
    beamTranslateX.value = withRepeat(
      withSequence(
        withTiming(width * 1.4, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
        withTiming(-width * 0.6, { duration: 0 })
      ),
      -1,
      false
    );

    // Exit animation
    const exitTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onFinish)();
      });
    }, 3000);

    return () => clearTimeout(exitTimer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` }
    ],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const beamAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: beamTranslateX.value }, { rotate: '25deg' }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated background elements */}
        <FloatingBubble size={140} color="rgba(15, 52, 96, 0.18)" initialX={width * 0.12} initialY={height * 0.2} />
        <FloatingBubble size={100} color="rgba(22, 33, 62, 0.16)" initialX={width * 0.75} initialY={height * 0.18} delay={300} />
        <FloatingBubble size={160} color="rgba(10, 37, 64, 0.14)" initialX={width * 0.65} initialY={height * 0.65} delay={600} />
        <FloatingBubble size={120} color="rgba(26, 26, 46, 0.14)" initialX={width * 0.25} initialY={height * 0.75} delay={900} />

        <Animated.View pointerEvents="none" style={[styles.lightBeamContainer, beamAnimatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.08)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* Main content */}
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Image
              source={require('../assets/images/ai-tutor-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
            <Text style={styles.title}>AI Tutor</Text>
          </Animated.View>
        </View>

        {/* Loading indicator */}
        <LoadingDots />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 100,
    right: 50,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 150,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: 200,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  logoGlow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(15, 52, 96, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: -1,
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 18,
  },
  logo: {
    width: 150,
    height: 150,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
    maxWidth: width * 0.8,
    lineHeight: 22,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 4,
  },
  lightBeamContainer: {
    position: 'absolute',
    top: -height * 0.2,
    left: -200,
    width: 140,
    height: height * 1.6,
    zIndex: 1,
  },
});

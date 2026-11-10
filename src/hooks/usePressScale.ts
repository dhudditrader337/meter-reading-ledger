import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { SPRING_PRESS } from '../constants/config';

/**
 * Press feedback helper (rule #8): the <Pressable> stays the PARENT and drives
 * these callbacks, the <Animated.View> lives INSIDE it. An Animated.View with a
 * native-driver scale wrapping a Pressable eats onPress on Android release.
 *
 * Only `transform` is animated, so useNativeDriver stays true.
 */
export function usePressScale(
  pressedScale = 0.96,
  spring: { tension: number; friction: number } = SPRING_PRESS,
) {
  const scale = useRef(new Animated.Value(1)).current;
  const config = useRef(spring).current;
  const target = useRef(pressedScale).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: target,
      tension: config.tension,
      friction: config.friction,
      useNativeDriver: true,
    }).start();
  }, [scale, config, target]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: config.tension,
      friction: config.friction,
      useNativeDriver: true,
    }).start();
  }, [scale, config]);

  return { scale, onPressIn, onPressOut };
}

export default usePressScale;

import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import {
  ODOMETER_DIGIT_MS,
  ODOMETER_STAGGER_MS,
} from '../constants/config';

/**
 * The signature mechanical digit roll: each cell slides in from -cellHeight
 * with a 40ms stagger. Transform + opacity only — useNativeDriver stays true.
 *
 * The pool grows on demand so switching to a meter with more decimals can
 * never index past the end of the array.
 */
export function useOdometer(cellCount: number, enabled: boolean) {
  const pool = useRef<Animated.Value[]>([]);
  const running = useRef<Animated.CompositeAnimation | null>(null);

  while (pool.current.length < cellCount) {
    pool.current.push(new Animated.Value(1));
  }
  const progress = pool.current;

  const roll = useCallback(() => {
    const cells = progress.slice(0, cellCount);
    if (!enabled) {
      cells.forEach(v => v.setValue(1));
      return;
    }
    if (running.current) {
      running.current.stop();
    }
    cells.forEach(v => v.setValue(0));
    running.current = Animated.stagger(
      ODOMETER_STAGGER_MS,
      cells.map(v =>
        Animated.timing(v, {
          toValue: 1,
          duration: ODOMETER_DIGIT_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    );
    running.current.start();
  }, [cellCount, enabled, progress]);

  useEffect(() => {
    return () => {
      if (running.current) {
        running.current.stop();
      }
    };
  }, []);

  return { progress, roll };
}

export default useOdometer;

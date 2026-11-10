import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { C } from './src/constants/theme';
import { SCREEN_TRANSITION_MS, SCREEN_W } from './src/constants/config';
import { Meter } from './src/game/ledger';
import { useLedger, SaveResult } from './src/hooks/useLedger';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ChartScreen } from './src/screens/ChartScreen';
import { AddMeterScreen } from './src/screens/AddMeterScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'gameover'
  | 'history'
  | 'chart'
  | 'addmeter'
  | 'settings';

type Transition = 'fade' | 'slide';

const TRANSITIONS: Record<Screen, Transition> = {
  loader: 'fade',
  menu: 'fade',
  game: 'slide',
  gameover: 'fade',
  history: 'slide',
  chart: 'slide',
  addmeter: 'slide',
  settings: 'slide',
};

/**
 * Screen transition wrapper. Only opacity and translateX are animated, so the
 * native driver stays valid. pointerEvents="box-none" is mandatory — an
 * Animated.View that wraps Pressables and claims touches itself swallows every
 * onPress on an Android release build.
 */
function ScreenFrame({
  screenKey,
  transition,
  children,
}: {
  screenKey: string;
  transition: Transition;
  children: React.ReactNode;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: SCREEN_TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [progress, screenKey]);

  const animatedStyle =
    transition === 'slide'
      ? {
          opacity: progress,
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [SCREEN_W, 0],
              }),
            },
          ],
        }
      : { opacity: progress };

  return (
    <Animated.View pointerEvents="box-none" style={[styles.frame, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export default function App() {
  const ledger = useLedger();
  const { meters, readings, settings } = ledger;

  const [screen, setScreen] = useState<Screen>('loader');
  const [activeMeterId, setActiveMeterId] = useState<string>('');
  const [lastResult, setLastResult] = useState<SaveResult | null>(null);

  const activeMeter = useMemo<Meter | undefined>(
    () => meters.find(m => m.id === activeMeterId) ?? meters[0],
    [meters, activeMeterId],
  );

  /* ---- navigation ---- */

  const goMenu = useCallback(() => setScreen('menu'), []);
  const goHistory = useCallback(() => setScreen('history'), []);
  const goChart = useCallback(() => setScreen('chart'), []);
  const goAddMeter = useCallback(() => setScreen('addmeter'), []);
  const goSettings = useCallback(() => setScreen('settings'), []);

  const openMeter = useCallback((meterId: string) => {
    setActiveMeterId(meterId);
    setScreen('game');
  }, []);

  const logAgain = useCallback(() => setScreen('game'), []);

  const handleSave = useCallback(
    (value: number, isReset: boolean, hasPhoto: boolean) => {
      const target = activeMeter;
      if (!target) {
        setScreen('menu');
        return;
      }
      const result = ledger.saveReading(target.id, value, isReset, hasPhoto);
      setLastResult(result);
      setScreen('gameover');
    },
    [activeMeter, ledger],
  );

  const handleAddMeter = useCallback(
    (meter: Omit<Meter, 'id'>) => {
      const id = ledger.addMeter(meter);
      setActiveMeterId(id);
      setScreen('menu');
    },
    [ledger],
  );

  /* ---- Android hardware back button ---- */

  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const current = screenRef.current;
        if (current === 'loader' || current === 'menu') {
          return false;
        }
        setScreen('menu');
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  /* ---- render ---- */

  const renderScreen = () => {
    switch (screen) {
      case 'loader':
        return <LoaderScreen onDone={goMenu} />;

      case 'game':
        return activeMeter ? (
          <GameScreen
            meter={activeMeter}
            readings={readings}
            settings={settings}
            onBack={goMenu}
            onCancel={goMenu}
            onSave={handleSave}
          />
        ) : null;

      case 'gameover':
        return activeMeter && lastResult ? (
          <GameOverScreen
            meter={activeMeter}
            result={lastResult}
            settings={settings}
            onLogAgain={logAgain}
            onMenu={goMenu}
            onHistory={goHistory}
          />
        ) : null;

      case 'history':
        return (
          <HistoryScreen
            meters={meters}
            readings={readings}
            activeMeterId={activeMeter ? activeMeter.id : ''}
            onSelectMeter={setActiveMeterId}
            onBack={goMenu}
            onAddReading={logAgain}
          />
        );

      case 'chart':
        return (
          <ChartScreen
            meters={meters}
            readings={readings}
            settings={settings}
            activeMeterId={activeMeter ? activeMeter.id : ''}
            onSelectMeter={setActiveMeterId}
            onBack={goMenu}
          />
        );

      case 'addmeter':
        return <AddMeterScreen onCancel={goMenu} onSave={handleAddMeter} />;

      case 'settings':
        return (
          <SettingsScreen
            meters={meters}
            settings={settings}
            onBack={goMenu}
            onUpdateSettings={ledger.updateSettings}
            onSetRate={ledger.setRate}
            onExport={ledger.runExport}
            onImport={ledger.runImport}
          />
        );

      case 'menu':
      default:
        return (
          <MenuScreen
            meters={meters}
            readings={readings}
            settings={settings}
            onOpenMeter={openMeter}
            onAddMeter={goAddMeter}
            onHistory={goHistory}
            onCharts={goChart}
            onSettings={goSettings}
          />
        );
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScreenFrame screenKey={screen} transition={TRANSITIONS[screen]}>
        {renderScreen()}
      </ScreenFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },
  frame: { flex: 1 },
});

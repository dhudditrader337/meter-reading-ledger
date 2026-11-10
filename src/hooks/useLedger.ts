import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Meter,
  Reading,
  appendReading,
  computeDelta,
  daysBetween,
  lastReading,
  nextId,
  perDay,
} from '../game/ledger';
import { LedgerSettings, SEED_METERS, SEED_SETTINGS, buildSeedReadings } from '../game/seed';
import {
  exportBackup,
  importBackup,
  readSnapshot,
  writeSnapshot,
} from '../game/storage';

export type SaveResult = {
  readingId: string;
  meterId: string;
  value: number;
  delta: number;
  days: number;
  perDay: number;
  dateIso: string;
  isReset: boolean;
  hasPhoto: boolean;
};

/**
 * The single owner of the ledger state. App.tsx holds one instance and hands
 * each screen only the slices it needs — no screen subscribes to everything
 * (react-state-minimize).
 */
export function useLedger() {
  const bootstrapped = useRef(false);
  if (!bootstrapped.current) {
    bootstrapped.current = true;
    const existing = readSnapshot();
    if (!existing) {
      writeSnapshot(SEED_METERS, buildSeedReadings(new Date()), SEED_SETTINGS);
    }
  }

  const initial = readSnapshot();
  const [meters, setMeters] = useState<Meter[]>(initial ? initial.meters : SEED_METERS);
  const [readings, setReadings] = useState<Reading[]>(
    initial ? initial.readings : [],
  );
  const [settings, setSettings] = useState<LedgerSettings>(
    initial ? initial.settings : SEED_SETTINGS,
  );

  const persist = useCallback(
    (m: Meter[], r: Reading[], s: LedgerSettings) => {
      writeSnapshot(m, r, s);
    },
    [],
  );

  const saveReading = useCallback(
    (meterId: string, value: number, isReset: boolean, hasPhoto: boolean): SaveResult => {
      const meter = meters.find(m => m.id === meterId);
      const decimals = meter ? meter.decimals : 0;
      const prev = lastReading(readings, meterId);
      const dateIso = new Date().toISOString();
      const delta = computeDelta(value, prev?.value, isReset);
      const days = prev ? daysBetween(prev.dateIso, dateIso) : 1;
      const reading: Reading = {
        id: nextId('r'),
        meterId,
        value,
        dateIso,
        hasPhoto,
        isReset,
      };
      const next = appendReading(readings, reading);
      setReadings(next);
      persist(meters, next, settings);
      const factor = Math.pow(10, decimals);
      return {
        readingId: reading.id,
        meterId,
        value,
        delta: Math.round(delta * factor) / factor,
        days,
        perDay: Math.round(perDay(delta, days) * factor) / factor,
        dateIso,
        isReset,
        hasPhoto,
      };
    },
    [meters, readings, settings, persist],
  );

  const addMeter = useCallback(
    (meter: Omit<Meter, 'id'>): string => {
      const id = nextId('m');
      const next = meters.concat({ ...meter, id });
      setMeters(next);
      persist(next, readings, settings);
      return id;
    },
    [meters, readings, settings, persist],
  );

  const setRate = useCallback(
    (meterId: string, rate: number | undefined) => {
      const next = meters.map(m => (m.id === meterId ? { ...m, rate } : m));
      setMeters(next);
      persist(next, readings, settings);
    },
    [meters, readings, settings, persist],
  );

  const updateSettings = useCallback(
    (patch: Partial<LedgerSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      persist(meters, readings, next);
    },
    [meters, readings, settings, persist],
  );

  const runExport = useCallback(() => {
    persist(meters, readings, settings);
    return exportBackup();
  }, [meters, readings, settings, persist]);

  const runImport = useCallback(() => {
    const snap = importBackup();
    if (!snap) {
      return false;
    }
    setMeters(snap.meters);
    setReadings(snap.readings);
    setSettings(snap.settings);
    return true;
  }, []);

  return useMemo(
    () => ({
      meters,
      readings,
      settings,
      saveReading,
      addMeter,
      setRate,
      updateSettings,
      runExport,
      runImport,
    }),
    [
      meters,
      readings,
      settings,
      saveReading,
      addMeter,
      setRate,
      updateSettings,
      runExport,
      runImport,
    ],
  );
}

export default useLedger;

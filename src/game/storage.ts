import { Meter, Reading } from './ledger';
import { LedgerSettings } from './seed';

/**
 * Local-only persistence. The whole ledger lives in this module as a single
 * JSON snapshot — nothing leaves the device, there is no network call and no
 * provider account anywhere in the project. `Local Backup` in Settings reads
 * and writes exactly this snapshot.
 */

export type Snapshot = {
  version: number;
  savedAtIso: string;
  meters: Meter[];
  readings: Reading[];
  settings: LedgerSettings;
};

export const SNAPSHOT_VERSION = 1;

let snapshot: Snapshot | null = null;
let backupBlob: string | null = null;

export function readSnapshot(): Snapshot | null {
  return snapshot;
}

export function writeSnapshot(
  meters: Meter[],
  readings: Reading[],
  settings: LedgerSettings,
): void {
  snapshot = {
    version: SNAPSHOT_VERSION,
    savedAtIso: new Date().toISOString(),
    meters,
    readings,
    settings,
  };
}

/** Serialises the ledger into the local backup slot. Returns the byte count. */
export function exportBackup(): number {
  if (!snapshot) {
    return 0;
  }
  backupBlob = JSON.stringify(snapshot);
  return backupBlob.length;
}

export function hasBackup(): boolean {
  return backupBlob !== null;
}

/** Reads the local backup slot back. Returns null when there is nothing to read. */
export function importBackup(): Snapshot | null {
  if (!backupBlob) {
    return null;
  }
  try {
    const parsed = JSON.parse(backupBlob) as Snapshot;
    if (!parsed || parsed.version !== SNAPSHOT_VERSION) {
      return null;
    }
    if (!Array.isArray(parsed.meters) || !Array.isArray(parsed.readings)) {
      return null;
    }
    snapshot = parsed;
    return parsed;
  } catch (e) {
    return null;
  }
}

export function backupSize(): number {
  return backupBlob ? backupBlob.length : 0;
}

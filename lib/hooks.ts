import { useEffect, useState, useSyncExternalStore } from 'react';
import { APP_DATA_UPDATED_EVENT, APP_SYNC_STATUS_EVENT } from './appData';
import { type CloudSyncStatus, getCloudSyncStatus } from './storage';

/**
 * Returns false on the server (SSR) and true on the client after hydration.
 * Uses useSyncExternalStore so no setState is needed inside useEffect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},  // subscribe: no-op, this value never changes
    () => true,      // getSnapshot: always true on the client
    () => false      // getServerSnapshot: always false on the server
  );
}

/**
 * Returns a value that automatically refreshes whenever CoopKeeper data changes.
 */
export function useSyncedStorageValue<T>(getValue: () => T): T {
  const [value, setValue] = useState<T>(() => getValue());

  useEffect(() => {
    const refresh = () => setValue(getValue());

    refresh();
    window.addEventListener(APP_DATA_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener(APP_DATA_UPDATED_EVENT, refresh);
    };
  }, [getValue]);

  return value;
}

/**
 * Returns cloud sync status updates so sync failures are visible to users.
 */
export function useCloudSyncStatus(): CloudSyncStatus {
  const [status, setStatus] = useState<CloudSyncStatus>(() => getCloudSyncStatus());

  useEffect(() => {
    const refresh = () => setStatus(getCloudSyncStatus());

    refresh();
    window.addEventListener(APP_SYNC_STATUS_EVENT, refresh);

    return () => {
      window.removeEventListener(APP_SYNC_STATUS_EVENT, refresh);
    };
  }, []);

  return status;
}

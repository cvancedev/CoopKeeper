import { useSyncExternalStore } from 'react';

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

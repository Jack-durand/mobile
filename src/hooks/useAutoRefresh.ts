import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { syncSite } from '../api';

const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

type UseAutoRefreshOptions = {
  siteId: string;
  onRefresh: () => Promise<void>;
};

export const useAutoRefresh = ({ siteId, onRefresh }: UseAutoRefreshOptions) => {
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Format "X minutes ago" display
  const getLastUpdatedText = useCallback(() => {
    if (!lastRefreshTime) return null;
    const now = new Date();
    const diffMs = now.getTime() - lastRefreshTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Last updated: just now';
    if (diffMins === 1) return 'Last updated: 1 minute ago';
    return `Last updated: ${diffMins} minutes ago`;
  }, [lastRefreshTime]);

  // Perform refresh and update timestamp
  const doRefresh = useCallback(async () => {
    await onRefresh();
    setLastRefreshTime(new Date());
  }, [onRefresh]);

  // Manual sync button handler
  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await syncSite(siteId);
      await doRefresh();
    } finally {
      setSyncing(false);
    }
  }, [siteId, doRefresh]);

  // Start polling interval
  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      doRefresh();
    }, POLL_INTERVAL_MS);
  }, [doRefresh]);

  // Stop polling interval
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App coming to foreground - refresh immediately and restart polling
        doRefresh();
        startPolling();
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background - pause polling
        stopPolling();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [doRefresh, startPolling, stopPolling]);

  // Initial load and start polling
  useEffect(() => {
    doRefresh();
    startPolling();

    return () => {
      stopPolling();
    };
  }, [doRefresh, startPolling, stopPolling]);

  return {
    lastRefreshTime,
    getLastUpdatedText,
    handleSync,
    syncing,
  };
};

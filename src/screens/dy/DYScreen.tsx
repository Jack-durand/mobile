import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, AppState } from 'react-native';
import { PricePanel } from '../../components/PricePanel';
import { fetchPrices, fetchAnalysis, fetchTank, syncSite, apiBase, TankResponse } from '../../api';
import { MarketAnalysis } from '../../components/MarketAnalysis';
import { TankMonitor } from '../../components/TankMonitor';

const SITE_ID = 'holiday-3851';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const DYScreen = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<string>('');
  const [grades, setGrades] = useState(
    [
      { label: '87', price: '$--', status: 'loading' as const },
      { label: 'Mid', price: '$--', status: 'loading' as const },
      { label: 'Premium', price: '$--', status: 'loading' as const },
      { label: 'Diesel', price: '$--', status: 'loading' as const },
    ].map((g) => ({ ...g }))
  );
  const [analysis, setAnalysis] = useState<any>(null);
  const [tankData, setTankData] = useState<TankResponse | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);

  const load = useCallback(async (isManualSync = false) => {
    if (isManualSync) {
      setSyncing(true);
    } else {
      setLoading(true);
    }

    try {
      const [prices, analysisData, tankInfo] = await Promise.all([
        fetchPrices('holiday-3851'),
        fetchAnalysis('holiday-3851'),
        fetchTank('inout-743-century'),
      ]);

      if (prices?.grades?.length) {
        setGrades(
          prices.grades.map((g) => ({
            label: g.label,
            price: g.price ? `$${g.price.toFixed(2)}` : '$--',
            status: (g.status as any) ?? 'good',
            source: g.source,
          }))
        );
        setLastUpdated(new Date(prices.lastUpdated));
        setSource(prices.source || 'unknown');
      }

      if (analysisData) {
        setAnalysis(analysisData);
      }

      if (tankInfo) {
        setTankData(tankInfo);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh every 10 minutes while app is active
  useEffect(() => {
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        console.log('Auto-refreshing Holiday data...');
        load();
      }, REFRESH_INTERVAL);
    };

    const handleAppStateChange = (nextAppState: string) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App came to foreground, refreshing Holiday data...');
        load();
        startPolling();
      } else if (nextAppState.match(/inactive|background/)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
      appState.current = nextAppState as any;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    startPolling();

    return () => {
      subscription.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncSite('holiday-3851');
      await load(true);
    } finally {
      setSyncing(false);
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.title}>DY Holdings LLC</Text>
      <Text style={styles.subtitle}>Holiday 3851 - Lakeville</Text>
      <Text style={styles.address}>16255 Ipava Ave, Lakeville, MN 55044</Text>

      {/* Sync button with last updated */}
      <TouchableOpacity
        style={[styles.syncButton, syncing && styles.syncButtonActive]}
        activeOpacity={0.7}
        onPress={handleSync}
        disabled={syncing}
      >
        {syncing ? (
          <ActivityIndicator color="#f97316" size="small" />
        ) : (
          <>
            <Text style={styles.syncLabel}>Sync Now</Text>
            <Text style={styles.syncTime}>Updated: {formatLastUpdated()}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Source indicator */}
      <View style={styles.sourceRow}>
        <View style={[styles.sourceDot, { backgroundColor: source.includes('live') ? '#22c55e' : '#eab308' }]} />
        <Text style={styles.sourceText}>
          {source.includes('live') ? 'Live data' : 'Cached data'}
        </Text>
      </View>

      {loading && <ActivityIndicator color="#f97316" style={{ marginTop: 12 }} />}

      {/* Price panels */}
      <PricePanel
        title="Current Fuel Prices"
        grades={grades}
        accentColor="#f97316"
        lastUpdated={lastUpdated?.toLocaleTimeString()}
      />

      {/* Market analysis with integrated strategy dropdown */}
      <MarketAnalysis
        siteId={SITE_ID}
        strategy={analysis?.strategy}
        color={analysis?.color}
        recommendation={analysis?.recommendation}
        competitors={analysis?.competitors}
        stats={analysis?.stats}
        accentColor="#f97316"
        onStrategyChange={() => load()}
      />

      {/* Tank monitoring */}
      <TankMonitor data={tankData} accentColor="#f97316" />

      {/* API info (dev) */}
      <Text style={styles.apiInfo}>API: {apiBase}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f97316',
    marginTop: 60,
  },
  subtitle: {
    fontSize: 18,
    color: '#e5e7eb',
    marginTop: 4,
    fontWeight: '600',
  },
  address: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  syncButton: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f97316',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncButtonActive: {
    justifyContent: 'center',
  },
  syncLabel: {
    color: '#f97316',
    fontWeight: '700',
    fontSize: 15,
  },
  syncTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  sourceText: {
    color: '#64748b',
    fontSize: 12,
  },
  apiInfo: {
    marginTop: 20,
    color: '#475569',
    fontSize: 10,
    textAlign: 'center',
  },
});

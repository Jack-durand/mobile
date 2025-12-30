import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { PricePanel } from '../../components/PricePanel';
import { fetchPrices, fetchAnalysis, fetchTank } from '../../api';
import { MarketAnalysis } from '../../components/MarketAnalysis';
import { TankMonitor } from '../../components/TankMonitor';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

const SITE_ID = 'inout-743-century';

export const JRDScreen = () => {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [grades, setGrades] = useState(
    [
      { label: '87', price: '$--', status: 'loading' as const },
      { label: 'Mid', price: '$--', status: 'loading' as const },
      { label: 'Premium', price: '$--', status: 'loading' as const },
      { label: 'E85', price: '$--', status: 'loading' as const },
    ].map((g) => ({ ...g }))
  );
  const [analysisText, setAnalysisText] = useState('Loading market analysis...');
  const [analysis, setAnalysis] = useState<any>(null);
  const [tank, setTank] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const prices = await fetchPrices(SITE_ID);
    const analysisRes = await fetchAnalysis(SITE_ID);
    const tankRes = await fetchTank(SITE_ID);

    if (prices?.grades?.length) {
      setGrades(
        prices.grades.map((g) => ({
          label: g.label,
          price: g.price ? `$${g.price.toFixed(2)}` : '$--',
          status: (g.status as any) ?? 'good',
          source: g.source,
          updatedAt: new Date(prices.lastUpdated).toLocaleTimeString(),
        }))
      );
      setLastUpdated(new Date(prices.lastUpdated).toLocaleTimeString());
    } else {
      setGrades((prev) =>
        prev.map((g) => ({
          ...g,
          price: '$--',
          status: 'loading',
        }))
      );
      setLastUpdated(undefined);
    }

    if (analysisRes) {
      setAnalysisText(`${analysisRes.strategy}: ${analysisRes.recommendation}`);
      setAnalysis(analysisRes);
    } else {
      setAnalysisText('Market analysis unavailable (mock API not reachable).');
      setAnalysis(null);
    }
    setTank(tankRes);
    setLoading(false);
  }, []);

  const { getLastUpdatedText, handleSync, syncing } = useAutoRefresh({
    siteId: SITE_ID,
    onRefresh: load,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JRD Companies Maplewood</Text>
      <Text style={styles.subtitle}>In-N-Out Market</Text>
      <TouchableOpacity style={styles.syncButton} activeOpacity={0.85} onPress={handleSync} disabled={syncing}>
        <Text style={styles.syncLabel}>{syncing ? 'Syncing...' : 'Sync'}</Text>
      </TouchableOpacity>
      {(loading || syncing) ? <ActivityIndicator color="#22c55e" style={{ marginTop: 12 }} /> : null}
      {getLastUpdatedText() && (
        <Text style={styles.lastUpdatedText}>{getLastUpdatedText()}</Text>
      )}
      <PricePanel
        title="Current Grades"
        grades={grades}
        accentColor="#22c55e"
        lastUpdated={lastUpdated}
      />
      <MarketAnalysis
        siteId={SITE_ID}
        strategy={analysis?.strategy}
        color={analysis?.color}
        recommendation={analysis?.recommendation ?? analysisText}
        competitors={analysis?.competitors}
        stats={analysis?.stats}
        accentColor="#22c55e"
        onStrategyChange={() => load()}
      />
      <TankMonitor data={tank} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22c55e',
    marginTop: 60,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
    alignItems: 'center',
  },
  syncLabel: {
    color: '#22c55e',
    fontWeight: '700',
  },
  lastUpdatedText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f3f4f6',
    marginBottom: 6,
  },
});

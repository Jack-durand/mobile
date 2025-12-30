import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchAnalysis, fetchServices } from '../../api';
import { MarketAnalysis } from '../../components/MarketAnalysis';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

const SITE_ID = 'auto-2727';

export const AutoScreen = () => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisText, setAnalysisText] = useState('Loading market analysis...');
  const [services, setServices] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const analysisRes = await fetchAnalysis(SITE_ID);
    const svc = await fetchServices(SITE_ID);
    if (analysisRes) {
      setAnalysis(analysisRes);
      setAnalysisText(`${analysisRes.strategy}: ${analysisRes.recommendation}`);
    } else {
      setAnalysis(null);
      setAnalysisText('Market analysis unavailable (mock API not reachable).');
    }
    setServices(svc);
    setLoading(false);
  }, []);

  const { getLastUpdatedText, handleSync, syncing } = useAutoRefresh({
    siteId: SITE_ID,
    onRefresh: load,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JRD Auto Maplewood</Text>
      <Text style={styles.subtitle}>Durand Automotive</Text>
      <TouchableOpacity style={styles.syncButton} activeOpacity={0.85} onPress={handleSync} disabled={syncing}>
        <Text style={styles.syncLabel}>{syncing ? 'Syncing...' : 'Sync'}</Text>
      </TouchableOpacity>
      {(loading || syncing) ? <ActivityIndicator color="#3b82f6" style={{ marginTop: 12 }} /> : null}
      {getLastUpdatedText() && (
        <Text style={styles.lastUpdatedText}>{getLastUpdatedText()}</Text>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service pricing</Text>
        <Text style={styles.text}>Labor/hr: ${services?.laborPerHour ?? '--'}</Text>
        <Text style={styles.text}>Oil change: ${services?.oilChange ?? '--'}</Text>
        <Text style={styles.text}>Tires set: ${services?.tires ?? '--'}</Text>
        {services?.rating ? <Text style={styles.text}>Rating: {services.rating}</Text> : null}
      </View>
      <MarketAnalysis
        siteId={SITE_ID}
        strategy={analysis?.strategy}
        color={analysis?.color}
        recommendation={analysis?.recommendation ?? analysisText}
        competitors={analysis?.competitors}
        stats={analysis?.stats}
        accentColor="#3b82f6"
        onStrategyChange={() => load()}
      />
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
    color: '#3b82f6',
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
    borderColor: '#3b82f6',
    alignItems: 'center',
  },
  syncLabel: {
    color: '#3b82f6',
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

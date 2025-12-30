import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { setStrategy } from '../api';

type Strategy = 'Match' | 'Premium' | 'Undercut';

type Competitor = {
  name: string;
  distanceMi: number;
  price: number | null;
  delta?: number | null;
};

type Stats = {
  ourPrice?: number;
  compAvg?: number | null;
  compMin?: number | null;
  compMax?: number | null;
  margin?: string | null;
  wholesalePrice?: number;
  wholesaleSource?: string;
  wholesaleParsedAt?: string | null;
};

type Props = {
  siteId: string;
  strategy?: Strategy;
  color?: 'green' | 'yellow' | 'red';
  recommendation?: string;
  competitors?: Competitor[];
  stats?: Stats;
  accentColor?: string;
  onStrategyChange?: (s: Strategy) => void;
};

const colorMap: Record<NonNullable<Props['color']>, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

const bgColorMap: Record<NonNullable<Props['color']>, string> = {
  green: 'rgba(34, 197, 94, 0.15)',
  yellow: 'rgba(234, 179, 8, 0.15)',
  red: 'rgba(239, 68, 68, 0.15)',
};

const strategies: Strategy[] = ['Match', 'Premium', 'Undercut'];

const formatDelta = (delta: number | null | undefined) => {
  if (delta === null || delta === undefined) return '';
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${(delta * 100).toFixed(0)}c`;
};

export const MarketAnalysis: React.FC<Props> = ({
  siteId,
  strategy,
  color = 'yellow',
  recommendation,
  competitors = [],
  stats,
  accentColor = '#22c55e',
  onStrategyChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | undefined>(strategy);

  useEffect(() => {
    setCurrentStrategy(strategy);
  }, [strategy]);

  const badgeColor = colorMap[color] ?? '#9ca3af';
  const recoBgColor = bgColorMap[color] ?? 'rgba(156, 163, 175, 0.15)';

  const handleStrategyChange = async (newStrategy: Strategy) => {
    setCurrentStrategy(newStrategy);
    setDropdownOpen(false);
    await setStrategy(siteId, newStrategy);
    onStrategyChange?.(newStrategy);
  };

  const displayStrategy = currentStrategy ?? strategy;

  return (
    <View style={styles.card}>
      {/* Header with strategy dropdown */}
      <View style={styles.header}>
        <Text style={styles.title}>Market Analysis</Text>
        <View style={styles.strategyContainer}>
          <TouchableOpacity
            style={[styles.strategyButton, { borderColor: badgeColor }]}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            activeOpacity={0.7}
          >
            <View style={[styles.strategyBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.strategyBadgeText}>{displayStrategy ?? 'Select'}</Text>
            </View>
            <Text style={[styles.caret, { color: badgeColor }]}>
              {dropdownOpen ? '\u25B2' : '\u25BC'}
            </Text>
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={styles.dropdown}>
              {strategies.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.dropdownItem,
                    displayStrategy === s && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleStrategyChange(s)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      displayStrategy === s && { color: accentColor, fontWeight: '700' },
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Recommendation with color-coded background */}
      <View style={[styles.recoBox, { backgroundColor: recoBgColor, borderColor: badgeColor }]}>
        <Text style={[styles.reco, { color: badgeColor }]}>
          {recommendation ?? 'Analyzing market data...'}
        </Text>
      </View>

      {/* Stats row */}
      {stats && (
        <View style={styles.statsRow}>
          {stats.margin && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.margin}¢</Text>
              <Text style={styles.statLabel}>Margin/gal</Text>
            </View>
          )}
          {stats.compAvg && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${stats.compAvg.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Comp Avg</Text>
            </View>
          )}
          {stats.ourPrice && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${stats.ourPrice.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Our 87</Text>
            </View>
          )}
        </View>
      )}

      {/* Competitors list */}
      {competitors.length > 0 && (
        <View style={styles.compSection}>
          <Text style={styles.compHeader}>Competitors (5mi radius)</Text>
          {competitors.slice(0, 5).map((c, i) => (
            <View key={`${c.name}-${i}`} style={styles.compRow}>
              <View style={styles.compInfo}>
                <Text style={styles.compName}>{c.name}</Text>
                <Text style={styles.compDist}>{c.distanceMi.toFixed(1)} mi</Text>
              </View>
              <View style={styles.compPriceBox}>
                {c.price ? (
                  <>
                    <Text style={styles.compPrice}>${c.price.toFixed(2)}</Text>
                    {c.delta !== null && c.delta !== undefined && (
                      <Text
                        style={[
                          styles.compDelta,
                          { color: c.delta >= 0 ? '#22c55e' : '#ef4444' },
                        ]}
                      >
                        {formatDelta(c.delta)}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.compPrice}>--</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Wholesale info */}
      {stats?.wholesalePrice && (
        <View style={styles.wholesaleRow}>
          <Text style={styles.wholesaleLabel}>Wholesale:</Text>
          <Text style={styles.wholesaleValue}>${stats.wholesalePrice.toFixed(2)}</Text>
          {stats.wholesaleSource && (
            <Text style={styles.wholesaleSource}>({stats.wholesaleSource})</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
  },
  strategyContainer: {
    position: 'relative',
    zIndex: 10,
  },
  strategyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingRight: 10,
    gap: 6,
  },
  strategyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  strategyBadgeText: {
    color: '#0a0a0a',
    fontWeight: '800',
    fontSize: 12,
  },
  caret: {
    fontSize: 10,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  dropdownText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  recoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  reco: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingVertical: 10,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  compSection: {
    marginTop: 14,
  },
  compHeader: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  compInfo: {
    flex: 1,
  },
  compName: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  compDist: {
    color: '#64748b',
    fontSize: 12,
  },
  compPriceBox: {
    alignItems: 'flex-end',
  },
  compPrice: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
  },
  compDelta: {
    fontSize: 12,
    fontWeight: '600',
  },
  wholesaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  wholesaleLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  wholesaleValue: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  wholesaleSource: {
    color: '#64748b',
    fontSize: 11,
    marginLeft: 6,
  },
});

export default MarketAnalysis;

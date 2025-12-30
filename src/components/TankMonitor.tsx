import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Tank = {
  grade: string;
  levelPct: number;
  gallons: number;
  capacity: number;
};

type TankData = {
  lastSensorAt?: string;
  levelPct?: number;
  estDaysToEmpty?: number;
  tanks?: Tank[];
  notes?: string;
};

type Props = {
  data?: TankData | null;
  accentColor?: string;
};

const getGaugeColor = (pct: number) => {
  if (pct > 50) return '#22c55e'; // green
  if (pct >= 25) return '#eab308'; // yellow
  return '#ef4444'; // red
};

const TankGauge: React.FC<{ grade: string; levelPct: number; gallons: number; capacity: number }> = ({
  grade,
  levelPct,
  gallons,
  capacity,
}) => {
  const color = getGaugeColor(levelPct);
  return (
    <View style={styles.gaugeContainer}>
      <View style={styles.gaugeHeader}>
        <Text style={styles.gradeLabel}>{grade}</Text>
        <Text style={[styles.pctLabel, { color }]}>{levelPct}%</Text>
      </View>
      <View style={styles.gaugeTrack}>
        <View style={[styles.gaugeFill, { width: `${levelPct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.gallonsText}>
        {gallons.toLocaleString()} / {capacity.toLocaleString()} gal
      </Text>
    </View>
  );
};

export const TankMonitor: React.FC<Props> = ({ data, accentColor = '#f97316' }) => {
  if (!data) {
    return (
      <View style={styles.card}>
        <Text style={[styles.title, { color: accentColor }]}>Tank Monitoring</Text>
        <Text style={styles.text}>No sensor data available.</Text>
      </View>
    );
  }

  const overallColor = getGaugeColor(data.levelPct || 0);
  const lastUpdate = data.lastSensorAt ? new Date(data.lastSensorAt) : null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: accentColor }]}>Tank Monitoring</Text>
        <View style={[styles.statusDot, { backgroundColor: overallColor }]} />
      </View>

      {/* Overall summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: overallColor }]}>{data.levelPct ?? '--'}%</Text>
          <Text style={styles.summaryLabel}>Overall</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{data.estDaysToEmpty?.toFixed(1) ?? '--'}</Text>
          <Text style={styles.summaryLabel}>Days to Empty</Text>
        </View>
      </View>

      {/* Individual tanks */}
      {data.tanks?.map((tank) => (
        <TankGauge
          key={tank.grade}
          grade={tank.grade}
          levelPct={tank.levelPct}
          gallons={tank.gallons}
          capacity={tank.capacity}
        />
      ))}

      {/* Last update time */}
      <View style={styles.footer}>
        <Text style={styles.meta}>
          Last sensor: {lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}
        </Text>
        {data.notes && <Text style={styles.meta}>{data.notes}</Text>}
      </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: '#f1f5f9',
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  gaugeContainer: {
    marginBottom: 12,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gradeLabel: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  pctLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  gallonsText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  meta: {
    color: '#64748b',
    fontSize: 12,
  },
  text: {
    color: '#cbd5e1',
    fontSize: 14,
  },
});

export default TankMonitor;

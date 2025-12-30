import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Grade = {
  label: string;
  price?: string;
  source?: string;
  updatedAt?: string;
  status?: 'good' | 'warn' | 'bad' | 'loading';
};

type Props = {
  title?: string;
  grades: Grade[];
  accentColor: string;
  lastUpdated?: string;
};

const statusColors: Record<NonNullable<Grade['status']>, string> = {
  good: '#22c55e',
  warn: '#eab308',
  bad: '#ef4444',
  loading: '#6b7280',
};

export const PricePanel: React.FC<Props> = ({ title, grades, accentColor, lastUpdated }) => {
  return (
    <View style={styles.wrapper}>
      {title ? <Text style={[styles.title, { color: accentColor }]}>{title}</Text> : null}
      <View style={styles.grid}>
        {grades.map((grade) => {
          const statusColor = grade.status ? statusColors[grade.status] : accentColor;
          return (
            <View key={grade.label} style={[styles.card, { borderColor: statusColor }]}>
              <Text style={styles.grade}>{grade.label}</Text>
              <Text style={styles.price}>{grade.price ?? '—'}</Text>
              {grade.source ? <Text style={styles.meta}>{grade.source}</Text> : null}
              {grade.updatedAt ? <Text style={styles.meta}>Updated {grade.updatedAt}</Text> : null}
            </View>
          );
        })}
      </View>
      {lastUpdated ? <Text style={styles.footer}>Last updated {lastUpdated}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  grade: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f9fafb',
    marginTop: 6,
  },
  meta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  footer: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default PricePanel;

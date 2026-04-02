import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { QboResponse } from '../api';

type Props = {
  qbo: QboResponse | null;
};

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const statusColor = (s: string) => {
  if (s === 'paid') return '#22c55e';
  if (s === 'overdue') return '#ef4444';
  return '#eab308';
};

export const QboPanel: React.FC<Props> = ({ qbo }) => {
  if (!qbo) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>QuickBooks Online</Text>
        <Text style={styles.muted}>QBO data unavailable</Text>
      </View>
    );
  }

  if (!qbo.connected) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>QuickBooks Online</Text>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{qbo.error ?? 'Not connected to QBO'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>QuickBooks Online</Text>
        <View style={styles.connectedBadge}>
          <Text style={styles.connectedText}>Connected</Text>
        </View>
      </View>
      {qbo.companyName && (
        <Text style={styles.companyName}>{qbo.companyName}</Text>
      )}

      <View style={styles.statsRow}>
        {qbo.revenueThisMonth !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{fmt(qbo.revenueThisMonth)}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        )}
        {qbo.revenueLastMonth !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{fmt(qbo.revenueLastMonth)}</Text>
            <Text style={styles.statLabel}>Last Month</Text>
          </View>
        )}
        {qbo.accountsReceivable !== undefined && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, qbo.accountsReceivable > 0 && styles.arValue]}>
              {fmt(qbo.accountsReceivable)}
            </Text>
            <Text style={styles.statLabel}>AR Outstanding</Text>
          </View>
        )}
      </View>

      {(qbo.openInvoiceCount !== undefined || qbo.overdueInvoiceCount !== undefined) && (
        <View style={styles.invoiceSummary}>
          {qbo.openInvoiceCount !== undefined && (
            <Text style={styles.invoiceChip}>
              {qbo.openInvoiceCount} open
            </Text>
          )}
          {qbo.overdueInvoiceCount !== undefined && qbo.overdueInvoiceCount > 0 && (
            <Text style={[styles.invoiceChip, styles.overdueChip]}>
              {qbo.overdueInvoiceCount} overdue
            </Text>
          )}
        </View>
      )}

      {qbo.recentInvoices && qbo.recentInvoices.length > 0 && (
        <View style={styles.invoiceSection}>
          <Text style={styles.sectionHeader}>Recent Invoices</Text>
          {qbo.recentInvoices.map((inv) => (
            <View key={inv.id} style={styles.invoiceRow}>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceCustomer}>{inv.customerName}</Text>
                <Text style={styles.invoiceDue}>Due {inv.dueDate}</Text>
              </View>
              <View style={styles.invoiceRight}>
                <Text style={styles.invoiceAmount}>{fmt(inv.amount)}</Text>
                <Text style={[styles.invoiceStatus, { color: statusColor(inv.status) }]}>
                  {inv.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {qbo.lastSyncedAt && (
        <Text style={styles.syncedAt}>Synced {qbo.lastSyncedAt}</Text>
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
  connectedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  connectedText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '700',
  },
  companyName: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
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
    fontSize: 16,
    fontWeight: '700',
  },
  arValue: {
    color: '#eab308',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  invoiceSummary: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  invoiceChip: {
    color: '#eab308',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eab308',
  },
  overdueChip: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  invoiceSection: {
    marginTop: 14,
  },
  sectionHeader: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceCustomer: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  invoiceDue: {
    color: '#64748b',
    fontSize: 12,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '700',
  },
  invoiceStatus: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  syncedAt: {
    color: '#4b5563',
    fontSize: 11,
    marginTop: 12,
    textAlign: 'right',
  },
  muted: {
    color: '#4b5563',
    fontSize: 14,
    marginTop: 8,
  },
  errorBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
  },
});

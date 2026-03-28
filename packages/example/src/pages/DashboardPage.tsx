import React, { useState, useCallback } from 'react';
import { useLLMAction, LLMScope } from '@ui-llm/react';
import * as s from '../styles';

interface DashboardPageProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

type TimeRange = '7d' | '30d' | '90d';

const metricData: Record<TimeRange, { visitors: number; signups: number; revenue: number; bounce: number }> = {
  '7d':  { visitors: 1243, signups: 48, revenue: 3420, bounce: 34 },
  '30d': { visitors: 5891, signups: 203, revenue: 14200, bounce: 31 },
  '90d': { visitors: 18420, signups: 612, revenue: 42800, bounce: 29 },
};

export function DashboardPage({ onNotify }: DashboardPageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics = metricData[timeRange];

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onNotify('Dashboard data refreshed', 'success');
    }, 1000);
  }, [onNotify]);

  const { ref: refreshRef } = useLLMAction({
    name: 'Refresh Dashboard',
    description: 'Reload all dashboard metrics with fresh data',
    loading: isRefreshing,
    onExecute: async () => {
      handleRefresh();
      return { status: 'success', message: 'Dashboard refreshing' };
    },
  });

  const { ref: exportRef } = useLLMAction({
    name: 'Export Report',
    description: 'Export the current dashboard data as a CSV report',
    params: {
      format: { type: 'string', description: 'Export format', enum: ['csv', 'pdf', 'json'], required: true },
    },
    onExecute: async (req) => {
      const format = req.params?.format ?? 'csv';
      onNotify(`Report exported as ${format}`, 'success');
      return { status: 'success', message: `Report exported as ${format}` };
    },
  });

  const { ref: range7dRef } = useLLMAction({
    name: 'Set Time Range 7 Days',
    description: 'Show dashboard metrics for the last 7 days',
    group: 'time-range',
    dynamicState: { active: timeRange === '7d' },
    onExecute: async () => {
      setTimeRange('7d');
      return { status: 'success', message: 'Time range set to 7 days' };
    },
  });

  const { ref: range30dRef } = useLLMAction({
    name: 'Set Time Range 30 Days',
    description: 'Show dashboard metrics for the last 30 days',
    group: 'time-range',
    dynamicState: { active: timeRange === '30d' },
    onExecute: async () => {
      setTimeRange('30d');
      return { status: 'success', message: 'Time range set to 30 days' };
    },
  });

  const { ref: range90dRef } = useLLMAction({
    name: 'Set Time Range 90 Days',
    description: 'Show dashboard metrics for the last 90 days',
    group: 'time-range',
    dynamicState: { active: timeRange === '90d' },
    onExecute: async () => {
      setTimeRange('90d');
      return { status: 'success', message: 'Time range set to 90 days' };
    },
  });

  const rangeBtn = (label: string, value: TimeRange, ref: React.Ref<HTMLButtonElement>) => (
    <button
      ref={ref}
      onClick={() => setTimeRange(value)}
      style={{
        ...s.btnSecondary,
        background: timeRange === value ? '#4a4aff' : '#eee',
        color: timeRange === value ? 'white' : '#333',
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div style={s.spaceBetween}>
        <h1>Dashboard</h1>
        <div style={s.row}>
          <button ref={refreshRef} onClick={handleRefresh} disabled={isRefreshing} style={isRefreshing ? s.btnDisabled : s.btnPrimary}>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button ref={exportRef} onClick={() => onNotify('Report exported as CSV', 'success')} style={s.btnSecondary}>
            Export
          </button>
        </div>
      </div>

      <LLMScope name="Time Range Selector" description="Toggle between 7-day, 30-day, and 90-day views">
        <div style={{ ...s.row, margin: '1.5rem 0' }}>
          {rangeBtn('7 Days', '7d', range7dRef)}
          {rangeBtn('30 Days', '30d', range30dRef)}
          {rangeBtn('90 Days', '90d', range90dRef)}
        </div>
      </LLMScope>

      <LLMScope name="Metrics Cards" description="Key performance indicators">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <MetricCard title="Visitors" value={metrics.visitors.toLocaleString()} change={+12} />
          <MetricCard title="Signups" value={metrics.signups.toLocaleString()} change={+8} />
          <MetricCard title="Revenue" value={`$${metrics.revenue.toLocaleString()}`} change={+15} />
          <MetricCard title="Bounce Rate" value={`${metrics.bounce}%`} change={-3} />
        </div>
      </LLMScope>

      <LLMScope name="Activity Feed" description="Recent activity events">
        <div style={s.card}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Activity</h2>
          {[
            { time: '2 min ago', event: 'New signup: alice@example.com' },
            { time: '15 min ago', event: 'Payment received: $49.00' },
            { time: '1 hour ago', event: 'Contact updated: Bob Smith' },
            { time: '3 hours ago', event: 'Report generated: Weekly summary' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '0.5rem 0', borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem' }}>{item.event}</span>
              <span style={{ fontSize: '0.8rem', color: '#999' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </LLMScope>
    </div>
  );
}

function MetricCard({ title, value, change }: { title: string; value: string; change: number }) {
  const { ref } = useLLMAction({
    name: `${title} Metric`,
    description: `Dashboard metric showing ${title}: ${value} (${change > 0 ? '+' : ''}${change}% change)`,
    group: 'metrics',
    dynamicState: { value, changePercent: change },
  });

  return (
    <div ref={ref} style={s.card}>
      <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: change > 0 ? '#2ecc71' : '#e74c3c', marginTop: '0.25rem' }}>
        {change > 0 ? '+' : ''}{change}% vs previous
      </div>
    </div>
  );
}

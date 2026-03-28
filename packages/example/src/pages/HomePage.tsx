import React from 'react';
import { useLLMAction, LLMScope } from '@ui-llm/react';
import type { PageId } from '../App';
import * as s from '../styles';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

const features = [
  {
    title: 'Semantic Annotations',
    desc: 'useLLMAction and useLLMInput hooks annotate your UI components with metadata that LLMs can understand.',
    page: 'settings' as PageId,
    cta: 'See in Settings',
  },
  {
    title: 'Natural Language Testing',
    desc: 'Write Playwright tests in plain English. The LLM resolves your instructions against the live manifest.',
    page: 'dashboard' as PageId,
    cta: 'View Dashboard',
  },
  {
    title: 'Bidirectional Execution',
    desc: 'Actions can be invoked directly via the protocol with typed parameters — no DOM simulation needed.',
    page: 'contacts' as PageId,
    cta: 'Try Contacts',
  },
];

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ui-llm Demo</h1>
        <p style={{ color: '#666', fontSize: '1.05rem', lineHeight: 1.5 }}>
          A semantic annotation layer for React components that lets LLMs understand and interact with your UI.
          Open the DevPanel (bottom-right) or run <code style={{ background: '#eee', padding: '2px 6px', borderRadius: 4 }}>window.__ui_llm__.getManifest()</code> in the console.
        </p>
      </div>

      <LLMScope name="Feature Cards" description="Cards showcasing the main features of ui-llm">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {features.map(f => (
            <FeatureCard key={f.title} {...f} onNavigate={onNavigate} />
          ))}
        </div>
      </LLMScope>

      <LLMScope name="Quick Actions" description="Shortcut actions from the home page">
        <div style={{ ...s.card, marginTop: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <QuickAction label="Open Search" desc="Open the global search overlay" shortcut="Ctrl+K" />
            <QuickAction label="Go to Dashboard" desc="Jump to the metrics dashboard" onClick={() => onNavigate('dashboard')} />
            <QuickAction label="Add Contact" desc="Jump to contacts and add a new one" onClick={() => onNavigate('contacts')} />
          </div>
        </div>
      </LLMScope>
    </div>
  );
}

function FeatureCard({ title, desc, cta, page, onNavigate }: {
  title: string; desc: string; cta: string; page: PageId; onNavigate: (p: PageId) => void;
}) {
  const { ref } = useLLMAction({
    name: cta,
    description: `Navigate to ${page} page to see: ${title}`,
    group: 'feature-cards',
    onExecute: async () => {
      onNavigate(page);
      return { status: 'success', message: `Navigated to ${page}` };
    },
  });

  return (
    <div style={s.card}>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.05rem' }}>{title}</h3>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.4 }}>{desc}</p>
      <button ref={ref} onClick={() => onNavigate(page)} style={s.btnPrimary}>{cta}</button>
    </div>
  );
}

function QuickAction({ label, desc, shortcut, onClick }: {
  label: string; desc: string; shortcut?: string; onClick?: () => void;
}) {
  const { ref } = useLLMAction({
    name: label,
    description: desc,
    group: 'quick-actions',
    shortcut,
    onExecute: async () => {
      onClick?.();
      return { status: 'success', message: `${label} executed` };
    },
  });

  return (
    <button ref={ref} onClick={onClick} style={{ ...s.btnSecondary, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {label}
      {shortcut && <span style={{ fontSize: '0.75rem', color: '#999' }}>{shortcut}</span>}
    </button>
  );
}

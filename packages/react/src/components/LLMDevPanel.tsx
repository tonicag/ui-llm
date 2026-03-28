import React, { useState, useEffect, useCallback, useContext } from 'react';
import { LLMContext } from '../context';
import type { LLMEntry, LLMActionEntry, LLMInputEntry } from '@seam-ui/core';
import { SEAM_DATA_ATTRIBUTE } from '@seam-ui/core';

interface HighlightOverlay {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface LLMDevPanelProps {
  /** Default position. Defaults to 'bottom-right'. */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Default collapsed state. Defaults to true. */
  defaultCollapsed?: boolean;
}

export function LLMDevPanel({
  position = 'bottom-right',
  defaultCollapsed = true,
}: LLMDevPanelProps) {
  const ctx = useContext(LLMContext);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [entries, setEntries] = useState<LLMEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | 'action' | 'input'>('all');
  const [highlight, setHighlight] = useState<HighlightOverlay | null>(null);
  const [copied, setCopied] = useState(false);

  // Don't render if LLMProvider is not present or disabled
  if (!ctx || !ctx.enabled) return null;

  const { registry } = ctx;

  // Subscribe to registry changes
  useEffect(() => {
    const update = () => {
      const manifest = registry.getManifest();
      setEntries([...manifest.entries]);
    };
    update();
    return registry.subscribe(update);
  }, [registry]);

  const filteredEntries = entries.filter(e => {
    if (kindFilter !== 'all' && e.kind !== kindFilter) return false;
    if (filter) {
      const q = filter.toLowerCase();
      return (
        e.descriptor.name.toLowerCase().includes(q) ||
        e.descriptor.description.toLowerCase().includes(q) ||
        e.scopePath.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleHighlight = useCallback((entry: LLMEntry) => {
    const el = document.querySelector(`[${SEAM_DATA_ATTRIBUTE}="${entry.dataAttribute}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlight({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  const handleCopyManifest = useCallback(async () => {
    const manifest = registry.getManifest();
    await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [registry]);

  const posStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 99999,
    ...(position.includes('bottom') ? { bottom: '16px' } : { top: '16px' }),
    ...(position.includes('right') ? { right: '16px' } : { left: '16px' }),
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          ...posStyle,
          padding: '8px 12px',
          background: '#1a1a2e',
          color: '#4a4aff',
          border: '1px solid #4a4aff',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        seam-ui ({entries.length})
      </button>
    );
  }

  return (
    <>
      {/* Highlight overlay */}
      {highlight && (
        <div
          style={{
            position: 'absolute',
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            border: '2px solid #4a4aff',
            background: 'rgba(74, 74, 255, 0.1)',
            pointerEvents: 'none',
            zIndex: 99998,
            borderRadius: '4px',
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          ...posStyle,
          width: '380px',
          maxHeight: '500px',
          background: '#1a1a2e',
          color: '#e0e0e0',
          borderRadius: '12px',
          border: '1px solid #333',
          fontFamily: 'monospace',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 'bold', color: '#4a4aff' }}>
            seam-ui DevPanel
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleCopyManifest}
              style={{
                padding: '3px 8px',
                background: 'transparent',
                color: '#aaa',
                border: '1px solid #555',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={() => { setCollapsed(true); setHighlight(null); }}
              style={{
                padding: '3px 8px',
                background: 'transparent',
                color: '#aaa',
                border: '1px solid #555',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Summary */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #333', color: '#888' }}>
          {entries.filter(e => e.kind === 'action').length} actions,{' '}
          {entries.filter(e => e.kind === 'input').length} inputs,{' '}
          {entries.filter(e => e.state.visibility.visible).length} visible
        </div>

        {/* Filters */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #333', display: 'flex', gap: '6px' }}>
          <input
            type="text"
            placeholder="Filter entries..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              flex: 1,
              padding: '4px 8px',
              background: '#0d0d1a',
              color: '#e0e0e0',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
          <select
            value={kindFilter}
            onChange={e => setKindFilter(e.target.value as 'all' | 'action' | 'input')}
            style={{
              padding: '4px',
              background: '#0d0d1a',
              color: '#e0e0e0',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          >
            <option value="all">All</option>
            <option value="action">Actions</option>
            <option value="input">Inputs</option>
          </select>
        </div>

        {/* Entry list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filteredEntries.map(entry => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onMouseEnter={() => handleHighlight(entry)}
              onMouseLeave={() => setHighlight(null)}
            />
          ))}
          {filteredEntries.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
              No entries {filter ? 'matching filter' : 'registered'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function EntryRow({
  entry,
  onMouseEnter,
  onMouseLeave,
}: {
  entry: LLMEntry;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isAction = entry.kind === 'action';

  const badgeColor = isAction ? '#4a4aff' : '#e67e22';
  const visColor = entry.state.visibility.visible ? '#2ecc71' : '#e74c3c';
  const enColor = entry.state.enabled ? '#2ecc71' : '#e74c3c';

  return (
    <div
      style={{
        padding: '8px 14px',
        borderBottom: '1px solid #222',
        cursor: 'pointer',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            padding: '1px 5px',
            background: badgeColor,
            borderRadius: '3px',
            fontSize: '10px',
            color: 'white',
            textTransform: 'uppercase',
          }}
        >
          {entry.kind}
        </span>
        <span style={{ fontWeight: 'bold', flex: 1 }}>{entry.descriptor.name}</span>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: visColor,
            display: 'inline-block',
          }}
          title={entry.state.visibility.visible ? 'Visible' : 'Hidden'}
        />
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: enColor,
            display: 'inline-block',
          }}
          title={entry.state.enabled ? 'Enabled' : 'Disabled'}
        />
      </div>

      {/* Scope */}
      {entry.scopePath.length > 0 && (
        <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
          {entry.scopePath.join(' > ')}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: '8px', padding: '8px', background: '#0d0d1a', borderRadius: '6px' }}>
          <div style={{ color: '#888', marginBottom: '4px' }}>{entry.descriptor.description}</div>
          <div style={{ color: '#555', fontSize: '11px' }}>
            <div>ID: {entry.id}</div>
            <div>Visible: {String(entry.state.visibility.visible)} (viewport: {String(entry.state.visibility.inViewport)}, css: {String(entry.state.visibility.cssVisible)})</div>
            <div>Enabled: {String(entry.state.enabled)}</div>
            <div>Loading: {String(entry.state.loading)}</div>
            {Object.keys(entry.state.dynamicState).length > 0 && (
              <div>Dynamic: {JSON.stringify(entry.state.dynamicState)}</div>
            )}
            {entry.kind === 'input' && (
              <>
                <div>Value: {JSON.stringify((entry as LLMInputEntry).currentValue)}</div>
                <div>Valid: {String((entry as LLMInputEntry).validation.valid)}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

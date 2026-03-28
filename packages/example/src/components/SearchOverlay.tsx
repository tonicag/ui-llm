import React, { useState, useEffect } from 'react';
import { useLLMAction, useLLMInput, LLMScope } from '@seam-ui/react';
import type { PageId } from '../App';

interface SearchOverlayProps {
  onClose: () => void;
  onNavigate: (page: PageId) => void;
}

const searchableItems: { id: PageId; name: string; description: string; keywords: string[] }[] = [
  { id: 'home', name: 'Home', description: 'Overview and getting started', keywords: ['welcome', 'start'] },
  { id: 'dashboard', name: 'Dashboard', description: 'Metrics, charts, and stats', keywords: ['metrics', 'analytics', 'charts'] },
  { id: 'contacts', name: 'Contacts', description: 'Manage your contacts', keywords: ['people', 'users', 'list'] },
  { id: 'settings', name: 'Settings', description: 'Preferences and account', keywords: ['preferences', 'account', 'profile'] },
];

export function SearchOverlay({ onClose, onNavigate }: SearchOverlayProps) {
  const [query, setQuery] = useState('');

  const { ref: searchInputRef } = useLLMInput({
    name: 'Global Search',
    description: 'Search for pages, contacts, and actions across the app',
    inputType: 'search',
    value: query,
  });

  const { ref: closeRef } = useLLMAction({
    name: 'Close Search',
    description: 'Close the search overlay',
    onExecute: async () => {
      onClose();
      return { status: 'success', message: 'Search closed' };
    },
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = searchableItems.filter(item => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
    );
  });

  return (
    <LLMScope name="Search Overlay" description="Global search overlay for finding pages and features">
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '15vh',
          zIndex: 10000,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', gap: '0.5rem' }}>
            <input
              ref={searchInputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search pages..."
              autoFocus
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            <button
              ref={closeRef}
              onClick={onClose}
              style={{
                padding: '0.4rem 0.8rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: '#888',
              }}
            >
              ESC
            </button>
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {filtered.map(item => (
              <SearchResultItem key={item.id} item={item} onSelect={() => onNavigate(item.id)} />
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                No results for "{query}"
              </div>
            )}
          </div>
        </div>
      </div>
    </LLMScope>
  );
}

function SearchResultItem({ item, onSelect }: { item: typeof searchableItems[0]; onSelect: () => void }) {
  const { ref } = useLLMAction({
    name: `Navigate to ${item.name}`,
    description: `Search result: ${item.description}`,
    group: 'search-results',
    onExecute: async () => {
      onSelect();
      return { status: 'success', message: `Navigated to ${item.name}` };
    },
  });

  return (
    <button
      ref={ref}
      onClick={onSelect}
      style={{
        display: 'block',
        width: '100%',
        padding: '0.75rem 1rem',
        border: 'none',
        background: 'white',
        textAlign: 'left',
        cursor: 'pointer',
        borderBottom: '1px solid #f0f0f0',
      }}
      onMouseOver={e => (e.currentTarget.style.background = '#f8f8ff')}
      onMouseOut={e => (e.currentTarget.style.background = 'white')}
    >
      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
      <div style={{ color: '#888', fontSize: '0.8rem' }}>{item.description}</div>
    </button>
  );
}

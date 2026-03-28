import React from 'react';
import { useLLMAction } from '@seam-ui/react';
import type { PageId } from '../App';

interface NavBarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onSearchOpen: () => void;
  notificationCount: number;
}

const pages: { id: PageId; label: string; description: string }[] = [
  { id: 'home', label: 'Home', description: 'Navigate to the home page' },
  { id: 'dashboard', label: 'Dashboard', description: 'Navigate to the metrics dashboard' },
  { id: 'contacts', label: 'Contacts', description: 'Navigate to the contacts list' },
  { id: 'settings', label: 'Settings', description: 'Navigate to settings and preferences' },
];

export function NavBar({ currentPage, onNavigate, onSearchOpen, notificationCount }: NavBarProps) {
  const navActions = pages.map(p => ({
    page: p,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    action: useLLMAction({
      name: p.label,
      description: p.description,
      group: 'navigation',
      dynamicState: { active: currentPage === p.id },
      onExecute: async () => {
        onNavigate(p.id);
        return { status: 'success' as const, message: `Navigated to ${p.label}` };
      },
    }),
  }));

  const { ref: searchRef } = useLLMAction({
    name: 'Open Search',
    description: 'Open the global search overlay to find pages, contacts, and actions',
    shortcut: 'Ctrl+K',
    onExecute: async () => {
      onSearchOpen();
      return { status: 'success' as const, message: 'Search overlay opened' };
    },
  });

  return (
    <nav style={{
      display: 'flex',
      gap: '0.5rem',
      padding: '0.75rem 2rem',
      background: '#1a1a2e',
      color: 'white',
      alignItems: 'center',
    }}>
      <strong style={{ marginRight: '1rem', fontSize: '1.1rem', color: '#4a4aff' }}>
        seam-ui
      </strong>

      {navActions.map(({ page: p, action }) => (
        <button
          key={p.id}
          ref={action.ref}
          onClick={() => onNavigate(p.id)}
          style={{
            padding: '0.4rem 0.8rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            background: currentPage === p.id ? '#4a4aff' : 'transparent',
            color: 'white',
            fontSize: '0.9rem',
          }}
        >
          {p.label}
        </button>
      ))}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          ref={searchRef}
          onClick={onSearchOpen}
          style={{
            padding: '0.4rem 0.8rem',
            border: '1px solid #444',
            borderRadius: '6px',
            cursor: 'pointer',
            background: 'transparent',
            color: '#aaa',
            fontSize: '0.85rem',
          }}
        >
          Search... (Ctrl+K)
        </button>

        {notificationCount > 0 && (
          <span style={{
            background: '#e74c3c',
            color: 'white',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>
            {notificationCount}
          </span>
        )}
      </div>
    </nav>
  );
}

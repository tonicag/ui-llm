import React, { useState, useMemo } from 'react';
import { LLMProvider, LLMScope, LLMDevPanel } from '@seam-ui/react';
import type { LLMRoute, LLMCurrentRoute, LLMCapabilities } from '@seam-ui/core';
import { NavBar } from './components/NavBar';
import { Notifications } from './components/Notifications';
import { SearchOverlay } from './components/SearchOverlay';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ContactsPage } from './pages/ContactsPage';
import { SettingsPage } from './pages/SettingsPage';

export type PageId = 'home' | 'dashboard' | 'contacts' | 'settings';

const routes: LLMRoute[] = [
  { path: '/', name: 'Home', description: 'Landing page with feature overview' },
  { path: '/dashboard', name: 'Dashboard', description: 'Metrics overview with charts and stats' },
  { path: '/contacts', name: 'Contacts', description: 'Contact list with search, add, and edit' },
  { path: '/settings', name: 'Settings', description: 'User settings, preferences, and account management' },
];

const capabilities: LLMCapabilities = {
  read: true,
  execute: true,
  navigate: true,
  fillInputs: true,
  dangerZone: false,
};

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function App() {
  const [page, setPage] = useState<PageId>('home');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const addNotification = (message: string, type: Notification['type'] = 'info') => {
    const id = Date.now().toString(36);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const routeMap: Record<PageId, { path: string; name: string }> = {
    home: { path: '/', name: 'Home' },
    dashboard: { path: '/dashboard', name: 'Dashboard' },
    contacts: { path: '/contacts', name: 'Contacts' },
    settings: { path: '/settings', name: 'Settings' },
  };

  const currentRoute = useMemo<LLMCurrentRoute>(
    () => routeMap[page],
    [page]
  );

  return (
    <LLMProvider
      enabled
      routes={routes}
      currentRoute={currentRoute}
      capabilities={capabilities}
    >
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <LLMScope name="Navigation" description="Main navigation bar with search and notifications">
          <NavBar
            currentPage={page}
            onNavigate={setPage}
            onSearchOpen={() => setSearchOpen(true)}
            notificationCount={notifications.length}
          />
        </LLMScope>

        <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
          <LLMScope name="Main Content" description="Primary content area">
            {page === 'home' && <HomePage onNavigate={setPage} />}
            {page === 'dashboard' && <DashboardPage onNotify={addNotification} />}
            {page === 'contacts' && <ContactsPage onNotify={addNotification} />}
            {page === 'settings' && <SettingsPage onNotify={addNotification} />}
          </LLMScope>
        </main>

        <LLMScope name="Overlays" description="Modals, notifications, and overlays">
          <Notifications items={notifications} onDismiss={dismissNotification} />
          {searchOpen && (
            <SearchOverlay
              onClose={() => setSearchOpen(false)}
              onNavigate={(p) => { setPage(p); setSearchOpen(false); }}
            />
          )}
        </LLMScope>
      </div>
      <LLMDevPanel />
    </LLMProvider>
  );
}

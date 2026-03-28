import React, { useEffect, useMemo, useRef } from 'react';
import { LLMContext, type LLMContextValue } from '../context';
import { LLMRegistry } from '../registry';
import type { LLMRoute, LLMCurrentRoute, LLMCapabilities } from '@seam-ui/core';
import { SEAM_WINDOW_KEY, SEAM_VERSION, SEAM_META_NAME, SEAM_PROTOCOL_VERSION } from '@seam-ui/core';

export interface LLMProviderProps {
  children: React.ReactNode;
  /**
   * Set to false to disable all annotations.
   * Defaults to `process.env.NODE_ENV !== 'production'`.
   */
  enabled?: boolean;
  /**
   * Expose the manifest on `window.__seam__` for Playwright.
   * Defaults to true when enabled is true.
   */
  exposeOnWindow?: boolean;
  /** Available routes in the application */
  routes?: LLMRoute[];
  /** Currently active route */
  currentRoute?: LLMCurrentRoute;
  /** Capabilities declaration for this page */
  capabilities?: LLMCapabilities;
}

export function LLMProvider({
  children,
  enabled = process.env.NODE_ENV !== 'production',
  exposeOnWindow = enabled,
  routes,
  currentRoute,
  capabilities,
}: LLMProviderProps) {
  const registryRef = useRef<LLMRegistry | null>(null);
  if (!registryRef.current) {
    registryRef.current = new LLMRegistry();
  }

  const contextValue = useMemo<LLMContextValue>(
    () => ({ registry: registryRef.current!, enabled }),
    [enabled]
  );

  // Discovery: inject <meta name="seam-ui"> tag
  useEffect(() => {
    if (!enabled) return;

    const meta = document.createElement('meta');
    meta.name = SEAM_META_NAME;
    meta.content = SEAM_PROTOCOL_VERSION;
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, [enabled]);

  // Sync routes into registry
  useEffect(() => {
    if (!enabled) return;
    registryRef.current!.setRoutes(routes ?? []);
  }, [routes, enabled]);

  useEffect(() => {
    if (!enabled) return;
    registryRef.current!.setCurrentRoute(currentRoute);
  }, [currentRoute, enabled]);

  // Sync capabilities into registry
  useEffect(() => {
    if (!enabled) return;
    registryRef.current!.setCapabilities(capabilities);
  }, [capabilities, enabled]);

  // Expose window bridge
  useEffect(() => {
    if (!exposeOnWindow || !enabled) return;

    const registry = registryRef.current!;
    window[SEAM_WINDOW_KEY] = {
      getManifest: () => registry.getManifest(),
      getEntry: (id) => registry.getEntry(id),
      findEntries: (query) => registry.findEntries(query),
      version: SEAM_VERSION,
      execute: async (entryId, request) => registry.execute(entryId, request),
      subscribe: (target, callback) => registry.subscribeToEntry(target, callback),
    };

    return () => {
      delete window[SEAM_WINDOW_KEY];
    };
  }, [exposeOnWindow, enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <LLMContext.Provider value={contextValue}>
      {children}
    </LLMContext.Provider>
  );
}

import { createContext, useContext } from 'react';
import type { LLMRegistry } from './registry';
import type { ScopePath } from '@seam-ui/core';

export interface LLMContextValue {
  registry: LLMRegistry;
  enabled: boolean;
}

export interface LLMScopeContextValue {
  path: ScopePath;
}

export const LLMContext = createContext<LLMContextValue | null>(null);
export const LLMScopeContext = createContext<LLMScopeContextValue>({ path: [] });

/**
 * Returns the LLM context or null if not within an LLMProvider.
 * Returns null during SSR/prerendering when providers aren't mounted.
 * Hooks use this to gracefully no-op instead of throwing.
 */
export function useLLMContext(): LLMContextValue | null {
  return useContext(LLMContext);
}

export function useLLMScopeContext(): LLMScopeContextValue {
  return useContext(LLMScopeContext);
}

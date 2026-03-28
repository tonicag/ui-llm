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

export function useLLMContext(): LLMContextValue {
  const ctx = useContext(LLMContext);
  if (!ctx) {
    throw new Error(
      'useLLMAction/useLLMInput must be used within an <LLMProvider>. ' +
      'Wrap your app root with <LLMProvider>.'
    );
  }
  return ctx;
}

export function useLLMScopeContext(): LLMScopeContextValue {
  return useContext(LLMScopeContext);
}

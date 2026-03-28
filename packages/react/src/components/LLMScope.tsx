import React, { useMemo } from 'react';
import { LLMScopeContext, useLLMScopeContext } from '../context';
import type { ScopePath } from '@ui-llm/core';

export interface LLMScopeProps {
  /** Human-readable name for this scope */
  name: string;
  /** Description of what this scope contains */
  description?: string;
  children: React.ReactNode;
}

export function LLMScope({ name, children }: LLMScopeProps) {
  const parentScope = useLLMScopeContext();

  const scopeValue = useMemo(
    () => ({
      path: [...parentScope.path, name] as unknown as ScopePath,
    }),
    [parentScope.path, name]
  );

  return (
    <LLMScopeContext.Provider value={scopeValue}>
      {children}
    </LLMScopeContext.Provider>
  );
}

import { useEffect, useRef, type RefObject } from 'react';
import type {
  EntryId,
  LLMActionDescriptor,
  LLMActionEntry,
  ScopePath,
  OnExecuteCallback,
  LLMRelation,
  LLMPermission,
} from '@seam-ui/core';
import { SEAM_DATA_ATTRIBUTE, generateId } from '@seam-ui/core';
import { useLLMContext, useLLMScopeContext } from '../context';
import { useVisibility } from './useVisibility';

export interface UseLLMActionOptions extends LLMActionDescriptor {
  /** Override the ref if you already have one */
  ref?: RefObject<HTMLElement | null>;
  /** Dynamic state that changes over time */
  dynamicState?: Record<string, unknown>;
  /** Whether the element is enabled. Defaults to true. */
  enabled?: boolean;
  /** Whether the element is in a loading state */
  loading?: boolean;
  /** Callback invoked when this action is executed via the bridge */
  onExecute?: OnExecuteCallback;
  /** Semantic relationships to other entries */
  relations?: LLMRelation[];
  /** Required capability to interact with this action */
  permission?: LLMPermission;
}

export interface UseLLMActionReturn<T extends HTMLElement = HTMLElement> {
  /** Attach this ref to the DOM element */
  ref: RefObject<T | null>;
  /** The generated entry ID for this action */
  entryId: EntryId;
}

export function useLLMAction<T extends HTMLElement = HTMLElement>(
  options: UseLLMActionOptions
): UseLLMActionReturn<T> {
  const ctx = useLLMContext();
  const registry = ctx?.registry;
  const llmEnabled = ctx?.enabled ?? false;
  const { path: scopePath } = useLLMScopeContext();
  const internalRef = useRef<T>(null);
  const ref = (options.ref as RefObject<T | null>) ?? internalRef;
  const entryIdRef = useRef<EntryId>(generateId());
  const visibility = useVisibility(ref as RefObject<HTMLElement | null>);
  const deregisterRef = useRef<(() => void) | null>(null);

  // Attach data attribute
  useEffect(() => {
    const el = ref.current;
    if (!el || !llmEnabled) return;
    el.setAttribute(SEAM_DATA_ATTRIBUTE, entryIdRef.current);
    return () => el.removeAttribute(SEAM_DATA_ATTRIBUTE);
  }, [ref, llmEnabled]);

  // Register on mount
  useEffect(() => {
    if (!llmEnabled || !registry) return;

    const el = ref.current;
    const entry: LLMActionEntry = {
      id: entryIdRef.current,
      kind: 'action',
      descriptor: {
        name: options.name,
        description: options.description,
        group: options.group,
        shortcut: options.shortcut,
        dynamicState: options.dynamicState,
        params: options.params,
        relations: options.relations,
      },
      selector: `[${SEAM_DATA_ATTRIBUTE}="${entryIdRef.current}"]`,
      dataAttribute: entryIdRef.current,
      scopePath: scopePath as ScopePath,
      state: {
        visibility,
        enabled: options.enabled ?? true,
        loading: options.loading ?? false,
        dynamicState: options.dynamicState ?? {},
      },
      tagName: el?.tagName.toLowerCase() ?? 'unknown',
      role: el?.getAttribute('role') ?? null,
      lastUpdated: Date.now(),
      permission: options.permission,
    };

    deregisterRef.current = registry.register(entry);
    return () => {
      deregisterRef.current?.();
      deregisterRef.current = null;
    };
  }, [llmEnabled]);

  // Register onExecute callback
  useEffect(() => {
    if (!llmEnabled || !registry || !options.onExecute) return;
    return registry.registerExecuteCallback(entryIdRef.current, options.onExecute);
  }, [options.onExecute, llmEnabled]);

  // Update state reactively
  useEffect(() => {
    if (!llmEnabled || !registry) return;
    registry.updateState(entryIdRef.current, {
      visibility,
      enabled: options.enabled ?? true,
      loading: options.loading ?? false,
      dynamicState: options.dynamicState ?? {},
    });
  }, [
    visibility.visible,
    visibility.inViewport,
    visibility.cssVisible,
    options.enabled,
    options.loading,
    JSON.stringify(options.dynamicState),
    llmEnabled,
  ]);

  // Update descriptor when it changes
  useEffect(() => {
    if (!llmEnabled || !registry) return;
    registry.updateDescriptor(entryIdRef.current, {
      name: options.name,
      description: options.description,
      group: options.group,
      shortcut: options.shortcut,
      dynamicState: options.dynamicState,
      params: options.params,
      relations: options.relations,
    });
  }, [options.name, options.description, options.group, options.shortcut, llmEnabled]);

  return {
    ref,
    entryId: entryIdRef.current,
  };
}

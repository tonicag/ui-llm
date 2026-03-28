import { useEffect, useRef, type RefObject } from 'react';
import type {
  EntryId,
  LLMInputDescriptor,
  LLMInputEntry,
  LLMInputValidation,
  ScopePath,
  LLMRelation,
  LLMPermission,
} from '@ui-llm/core';
import { UI_LLM_DATA_ATTRIBUTE, generateId } from '@ui-llm/core';
import { useLLMContext, useLLMScopeContext } from '../context';
import { useVisibility } from './useVisibility';

export interface UseLLMInputOptions extends LLMInputDescriptor {
  /** Override the ref if you already have one */
  ref?: RefObject<HTMLElement | null>;
  /** Current value of the input (for controlled components) */
  value?: string | boolean | number | string[];
  /** Override enabled state */
  enabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Dynamic state */
  dynamicState?: Record<string, unknown>;
  /** Semantic relationships to other entries */
  relations?: LLMRelation[];
  /** Required capability to interact with this input */
  permission?: LLMPermission;
}

export interface UseLLMInputReturn<T extends HTMLElement = HTMLElement> {
  /** Attach this ref to the DOM element */
  ref: RefObject<T | null>;
  /** The generated entry ID for this input */
  entryId: EntryId;
}

function readValidation(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null): LLMInputValidation {
  if (!el) {
    return { required: false, validationMessage: null, valid: true };
  }
  return {
    required: el.required,
    pattern: 'pattern' in el ? el.pattern || undefined : undefined,
    minLength: 'minLength' in el && el.minLength > 0 ? el.minLength : undefined,
    maxLength: 'maxLength' in el && el.maxLength > 0 ? el.maxLength : undefined,
    min: 'min' in el && el.min ? Number(el.min) : undefined,
    max: 'max' in el && el.max ? Number(el.max) : undefined,
    validationMessage: el.validationMessage || null,
    valid: el.validity?.valid ?? true,
  };
}

function readSelectOptions(el: HTMLElement | null): Array<{ value: string; label: string; disabled?: boolean }> | undefined {
  if (!el || el.tagName !== 'SELECT') return undefined;
  const select = el as HTMLSelectElement;
  return Array.from(select.options).map(o => ({
    value: o.value,
    label: o.textContent ?? o.value,
    disabled: o.disabled || undefined,
  }));
}

export function useLLMInput<T extends HTMLElement = HTMLInputElement>(
  options: UseLLMInputOptions
): UseLLMInputReturn<T> {
  const { registry, enabled: llmEnabled } = useLLMContext();
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
    el.setAttribute(UI_LLM_DATA_ATTRIBUTE, entryIdRef.current);
    return () => el.removeAttribute(UI_LLM_DATA_ATTRIBUTE);
  }, [ref, llmEnabled]);

  // Register on mount
  useEffect(() => {
    if (!llmEnabled) return;

    const el = ref.current;
    const inputEl = el as unknown as HTMLInputElement | null;

    const entry: LLMInputEntry = {
      id: entryIdRef.current,
      kind: 'input',
      descriptor: {
        name: options.name,
        description: options.description,
        inputType: options.inputType,
        dynamicState: options.dynamicState,
        relations: options.relations,
      },
      selector: `[${UI_LLM_DATA_ATTRIBUTE}="${entryIdRef.current}"]`,
      dataAttribute: entryIdRef.current,
      scopePath: scopePath as ScopePath,
      state: {
        visibility,
        enabled: options.enabled ?? (inputEl ? !inputEl.disabled : true),
        loading: options.loading ?? false,
        dynamicState: options.dynamicState ?? {},
      },
      tagName: el?.tagName.toLowerCase() ?? 'input',
      role: el?.getAttribute('role') ?? null,
      lastUpdated: Date.now(),
      currentValue: options.value ?? inputEl?.value ?? '',
      placeholder: inputEl?.placeholder ?? null,
      options: readSelectOptions(el),
      validation: readValidation(inputEl as HTMLInputElement | null),
      permission: options.permission,
    };

    deregisterRef.current = registry.register(entry);
    return () => {
      deregisterRef.current?.();
      deregisterRef.current = null;
    };
  }, [llmEnabled]);

  // Update value and state reactively
  useEffect(() => {
    if (!llmEnabled) return;
    const el = ref.current;
    const inputEl = el as unknown as HTMLInputElement | null;

    registry.updateValue(entryIdRef.current, options.value ?? inputEl?.value ?? '');
    registry.updateState(entryIdRef.current, {
      visibility,
      enabled: options.enabled ?? (inputEl ? !inputEl.disabled : true),
      loading: options.loading ?? false,
      dynamicState: options.dynamicState ?? {},
    });
  }, [
    options.value,
    visibility.visible,
    options.enabled,
    options.loading,
    JSON.stringify(options.dynamicState),
    llmEnabled,
  ]);

  // Update descriptor
  useEffect(() => {
    if (!llmEnabled) return;
    registry.updateDescriptor(entryIdRef.current, {
      name: options.name,
      description: options.description,
      inputType: options.inputType,
      dynamicState: options.dynamicState,
      relations: options.relations,
    });
  }, [options.name, options.description, options.inputType, llmEnabled]);

  return {
    ref,
    entryId: entryIdRef.current,
  };
}

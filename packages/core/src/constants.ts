import type { LLMCapabilities } from './types';

export const UI_LLM_VERSION = '0.1.0';
export const UI_LLM_WINDOW_KEY = '__ui_llm__' as const;
export const UI_LLM_DATA_ATTRIBUTE = 'data-llm-id';
export const UI_LLM_SCOPE_ATTRIBUTE = 'data-llm-scope';

export const UI_LLM_META_NAME = 'ui-llm' as const;
export const UI_LLM_PROTOCOL_VERSION = '1.0.0' as const;
export const UI_LLM_WELL_KNOWN_PATH = '/.well-known/ui-llm.json' as const;

export const UI_LLM_DEFAULT_CAPABILITIES: LLMCapabilities = {
  read: true,
  execute: true,
  navigate: true,
  fillInputs: true,
  dangerZone: false,
};
